const jwt = require('jsonwebtoken')
const Pacientes = require('../models/Pacientes')
const { mensajesLogin } = require('../config')

const secret = process.env.JWT_SECRET

const expiresIn = 60 * 15 * 1 * 1 // seconds, minutes, hours, days

const signToken = (_id, PAC_PAC_Numero) => {
    return jwt.sign({ _id, PAC_PAC_Numero },secret,{ expiresIn: expiresIn })
}

exports.login = async (req, res) => {
    try {
        // recibir datos que entrega la clave unica
        const { nombre, rut, token_clave_unica } = req.body
        // TODO: validar que el token de la clave unica sea real
        const paciente = await Pacientes.findOne({ PAC_PAC_Rut: rut }).exec()
        if(!paciente) {
            return res.status(403).send({ respuesta: mensajesLogin.forbiddenAccess })
        }
        const token = signToken(paciente._id, paciente.PAC_PAC_Numero)
        return res.status(200).send(
            {
                token: token,
                refresh_token: token,
            }
        )
    } catch (error) {
        res.status(500).send({ respuesta: mensajesLogin.serverError })
    }
}