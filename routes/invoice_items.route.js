const express = require("express");
const router = express.Router();
const config = require("../config/middlewares");
const invoice_itemsController = require("../controllers/invoice_items.controller");
const {
  sellProductsValidation,
  validateParamId,
  //   getLastSalesValidation,
  //   calcDaysValidation,
} = require("../validations/invoice_items.validation");

router
  .route("/sell-product")
  .post(
    config.auth,
    sellProductsValidation,
    config.mwError,
    invoice_itemsController.createNewInvoice
  );

router
  .route("/invoice-items/:id")
  .get(
    config.auth,
    validateParamId,
    config.mwError,
    invoice_itemsController.getInvoiceItems
  );

// router
//   .route("/get-last-sales")
//   .get(
//     config.auth,
//     getLastSalesValidation,
//     config.mwError,
//     salesController.getlastsales
//   );
// router
//   .route("/calc-daily-sales")
//   .get(
//     config.auth,
//     calcDaysValidation,
//     config.mwError,
//     salesController.calcDailySales
//   );
module.exports = router;
