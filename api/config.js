const ConfigApiLogin = require("./models/ConfigApiLogin");

let mensajes = {
  unauthorized: "No se encuentra en los registros del hospital.",
  unauthorizedRefresh: "Su sesión ha expirado.",
  serverError: "Se produjo un error.",
};

const loadConfig = async () => {
  try {
    const config = await ConfigApiLogin.findOne({ version: 1 }).exec();
    if (config) mensajes = config.mensajes;
  } catch (error) {}
};

module.exports = {
  loadConfig,
  mensajes,
};
