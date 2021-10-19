const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Pacientes = require("../models/Pacientes");
const RefreshToken = require("../models/RefreshToken");
const UsuariosInternos = require("../models/UsuariosInternos");
const RefreshTokenInterno = require("../models/RefreshTokenInterno");
const { getMensajes } = require("../config");

const secretToken = process.env.JWT_SECRET;

const secretTokenInterno = process.env.JWT_SECRET_INTERNO;

const secretRefreshToken = process.env.JWT_SECRET_REFRESH_TOKEN;

const secretRefreshTokenInterno =
  process.env.JWT_SECRET_REFRESH_TOKEN_INTERNO;

// seconds, minutes, hours, days
const expiresIn = 60 * 15 * 1 * 1;

// seconds, minutes, hours, days
const refreshTokenExpiresIn = 60 * 60 * 24 * 365;

exports.loginTest = async (req, res) => {
  try {
    const rut = req.query.rut ? req.query.rut : "88888888-8";
    const expiresInTesting = req.query.tiempoToken
      ? req.query.tiempoToken
      : expiresIn;

    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const paciente = await validarPaciente(rut);

    if (!paciente)
      return res.status(401).send({
        respuesta: await getMensajes("unauthorized"),
      });

    const token = signToken(
      {
        _id: paciente._id,
        numeroPaciente: paciente.numeroPaciente,
      },
      expiresInTesting,
      secretToken
    );

    const refreshTokenKey = uuidv4();

    const oldRefreshToken = await RefreshToken.findOne({
      paciente: paciente._id,
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
      secretRefreshToken
    );
    await saveRefreshToken(refreshTokenKey, paciente, ipAddress);

    const nombrePaciente = paciente.nombreSocial
      ? [
          paciente.nombreSocial,
          paciente.apellidoPaterno,
          paciente.apellidoMaterno,
        ]
      : [paciente.nombre, paciente.apellidoPaterno, paciente.apellidoMaterno];

    // si se hace la version web falta el httpOnly cookie en el refresh
    // token
    res.status(200).send({
      token: token,
      refresh_token: refreshToken,
      nombre_completo: nombrePaciente,
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

exports.login = async (req, res) => {
  try {
    const { rut } = req.body;

    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const paciente = await validarPaciente(rut);

    if (!paciente)
      return res.status(401).send({
        respuesta: await getMensajes("unauthorized"),
      });

    const token = signToken(
      {
        _id: paciente._id,
        numeroPaciente: paciente.numeroPaciente,
      },
      expiresIn,
      secretToken
    );

    const refreshTokenKey = uuidv4();

    const oldRefreshToken = await RefreshToken.findOne({
      paciente: paciente._id,
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
      secretRefreshToken
    );
    await saveRefreshToken(refreshTokenKey, paciente, ipAddress);

    const nombrePaciente = paciente.nombreSocial
      ? [
          paciente.nombreSocial,
          paciente.apellidoPaterno,
          paciente.apellidoMaterno,
        ]
      : [paciente.nombre, paciente.apellidoPaterno, paciente.apellidoMaterno];

    // si se hace la version web falta el httpOnly cookie en el refresh
    // token
    res.status(200).send({
      token: token,
      refresh_token: refreshToken,
      nombre_completo: nombrePaciente,
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

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refresh_token;
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    if (!refreshToken)
      return res.status(401).send({
        respuesta: await getMensajes("unauthorizedRefresh"),
      });

    const decodedRefreshToken = await decodeToken(
      refreshToken,
      secretRefreshToken
    );

    if (!decodedRefreshToken)
      return res.status(401).send({
        respuesta: await getMensajes("unauthorizedRefresh"),
      });

    const { refreshTokenKey } = decodedRefreshToken;

    const oldRefreshToken = await RefreshToken.findOne({
      key: refreshTokenKey,
    }).exec();

    if (!oldRefreshToken)
      return res.status(401).send({
        respuesta: await getMensajes("unauthorizedRefresh"),
      });

    const { paciente_id } = oldRefreshToken;

    const paciente = await Pacientes.findById(paciente_id).exec();

    if (!paciente)
      return res
        .status(401)
        .send({ respuesta: await getMensajes("unauthorized") });

    if (oldRefreshToken.revoked)
      return res.status(401).send({
        respuesta: await getMensajes("unauthorizedRefresh"),
      });

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
      secretRefreshToken
    );

    await saveRefreshToken(
      newRefreshTokenKey,
      paciente,
      ipAddress
    );

    const token = signToken(
      {
        _id: paciente._id,
        numeroPaciente: paciente.numeroPaciente,
      },
      expiresIn,
      secretToken
    );

    // si se hace la version web falta el httpOnly cookie para el refresh
    // token
    res.status(200).send({
      token: token,
      refresh_token: newRefreshToken,
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

exports.registerInternalUser = async (req, res) => {
  try {
    const { userName, password } = req.body;

    const newSalt = await randomBytes(16);

    const key = await pbkdf2(password, newSalt, 10000, 64, "sha256");

    const encryptedPassword = key.toString("base64");

    await UsuariosInternos.create({
      userName,
      password: encryptedPassword,
      salt: newSalt,
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

exports.loginInternalUser = async (req, res) => {
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

    // res.send({ token });

    const token = signToken(
      {
        _id: user._id
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
      secretRefreshToken
    );

    await saveRefreshTokenInterno(
      refreshTokenKey,
      user,
      ipAddress
    );

    // token
    res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .send({
        token: token,
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

    await saveRefreshTokenInterno(
      newRefreshTokenKey,
      user,
      ipAddress
    );

    const token = signToken(
      {
        _id: user._id
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

const saveRefreshToken = async (key, paciente, ipAddress) => {
  const refreshToken = {
    paciente_id: paciente._id,
    key: key,
    createdByIp: ipAddress,
  };
  await RefreshToken.create(refreshToken);
  return refreshToken;
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

const validarPaciente = async (rut) => {
  let paciente = await Pacientes.findOne({ rut: rut }).exec();
  if (!paciente) {
    // los ruts tienen un 0 adelante a veces
    rut = `0${rut}`;
    paciente = await Pacientes.findOne({ rut: rut }).exec();
  }
  return paciente;
};

const signToken = (content, expiresIn, secret) => {
  return jwt.sign(content, secret, { expiresIn: expiresIn });
};

const decodeToken = async (token, secret) => {
  const result = await new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return resolve(false);
      return resolve(decoded);
    });
  });
  return result;
};

const randomBytes = async (size) => {
  const result = await new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, salt) => {
      if (err) return resolve(false);
      return resolve(salt);
    });
  });
  return result;
};

const pbkdf2 = async (password, salt, iterations, keylen, digest) => {
  const result = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, key) => {
      if (err) return resolve(false);
      return resolve(key);
    });
  });
  return result;
};
