const express = require("express");
const router = express.Router();
const config = require("../config/middlewares");
const invoiceController = require("../controllers/invoiceController");
const {
  getInvoicesValidation,
  validateParamId,
  validateUpdateInvoice,
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
// get invoice payments
router
  .route("/invoice-payments/:id")
  .get(
    config.auth,
    validateParamId,
    config.mwError,
    invoiceController.getInvoicePayments
  );

router
  .route("/invoice")
  .put(
    config.auth,
    validateUpdateInvoice,
    config.mwError,
    invoiceController.updateInvoice
  );

module.exports = router;
