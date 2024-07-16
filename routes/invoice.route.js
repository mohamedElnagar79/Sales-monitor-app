const express = require("express");
const router = express.Router();
const config = require("../config/middlewares");
const invoiceController = require("../controllers/invoiceController");
const {
  getInvoicesValidation,
  validateParamId,
} = require("../validations/invoice.validation");
router
  .route("/invoices")
  .get(
    config.auth,
    getInvoicesValidation,
    config.mwError,
    invoiceController.getInvoices
  );

router
  .route("/invoice/:id")
  .get(
    config.auth,
    validateParamId,
    config.mwError,
    invoiceController.getOneInvoiceById
  );
module.exports = router;
