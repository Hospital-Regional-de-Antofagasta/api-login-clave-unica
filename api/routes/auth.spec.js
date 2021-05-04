const supertest = require('supertest')
const app = require('../index')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Pacientes = require('../models/Pacientes')
const RefreshToken = require('../models/RefreshToken')
const pacientesSeed = require('../testSeeds/pacientesSeed.json')
const refreshTokensSeed = require('../testSeeds/refreshTokensSeed.json')
const { mensajes } = require('../config')

const request = supertest(app)

const secret = process.env.JWT_SECRET

const secretRefreshToken = process.env.JWT_SECRET_REFRESH_TOKEN

beforeEach(async () => {
    await mongoose.disconnect()
    await mongoose.connect(`${process.env.MONGO_URI_TEST}auth_test`, { useNewUrlParser: true, useUnifiedTopology: true })
    await Pacientes.create(pacientesSeed)
    await RefreshToken.create(refreshTokensSeed)
})

afterEach(async () => {
    await Pacientes.deleteMany()
    await RefreshToken.deleteMany()
    await mongoose.connection.close()
})

const pacienteNoIngresado = {
    nombre: 'nombre',
    rut: '1-1',
    token_clave_unica: '1234',
}

const pacienteIngresado = {
    nombre: 'nombre',
    rut: '10771131-7',
    token_clave_unica: '1234',
}

describe('Endpoints auth', () => {
    describe('Generate token for user', () => {
        it('Should not generate token for paciente that does not exist', async (done) => {
            const response = await request.post('/hra/auth/login')
                .send(pacienteNoIngresado)

            expect(response.status).toBe(401)
            expect(response.body.respuesta).toBe(mensajes.unauthorized)

            done()
        })
        it('Should generate token for paciente that exists', async (done) => {
            const response = await request.post('/hra/auth/login')
                .send(pacienteIngresado)

            expect(response.status).toBe(200)
            expect(response.body.token).toBeTruthy()
            expect(response.body.refresh_token).toBeTruthy()

            done()
        })
        it('Should not generate token with empty db', async (done) => {
            await Pacientes.deleteMany()
            const response = await request.post('/hra/auth/login')
                .send(pacienteIngresado)

            expect(response.status).toBe(401)
            expect(response.body.respuesta).toBe(mensajes.unauthorized)

            done()
        })
    })
    describe('Generate new token from refresh  token', () => {
        it('Should not generate new token if there is not a refresh token', async (done) => {
            const response = await request.post('/hra/auth/refresh_token')

            expect(response.status).toBe(401)
            expect(response.body.respuesta).toBe(mensajes.unauthorizedRefresh)

            done()
        })
        it('Should not generate new token if the refresh token is invalid', async (done) => {
            const response = await request.post('/hra/auth/refresh_token')
                .send({ refresh_token: 'no-token' })

            expect(response.status).toBe(401)
            expect(response.body.respuesta).toBe(mensajes.unauthorizedRefresh)

            done()
        })
        it('Should not generate new token if the refresh token is not on the db', async (done) => {
            await RefreshToken.deleteMany()
            const refresh_token = jwt.sign({ refreshTokenKey: 'I am not in the db'}, secretRefreshToken)
            const response = await request.post('/hra/auth/refresh_token')
                .send({ refresh_token })

            expect(response.status).toBe(401)
            expect(response.body.respuesta).toBe(mensajes.unauthorizedRefresh)

            done()
        })
        it('Should not generate new token if the refresh token has been revoked', async (done) => {
            const refresh_token = jwt.sign({ refreshTokenKey: 'I am revoked' }, secretRefreshToken)
            const response = await request.post('/hra/auth/refresh_token')
                .send({ refresh_token })

            expect(response.status).toBe(401)
            expect(response.body.respuesta).toBe(mensajes.unauthorizedRefresh)

            done()
        })
        it('Should generate new token', async (done) => {
            const refresh_token = jwt.sign({ refreshTokenKey: 'I am a valid key'}, secretRefreshToken)
            const response = await request.post('/hra/auth/refresh_token')
                .send({ refresh_token })

            expect(response.status).toBe(200)
            expect(response.body.token).toBeTruthy()
            expect(response.body.refresh_token).toBeTruthy()

            done()
        })
    })
})
