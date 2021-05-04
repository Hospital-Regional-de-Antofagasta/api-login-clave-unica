const jwt = require('jsonwebtoken')
const { mensajes } = require('../config')

const clientId = process.env.CLIENT_ID

const secretClaveUnica = process.env.JWT_SECRET_CLAVE_UNICA

const expiresIn = 60 * 15 * 1 * 1 // seconds, minutes, hours, days

exports.datosCliente = async (req, res) => {
    try {
        const state = signToken({ clientId }, expiresIn, secretClaveUnica)
        res.status(200).send({
            clientId,
            state,
        })
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError})
    }
}

const signToken = (content, expiresIn, secret) => {
    return jwt.sign(content, secret, { expiresIn: expiresIn })
}