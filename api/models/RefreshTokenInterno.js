const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RefreshTokenInterno = mongoose.model(
  "refresh_token_internos",
  new Schema(
    {
      user_id: { type: Schema.Types.ObjectId, ref: "usuarios_internos" },
      key: String,
      createdByIp: String,
      revoked: Date,
      revokedByIp: String,
      replacedBykey: String,
    },
    { timestamps: true }
  )
);

module.exports = RefreshTokenInterno;
