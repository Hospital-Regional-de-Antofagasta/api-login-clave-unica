const supertest = require('supertest')
const app = require('../index')
const jwt = require('jsonwebtoken')
const { mensajes } = require('../config')

const request = supertest(app)

const clientId = process.env.CLIENT_ID

const secretClaveUnica = process.env.JWT_SECRET_CLAVE_UNICA

describe('Endpoints clave unica', () => {
    describe('Generate state token and return client_id', () => {
        it('Should generate state token and return client_id', async (done) => {
            const response = await request.get('/hra/clave_unica/datos_clave_unica')

            expect(response.status).toBe(200)
            expect(response.body.clientId).toBeTruthy()
            expect(response.body.state).toBeTruthy()

            done()
        })
    })
})
