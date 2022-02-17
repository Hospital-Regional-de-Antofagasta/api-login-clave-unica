const { getMensajes } = require("../config");

const handleValidationError = async (error, req, res) => {
  let errors = {};
  for (let prop in error.errors) {
    errors[prop] = error.errors[prop].message;
  }
  return res.status(400).send({
    respuesta: await getMensajes("badRequest"),
    detalles_error: errors,
  });
};

const handleDevError = async (error, req, res) => {
  return res.status(500).send({
    respuesta: await getMensajes("serverError"),
    detalles_error: {
      nombre: error.name,
      mensaje: error.message,
    },
  });
};

const handleServerError = async (error, req, res) => {
  res.status(500).send({ respuesta: await getMensajes("serverError") });
};

exports.handleError = async (error, req, res) => {
  console.log({name: error.name, message: error.message})
  if (error.name === "ValidationError")
    return await handleValidationError(error, req, res);
  if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "test")
    return await handleDevError(error, req, res);
  await handleServerError(error, req, res);
};
