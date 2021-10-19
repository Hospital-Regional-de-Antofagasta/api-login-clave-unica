const express = require("express");
const authController = require("../controller/authController");
const { isAuthenticated, hasRole } = require("../middleware/authInterno");
const {
  validarUsuario,
  validarContrasenia,
} = require("../middleware/validacionLoginInternalUser");

const router = express.Router();

router.get("", authController.loginTest);

router.post("/refresh-token", authController.refreshToken);

router.post(
  "/interno/register",
  isAuthenticated,
  hasRole(['admin']),
  validarUsuario,
  validarContrasenia,
  authController.registerInternalUser
);

router.post("/interno/login", authController.loginInternalUser);

router.post("/interno/refresh-token", authController.refreshTokenInternalUser);

module.exports = router;
