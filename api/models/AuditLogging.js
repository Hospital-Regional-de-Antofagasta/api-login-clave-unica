const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const actions = [
  "/v1/auth-interno/registrar",
  "/v1/auth-interno/cambiar-contrasenia/:userName",
  "/v1/auth-interno/eliminar-usuario/:userName"
];

const UsuariosInternos = mongoose.model(
  "audit_logging",
  new Schema(
    {
      userName: { type: String, required: true },
      userId: { type: String, required: true },
      action: { type: String, required: true, enum: actions },
      affectedData: { type: Object },
    },
    { timestamps: true }
  ),
  "audit_logging"
);

module.exports = UsuariosInternos;
