const express = require("express");
const authInternoController = require("../controller/authInternoController");
const { isAuthenticated, hasRole } = require("../middleware/authInterno");
const {
  validarUsuario,
  validarContrasenia,
  validarUsuarioNoExiste,
} = require("../middleware/validacionLoginInternalUser");

const router = express.Router();

router.post(
  "/registrar",
  isAuthenticated,
  hasRole(["admin"]),
  validarUsuario,
  validarUsuarioNoExiste,
  validarContrasenia,
  authInternoController.registerInternalUser
);

// router.get(
//   "",
//   isAuthenticated,
//   hasRole(["user"]),
//   authInternoController.getInternalUser
// );

// router.put(
//   "",
//   isAuthenticated,
//   hasRole(["admin"]),
//   authInternoController.updateInternalUser
// );

router.put(
  "/cambiar-contrasenia",
  isAuthenticated,
  hasRole(["admin"]),
  validarContrasenia,
  authInternoController.changePasswordInternalUser
);

router.post(
  "/eliminar-usuario",
  isAuthenticated,
  hasRole(["admin"]),
  validarUsuario,
  authInternoController.deleteInternalUser
);

router.post("/login", authInternoController.loginInternalUser);

router.post("/refresh-token", authInternoController.refreshTokenInternalUser);

module.exports = router;
