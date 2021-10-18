const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UsuariosInternos = mongoose.model(
  "usuarios_internos",
  new Schema(
    {
      userName: String,
      password: String,
      salt: Buffer,
    },
    { timestamps: true }
  )
);

module.exports = UsuariosInternos;
