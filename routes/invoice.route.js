const express = require("express");
const router = express.Router();
const config = require("../config/middlewares");
const invoiceController = require("../controllers/invoiceController");

router.route("/invoices").get(config.auth, invoiceController.getInvoices);

module.exports = router;
