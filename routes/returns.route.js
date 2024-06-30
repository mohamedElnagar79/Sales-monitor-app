const express = require("express");
const router = express.Router();
const config = require("../config/middlewares");
const returnsController = require("../controllers/returns.controller");
const { addAreturnValidation } = require("../validations/returns.validation");

router
  .route("/return-product")
  .post(
    config.auth,
    addAreturnValidation,
    config.mwError,
    returnsController.addNewReturn
  );
module.exports = router;
