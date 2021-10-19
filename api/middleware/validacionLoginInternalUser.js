const UsuariosInternos = require("../models/UsuariosInternos");
const { getMensajes } = require("../config");

exports.validarContrasenia = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("invalidPassword") });

    const regexPassword = new RegExp(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    );
    if (!regexPassword.test(password))
      return res
        .status(400)
        .send({ respuesta: await getMensajes("invalidPassword") });

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

exports.validarUsuario = async (req, res, next) => {
  try {
    const { userName } = req.body;
    if (!userName)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("invalidUserName") });

    if (userName.length < 2)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("invalidUserName") });

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

exports.validarUsuarioNoExiste = async (req, res, next) => {
  try {
    const { userName } = req.body;

    const user = await UsuariosInternos.findOne({ userName, role: { $ne: null} }).exec();

    if (user)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("userAlredyExists") });

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

exports.validarUsuarioExiste = async (req, res, next) => {
  try {
    const { userName } = req.body;

    const usuario = await UsuariosInternos.findOne({ userName }).exec();

    if (!usuario)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("invalidUserName") });

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
