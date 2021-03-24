const express = require('express')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Users = require('../models/Users')
const { isAuthenticated } = require('../auth')

const router = express.Router()

const signToken = (_id) => {
    return jwt.sign({ _id },  'mi-secreto', {
        expiresIn: 60 * 60 * 24 * 365,
    })
}

router.post('/login', (req, res) => {
    const { email, password } = req.body
    Users.findOne({ email }).exec()
        .then(user => {
            if(!user) {
                return res.send('usuario y/o contraseña incorrecta')
            }
            crypto.pbkdf2(password, user.salt, 10000, 64, 'sha1', (err, key) => {
                const encryptedPassword = key.toString('base64')
                if(user.password === encryptedPassword) {
                    const token = signToken(user._id)
                    return res.send({ token })
                }
                return res.send('usuario y/o contraseña incorrecta')
            })
        })   
})

module.exports = router