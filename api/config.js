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
  invalidLoginData: {
    titulo: "Usuario o contraseña incorrectos",
    mensaje: "El usuario o contraseña ingresados son incorrectos.",
    color: "",
    icono: "",
  },
  invalidUserName: {
    titulo: "Usuario incorrecto",
    mensaje: "El usuario debe tener al menos 2 caracteres.",
    color: "",
    icono: "",
  },
  invalidPassword: {
    titulo: "Contraseña incorrecta",
    mensaje: "La contraseña debe tener al menos un número, una letra mayuscula, una letra minuscula, un caracter especial(@$!%*?&) y al menos 8 caracteres.",
    color: "",
    icono: "",
  },
  userCreated: {
    titulo: "Usuario creado",
    mensaje: "El usuario fue creado con éxito",
    color: "",
    icono: "",
  },
  userAlredyExists: {
    titulo: "Usuario incorrecto",
    mensaje: "El usuario ingresado ya existe.",
    color: "",
    icono: "",
  },
  forbiddenAccess: {
    titulo: "Acceso Denegado",
    mensaje: "Su sesión ha expirado.",
    color: "",
    icono: "",
  },
  insufficientPermission: {
    titulo: "Acceso Denegado",
    mensaje: "No tiene los permisos para realizar esta acción.",
    color: "",
    icono: "",
  },
  passwordChanged: {
    titulo: "Contraseña modificada",
    mensaje: "La contraseña fue modificada con éxito.",
    color: "",
    icono: "",
  },
  userDeleted: {
    titulo: "Usuario eliminado",
    mensaje: "El usuario fue eliminado con éxito.",
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
