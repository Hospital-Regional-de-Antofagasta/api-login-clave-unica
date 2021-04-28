const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const Pacientes = require('../models/Pacientes')
const RefreshToken = require('../models/RefreshToken')
const { mensajes } = require('../config')

const secret = process.env.JWT_SECRET

// const expiresIn = 60 * 15 * 1 * 1 // seconds, minutes, hours, days
const expiresIn = 60 * 2 * 1 * 1 // seconds, minutes, hours, days

const refreshTokenExpiresIn = 60 * 60 * 24 * 365 // seconds, minutes, hours, days

exports.login = async (req, res) => {
    try {
        const { nombre, rut, token_clave_unica } = req.body
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        // TODO: validar que el token de la clave unica sea real
        const paciente = await Pacientes.findOne({ PAC_PAC_Rut: rut }).exec()

        if (!paciente) return res.status(401).send({ respuesta: mensajes.unauthorized })

        const token = signToken({
            _id: paciente._id,
            PAC_PAC_Numero: paciente.PAC_PAC_Numero
        }, expiresIn)

        const refreshTokenKey = uuidv4()

        const oldRefreshToken = await RefreshToken.findOne({ paciente: paciente._id, revoked: null }).exec()

        if (oldRefreshToken) {
            oldRefreshToken.revoked = Date.now()
            oldRefreshToken.revokedByIp = ipAddress
            oldRefreshToken.replacedByKey = refreshTokenKey
            await oldRefreshToken.save()
        }

        const refreshToken = signToken({ refreshTokenKey }, refreshTokenExpiresIn)
        await saveRefreshToken(refreshTokenKey, paciente, ipAddress)

        return res.status(200).send(
            {
                token: token,
                refresh_token: refreshToken, // si se hace la version web falta el httpOnly cookie
            }
        )
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError })
    }
}

exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.body.refresh_token
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress

        if (!refreshToken)
            return res.status(401).send({ respuesta: mensajes.unauthorizedRefresh })

        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(refreshToken, secret, (err, decoded) => {
                if (err)
                    return res.status(401).send({ respuesta: mensajes.unauthorizedRefresh })
                resolve(decoded)
            })
        })

        const { refreshTokenKey } = decoded

        const oldRefreshToken = await RefreshToken.findOne({ key: refreshTokenKey }).exec()

        if (!oldRefreshToken)
            return res.status(401).send({ respuesta: mensajes.unauthorizedRefresh })

        const { paciente } = oldRefreshToken

        if (oldRefreshToken.revoked)
            return res.status(401).send({ respuesta: mensajes.unauthorizedRefresh })

        const newRefreshTokenKey = uuidv4()

        oldRefreshToken.revoked = Date.now()
        oldRefreshToken.revokedByIp = ipAddress
        oldRefreshToken.replacedByKey = newRefreshTokenKey
        await oldRefreshToken.save()

        const newRefreshToken = signToken({ newRefreshTokenKey }, refreshTokenExpiresIn)
        await saveRefreshToken(newRefreshTokenKey, paciente, ipAddress)

        const token = signToken({
            _id: paciente._id,
            PAC_PAC_Numero: paciente.PAC_PAC_Numero
        }, expiresIn)

        return res.status(200).send(
            {
                token: token,
                refresh_token: newRefreshToken, // si se hace la version web falta el httpOnly cookie
            }
        )
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError })
    }
}

const signToken = (content, expiresIn) => {
    return jwt.sign(content, secret, { expiresIn: expiresIn })
}

const saveRefreshToken = async (key, paciente, ipAddress) => {
    const refreshToken = {
        paciente: paciente._id,
        key: key,
        createdByIp: ipAddress,
    }
    await RefreshToken.create(refreshToken)
    return refreshToken
}