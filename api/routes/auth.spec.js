const supertest = require('supertest')
const app = require('../index')
const mongoose = require('mongoose')
const Pacientes = require('../models/Pacientes')
const pacientesSeed = require('../testSeeds/pacientesSeed.json')

const request = supertest(app)

const token = process.env.HRADB_A_MONGODB_SECRET

beforeEach(async () => {
    await mongoose.disconnect()
    // conectarse a la bd de testing
    await mongoose.connect(`${process.env.MONGO_URI_TEST}auth_test`, { useNewUrlParser: true, useUnifiedTopology: true })
    // cargar los seeds a la bd
    for (const pacienteSeed of pacientesSeed) {
      await Pacientes.create(pacienteSeed)
    }
});

afterEach(async () => {
    // borrar el contenido de la colleccion en la bd
    await Pacientes.deleteMany()
    // cerrar la coneccion a la bd
    await mongoose.connection.close()
})

// paciente para realizar las pruebas
const pacienteNoIngresado = {
    nombre: 'nombre',
    rut: '1-1',
    token_clave_unica: '1234',
}

// paciente para realizar las pruebas
const pacienteIngresado = {
    nombre: 'nombre',
    rut: '10771131-7',
    token_clave_unica: '1234',
}

describe('Endpoints auth', () => {
    describe('Generate token for user', () => {
        // test si no es paciente
        it('Should not generate token', async (done) => {
            // ejecutar endpoint
            const response = await request.post('/hra/auth/login')
                .send(pacienteNoIngresado)
            // verificar que retorno el status code correcto
            expect(response.status).toBe(403)
            expect(response.body.respuesta).toBeTruthy()

            done()
        })
        // test si es paciente
        it('Should generate token', async (done) => {
            // ejecutar endpoint
            const response = await request.post('/hra/auth/login')
                .send(pacienteIngresado)
            // verificar que retorno el status code correcto
            expect(response.status).toBe(200)
            expect(response.body.token).toBeTruthy()

            done()
        })
        // test si bd vacia
        it('Should not generate token', async (done) => {
            // borrar pacientes bd
            await Pacientes.deleteMany()
            // ejecutar endpoint
            const response = await request.post('/hra/auth/login')
                .send(pacienteIngresado)
            // verificar que retorno el status code correcto
            expect(response.status).toBe(403)
            expect(response.body.respuesta).toBeTruthy()
            expect(response.body.respuesta).toBe(mensajesLogin.forbiddenAccess)

            done()
        })
    })
})
