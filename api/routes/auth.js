const express = require('express')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Pacientes = require('../models/Pacientes')

const router = express.Router()

const secret = process.env.JWT_SECRET
const expiresIn = 60 * 15 * 1 * 1 // seconds, minutes, hours, days

const signToken = (_id) => {
    return jwt.sign({ _id }, secret, { expiresIn: expiresIn })
}

router.post('/login', (req, res) => {
    const { nombre, rut, token_clave_unica } = req.body
    Pacientes.findOne({ PAC_PAC_Rut: rut }).exec()
        .then(paciente => {
            if(!paciente) {
                return res.status(200).send({ respuesta: 'No se encuentra en los registros del hospital.' })
            }
            const token = signToken(paciente._id)
            return res.status(200).send(
                {
                    token: token,
                    pac_pac_numero : paciente.PAC_PAC_Numero
                    // refresh_token
                    // token_expire_in
                }
            )
        })
        .catch(error => {
            res.status(500).send({ respuesta: 'Se produjo un error.' })
        })
})

module.exports = router