const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ConfigApiLogin = mongoose.model('config_api_login', new Schema ({
    mensajesLogin: {
        forbiddenAccess: String,
        serverError: String,
    }
}))

module.exports = ConfigApiLogin