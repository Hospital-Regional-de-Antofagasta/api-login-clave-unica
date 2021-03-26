const express = require('express')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Pacientes = require('../models/Paciente')

const router = express.Router()

const secret = 'mi-secreto'
const expiresIn = 60 * 15 * 1 * 1 // seconds, minutes, hours, days

const signToken = (_id) => {
    return jwt.sign(
        { 
            _id 
        },  
        secret, 
        {
            expiresIn: expiresIn,
        }
    )
}

router.post('/login', async (req, res) => {
    const { nombre, rut, token } = req.body
    try {
        await Pacientes.findOne({ PAC_PAC_Rut: rut }).exec()
            .then(paciente => { // investigar promise para remplazar el then
                if(!paciente) {
                    return res.status(403).send({ respuesta: 'No se encuentra en los registros del hospital.' })
                }
                const token = signToken(paciente._id)
                return res.status(200).send(
                    { 
                        token: token,
                        paciente_id :paciente._id
                        // refresh_token
                        // token_expire_in
                    }
                )
            })  
    }
    catch (error) {
        res.status(500).send({ respuesta: 'Se produjo un error.' })
    } 
})

module.exports = router