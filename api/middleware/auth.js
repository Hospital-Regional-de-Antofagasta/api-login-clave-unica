const jwt = require('jsonwebtoken')
const Pacientes = require('../models/Pacientes')

const secret = 'mi-secreto'

const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization
    if(!token) {
        return res.sendStatus(403)
    }
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.sendStatus(403)
        }
        const { _id } = decoded
        Pacientes.findOne({ _id }).exec()
            .then(paciente => {
                req.paciente = paciente
                next()
            })
    })
}

module.exports = isAuthenticated