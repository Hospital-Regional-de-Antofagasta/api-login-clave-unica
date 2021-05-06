const express = require("express");
const claveUnicaController = require("../controller/claveUnicaController");
const authController = require("../controller/authController");

const router = express.Router();

router.get(
  "/datos_clave_unica",
  claveUnicaController.datosCliente,
  authController.login
);

router.get("/", claveUnicaController.toapp);

module.exports = router;
