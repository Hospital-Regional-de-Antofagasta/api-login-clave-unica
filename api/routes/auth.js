const express = require("express");
const authController = require("../controller/authController");

const router = express.Router();

router.get("/", authController.loginTest);

router.post("/refresh_token", authController.refreshToken);

module.exports = router;
