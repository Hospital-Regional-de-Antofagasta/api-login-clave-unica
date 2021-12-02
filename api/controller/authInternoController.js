const { v4: uuidv4 } = require("uuid");
const UsuariosInternos = require("../models/UsuariosInternos");
const RefreshTokenInterno = require("../models/RefreshTokenInterno");
const { getMensajes } = require("../config");
const {
  signToken,
  decodeToken,
  randomBytes,
  pbkdf2,
} = require("../utils/auth");

const secretTokenInterno = process.env.JWT_SECRET_INTERNO;

const secretRefreshTokenInterno = process.env.JWT_SECRET_REFRESH_TOKEN_INTERNO;

// seconds, minutes, hours, days
const expiresIn = 60 * 15 * 1 * 1;

// seconds, minutes, hours, days
const refreshTokenExpiresIn = 60 * 60 * 24 * 365;

exports.registerInternalUser = async (req, res) => {
  try {
    const { userName, password } = req.body;

    const newSalt = await randomBytes(16);

    const key = await pbkdf2(password, newSalt, 10000, 64, "sha256");

    const encryptedPassword = key.toString("base64");

    const user = await UsuariosInternos.findOne({ userName }).exec();

    if (!user) {
      await UsuariosInternos.create({
        userName,
        password: encryptedPassword,
        salt: newSalt,
      });
    } else {
      await UsuariosInternos.updateOne({ userName }, { role: "user" }).exec();
    }

    res.status(201).send({ respuesta: await getMensajes("userCreated") });
  } catch (error) {
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

// exports.getInternalUser = async (req, res) => {}

// exports.updateInternalUser = async (req, res) => {}

exports.changePasswordInternalUser = async (req, res) => {
  try {
    const { userName } = req.params;
    const { password } = req.body;

    const newSalt = await randomBytes(16);

    const key = await pbkdf2(password, newSalt, 10000, 64, "sha256");

    const encryptedPassword = key.toString("base64");

    await UsuariosInternos.updateOne(
      { userName },
      {
        password: encryptedPassword,
        salt: newSalt,
      }
    );

    res.status(200).send({ respuesta: await getMensajes("passwordChanged") });
  } catch (error) {
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

exports.deleteInternalUser = async (req, res) => {
  try {
    const { userName } = req.params;
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const usuario = await UsuariosInternos.findOne({ userName }).exec();

    const refreshToken = await RefreshTokenInterno.findOne({
      user_id: usuario._id,
      revoked: null,
    }).exec();

    if (refreshToken) {
      refreshToken.revoked = Date.now();
      refreshToken.revokedByIp = ipAddress;
      refreshToken.replacedByKey = null;

      await refreshToken.save();
    }

    await UsuariosInternos.updateOne({ userName }, { role: null });

    res.status(200).send({ respuesta: await getMensajes("userDeleted") });
  } catch (error) {
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

exports.loginInternalUser = async (req, res, next) => {
  try {
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const { userName, password } = req.body;

    const user = await UsuariosInternos.findOne({ userName }).exec();

    if (!user)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("invalidLoginData") });

    const key = await pbkdf2(password, user.salt, 10000, 64, "sha256");

    const encryptedPassword = key.toString("base64");

    if (user.password !== encryptedPassword)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("invalidLoginData") });

    const token = signToken(
      {
        user: {
          _id: user._id,
          userName: user.userName,
          role: user.role,
        },
      },
      expiresIn,
      secretTokenInterno
    );

    const refreshTokenKey = uuidv4();

    const oldRefreshToken = await RefreshTokenInterno.findOne({
      user: user._id,
      revoked: null,
    }).exec();

    if (oldRefreshToken) {
      oldRefreshToken.revoked = Date.now();
      oldRefreshToken.revokedByIp = ipAddress;
      oldRefreshToken.replacedByKey = refreshTokenKey;
      await oldRefreshToken.save();
    }

    const refreshToken = signToken(
      { refreshTokenKey },
      refreshTokenExpiresIn,
      secretRefreshTokenInterno
    );

    await saveRefreshTokenInterno(refreshTokenKey, user, ipAddress);

    // token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    req.response = {
      token: token,
      role: user.role,
    };

    next();
  } catch (error) {
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

exports.sendResponse = async (req, res) => {
  res.status(200).send(req.response);
};

exports.refreshTokenInternalUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    if (!refreshToken)
      return res.status(401).send({
        respuesta: await getMensajes("unauthorizedRefresh"),
      });

    const decodedRefreshToken = await decodeToken(
      refreshToken,
      secretRefreshTokenInterno
    );

    if (!decodedRefreshToken) {
      res.clearCookie("refreshToken");
      return res.status(401).send({
        respuesta: await getMensajes("unauthorizedRefresh"),
      });
    }

    const { refreshTokenKey } = decodedRefreshToken;

    const oldRefreshToken = await RefreshTokenInterno.findOne({
      key: refreshTokenKey,
    }).exec();

    if (!oldRefreshToken) {
      res.clearCookie("refreshToken");
      return res.status(401).send({
        respuesta: await getMensajes("unauthorizedRefresh"),
      });
    }

    const { user_id } = oldRefreshToken;

    const user = await UsuariosInternos.findById(user_id).exec();

    if (!user) {
      res.clearCookie("refreshToken");
      return res
        .status(401)
        .send({ respuesta: await getMensajes("unauthorized") });
    }

    if (oldRefreshToken.revoked) {
      res.clearCookie("refreshToken");
      return res.status(401).send({
        respuesta: await getMensajes("unauthorizedRefresh"),
      });
    }

    const newRefreshTokenKey = uuidv4();

    oldRefreshToken.revoked = Date.now();
    oldRefreshToken.revokedByIp = ipAddress;
    oldRefreshToken.replacedByKey = newRefreshTokenKey;

    await oldRefreshToken.save();

    const newRefreshToken = signToken(
      {
        refreshTokenKey: newRefreshTokenKey,
      },
      refreshTokenExpiresIn,
      secretRefreshTokenInterno
    );

    await saveRefreshTokenInterno(newRefreshTokenKey, user, ipAddress);

    const token = signToken(
      {
        user: {
          _id: user._id,
          userName: user.userName,
          role: user.role,
        },
      },
      expiresIn,
      secretTokenInterno
    );

    // token
    res
      .status(200)
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .send({
        token: token,
        role: user.role,
      });
  } catch (error) {
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

const saveRefreshTokenInterno = async (key, user, ipAddress) => {
  const refreshToken = {
    user_id: user._id,
    key: key,
    createdByIp: ipAddress,
  };
  await RefreshTokenInterno.create(refreshToken);
  return refreshToken;
};
