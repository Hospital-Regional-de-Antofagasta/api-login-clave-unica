const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RefreshToken = mongoose.model('refresh_token', new Schema({
    paciente: { type: Schema.Types.ObjectId, ref: 'paciente' },
    key: String,
    created: { type: Date, default: Date.now },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedBykey: String,
}))

module.exports = RefreshToken