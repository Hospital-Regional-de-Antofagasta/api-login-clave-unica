const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConfigApiLogin = mongoose.model(
  "config_api_login",
  new Schema({
    mensajes: {
      unauthorized: String,
      unauthorizedRefresh: String,
      serverError: String,
    },
  }),
  "config_api_login"
);

module.exports = ConfigApiLogin;
