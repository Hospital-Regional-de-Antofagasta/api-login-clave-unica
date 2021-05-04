const express = require('express')
const claveUnicaController = require('../controller/claveUnicaController')

const router = express.Router()

router.get('/datos_clave_unica', claveUnicaController.datosCliente)

router.get('/', claveUnicaController.toapp)

module.exports = router