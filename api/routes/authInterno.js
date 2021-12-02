const express = require("express");
const authInternoController = require("../controller/authInternoController");
const { isAuthenticated, hasRole } = require("../middleware/authInterno");
const {
  validarUsuario,
  validarContrasenia,
  validarUsuarioNoExiste,
  validarUsuarioExiste,
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
  "/cambiar-contrasenia/:userName",
  isAuthenticated,
  hasRole(["admin"]),
  validarUsuario,
  validarUsuarioExiste,
  validarContrasenia,
  authInternoController.changePasswordInternalUser
);

router.delete(
  "/eliminar-usuario/:userName",
  isAuthenticated,
  hasRole(["admin"]),
  validarUsuario,
  authInternoController.deleteInternalUser
);

router.post("/login", authInternoController.loginInternalUser, authInternoController.sendResponse);

router.post("/refresh-token", authInternoController.refreshTokenInternalUser);

module.exports = router;
