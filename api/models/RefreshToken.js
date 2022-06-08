const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RefreshToken = mongoose.model(
  "refresh_token",
  new Schema(
    {
      rutPaciente: { type: String, required: true },
      key: String,
      created: { type: Date, default: Date.now },
      createdByIp: String,
      revoked: Date,
      revokedByIp: String,
      replacedBykey: String,
    },
    { timestamps: true }
  )
);

module.exports = RefreshToken;
