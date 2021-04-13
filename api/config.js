const ConfigApiLogin = require('./models/ConfigApiLogin')

let mensajesLogin = {
    forbiddenAccess: 'No se encuentra en los registros del hospital.',
    serverError: 'Se produjo un error.',
}

const loadConfig = async () => {
    try {
        const config = await ConfigApiLogin.findOne().exec()
        mensajesLogin = config.mensajesLogin
    } catch (error) {

    }
}

module.exports = {
    loadConfig,
    mensajesLogin
 }