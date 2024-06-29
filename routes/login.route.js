const express = require("express");
const router = express.Router();
const loginController = require("../controllers/login.controller");
const { loginValidation } = require("../validations/login.validation");
const config = require("../config/middlewares");

router
  .route("/login")
  .post(loginValidation, config.mwError, loginController.login);

module.exports = router;
