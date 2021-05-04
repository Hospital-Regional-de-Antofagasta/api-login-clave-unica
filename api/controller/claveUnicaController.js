const jwt = require('jsonwebtoken')
const axios = require('axios')
const { mensajes } = require('../config')

const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const redirectURI = process.env.REDIRECT_URI

const secretClaveUnica = process.env.JWT_SECRET_CLAVE_UNICA

const expiresIn = 60 * 15 * 1 * 1 // seconds, minutes, hours, days

exports.toapp = async (req, res) => {
    try {
        const { code, state } = req.query
        // await new Promise((resolve, reject) => {
        //     jwt.verify(state, secretClaveUnica, (err, decoded) => {
        //         if (err)
        //             return res.status(401).send(err)
        //         resolve(decoded)
        //     })
        // })

        console.log('hacer post')

        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
        console.log({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectURI,
            grant_type: 'authorization_code',
            code: code,
            state: state,
        })
        const params = new URLSearchParams()
            params.append('client_id', clientId)
            params.append('client_secret', clientSecret)
            params.append('redirect_uri', redirectURI)
            params.append('grant_type', 'authorization_code')
            params.append('code', code)
            params.append('state', state)

        const response = await axios.post('https://accounts.claveunica.gob.cl/openid/token/'
            , params, headers)

        res.send({
            hola: 'hola',
            responsePost: response,
        })
    } catch (error) {
        res.status(500).send(error)
    }
}

exports.datosCliente = async (req, res) => {
    try {
        const state = signToken({ }, expiresIn, secretClaveUnica)
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