const express = require("express");
const router = express.Router();
const config = require("../config/middlewares");
const invoiceController = require("../controllers/invoiceController");
const { getInvoicesValidation } = require("../validations/invoice.validation");
router
  .route("/invoices")
  .get(
    config.auth,
    getInvoicesValidation,
    config.mwError,
    invoiceController.getInvoices
  );

module.exports = router;
