const jwt = require("jsonwebtoken");
const { getMensajes } = require("../config");
const UsuariosInternos = require("../models/UsuariosInternos");

const secreto = process.env.JWT_SECRET_INTERNO;

exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .send({ respuesta: await getMensajes("forbiddenAccess") });
    }

    jwt.verify(token, secreto, async (error, decoded) => {
      if (error)
        return res
          .status(401)
          .send({ respuesta: await getMensajes("forbiddenAccess") });

      const { user } = decoded;
      req.user = user;

      next();
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

exports.hasRole = (roles) => async (req, res, next) => {
  try {
    if (roles.indexOf(req.user.role) > -1) {
      return next();
    }
    return res
      .status(401)
      .send({ respuesta: await getMensajes("insufficientPermission") });
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
