const ConfigApiLogin = require("./models/ConfigApiLogin");

const mensajesPorDefecto = {
  unauthorized: {
    titulo: "Alerta",
    mensaje: "No se encuentra en los registros del hospital.",
    color: "",
    icono: "",
  },
  unauthorizedRefresh: {
    titulo: "Alerta",
    mensaje: "Su sesión ha expirado.",
    color: "",
    icono: "",
  },
  serverError: {
    titulo: "Alerta",
    mensaje: "Ocurrió un error inesperado.",
    color: "",
    icono: "",
  },
};

exports.getMensajes = async (tipo) => {
  try {
    const { mensajes } = await ConfigApiLogin.findOne({ version: 1 }).exec();
    if (mensajes) {
      return mensajes[tipo];
    }
    return mensajesPorDefecto[tipo];
  } catch (error) {
    return mensajesPorDefecto[tipo];
  }
};
