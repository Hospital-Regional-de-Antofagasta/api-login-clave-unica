const express = require("express");
const claveUnicaController = require("../controller/claveUnicaController");
const authController = require("../controller/authController");

const router = express.Router();

router.get("/datos-conexion", claveUnicaController.datosCliente);

router.get("", claveUnicaController.toapp, authController.login);

module.exports = router;
