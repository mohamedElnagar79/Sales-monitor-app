const express = require("express");
const router = express.Router();
const config = require("../config/middlewares");
const salesController = require("../controllers/sales.controller");

router.route("/sell-product").post(config.auth, salesController.sellProduct);

module.exports = router;
