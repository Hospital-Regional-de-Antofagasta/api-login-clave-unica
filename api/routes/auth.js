const express = require("express");
const authController = require("../controller/authController");
const {
  validarUsuario,
  validarContrasenia,
} = require("../middleware/validacionLoginInternalUser");

const router = express.Router();

router.get("", authController.loginTest);

router.post("/refresh-token", authController.refreshToken);

router.post(
  "/interno/register",
  validarUsuario,
  validarContrasenia,
  authController.registerInternalUser
);

router.post("/interno/login", authController.loginInternalUser);

router.post("/interno/refresh-token", authController.refreshTokenInternalUser);

module.exports = router;
