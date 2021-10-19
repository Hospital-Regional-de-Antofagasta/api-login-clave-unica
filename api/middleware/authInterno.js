const jwt = require("jsonwebtoken");
const { getMensajes } = require("../config");

const secreto = process.env.JWT_SECRET_INTERNO;

exports.isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .send({ respuesta: await getMensajes("forbiddenAccess") });
  }

  jwt.verify(token, secreto, async (error, decoded) => {
    if (error) {
      return res
        .status(401)
        .send({ respuesta: await getMensajes("forbiddenAccess") });
    }

    const { _id, numeroPaciente } = decoded;
    req.idPaciente = _id;
    req.numeroPaciente = numeroPaciente;

    next();
  });
};