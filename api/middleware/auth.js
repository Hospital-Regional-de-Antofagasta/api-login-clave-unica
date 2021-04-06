const jwt = require('jsonwebtoken')
const Pacientes = require('../models/Pacientes')

const secret = process.env.JWT_SECRET

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
        req.idPaciente = _id
        next()
    })
}

module.exports = isAuthenticated