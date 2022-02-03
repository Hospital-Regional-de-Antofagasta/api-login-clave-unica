const { getMensajes } = require("../config");

exports.manejarError = async (error, req, res) => {
  if (error.name === "ValidationError") {
    let errors = {};
    for (let prop in error.errors) {
      errors[prop] = error.errors[prop].message;
    }
    return res
      .status(400)
      .send({
        respuesta: await getMensajes("badRequest"),
        detalles_error: errors,
      });
  }
  if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "test")
    return res.status(500).send({
      respuesta: await getMensajes("serverError"),
      detalles_error: {
        nombre: error.name,
        mensaje: error.message,
      },
    });
  res.status(500).send({ respuesta: await getMensajes("serverError") });
}