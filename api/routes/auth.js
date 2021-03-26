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

router.post('/login', (req, res) => {
    const { nombre, rut } = req.body
    console.log(rut)
    Pacientes.findOne({ PAC_PAC_Rut: rut }).exec()
        .then(paciente => {
            if(!paciente) {
                return res.status(403).send('Warning! Autodestrucción iniciada')
            }
            const token = signToken(paciente._id)
            return res.status(200).send(
                { 
                    token 
                    // refresh_token
                    // token_expire_in
                }
            )
        })   
})

module.exports = router