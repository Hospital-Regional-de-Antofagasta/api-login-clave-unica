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
const { handleError } = require("../utils/errorHandler");
const { registerAuditLog } = require("../utils/auditLogController");

const secretTokenInterno = process.env.JWT_SECRET_INTERNO;

const secretRefreshTokenInterno = process.env.JWT_SECRET_REFRESH_TOKEN_INTERNO;

// seconds, minutes, hours, days
const expiresIn = 60 * 15 * 1 * 1;

// seconds, minutes, hours, days
const refreshTokenExpiresIn = 60 * 60 * 24 * 365;

exports.addDefaultUser = async (req, res) => {
  try {
    const adminUser = await UsuariosInternos.findOne({ role: "admin" }).exec();

    if (adminUser)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("adminExists") });

    const adminHrapp = await UsuariosInternos.findOne({
      userName: "adminHrapp",
    }).exec();

    if (adminHrapp)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("userAlredyExists") });

    const userName = "adminHrapp";
    const password = "Hetm!2021";

    const newSalt = await randomBytes(16);

    const key = await pbkdf2(password, newSalt, 10000, 64, "sha256");

    const encryptedPassword = key.toString("base64");

    await UsuariosInternos.create({
      userName,
      password: encryptedPassword,
      salt: newSalt,
      role: "admin",
    });

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

exports.registerInternalUser = async (req, res) => {
  try {
    const { userName, password } = req.body;

    const newSalt = await randomBytes(16);

    const key = await pbkdf2(password, newSalt, 10000, 64, "sha256");

    const encryptedPassword = key.toString("base64");

    let user = await UsuariosInternos.findOne({ userName }).exec();

    if (!user) {
      user = await UsuariosInternos.create({
        userName,
        password: encryptedPassword,
        salt: newSalt,
      });
    } else {
      await UsuariosInternos.updateOne({ userName }, { role: "user" }).exec();
    }

    await registerAuditLog(
      req.user.userName,
      req.user._id,
      "/v1/auth-interno/registrar",
      { userName }
    );

    res.status(201).send({ respuesta: await getMensajes("userCreated") });
  } catch (error) {
    await handleError(error, req, res);
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

    await registerAuditLog(
      req.user.userName,
      req.user._id,
      "/v1/auth-interno/cambiar-contrasenia/:userName",
      { userName }
    );

    res.status(200).send({ respuesta: await getMensajes("passwordChanged") });
  } catch (error) {
    await handleError(error, req, res);
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

    await registerAuditLog(
      req.user.userName,
      req.user._id,
      "/v1/auth-interno/eliminar-usuario/:userName",
      { userName }
    );

    res.status(200).send({ respuesta: await getMensajes("userDeleted") });
  } catch (error) {
    await handleError(error, req, res);
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

    req.refreshToken = refreshToken;
    req.token = token;
    req.role = user.role;

    next();
  } catch (error) {
    await handleError(error, req, res);
  }
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

    req.refreshToken = newRefreshToken;
    req.token = token;
    req.role = user.role;

    next();
  } catch (error) {
    await handleError(error, req, res);
  }
};

exports.addCookie = async (req, res, next) => {
  const refreshToken = req.refreshToken;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    overwrite: true,
  });

  next();
};

exports.sendToken = async (req, res, next) => {
  const response = {
    token: req.token,
    role: req.role,
  };

  res.status(200).send(response);
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
