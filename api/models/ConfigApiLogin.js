const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConfigApiLogin = mongoose.model(
  "config_api_login",
  new Schema({
    mensajes: {
      unauthorized: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      unauthorizedRefresh: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      serverError: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      invalidLoginData: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      invalidUserName: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      invalidPassword: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      userCreated: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      userAlredyExists: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      forbiddenAccess: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
    },
    version: Number,
  }),
  "config_api_login"
);

module.exports = ConfigApiLogin;
