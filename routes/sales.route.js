const express = require("express");
const router = express.Router();
const config = require("../config/middlewares");
const salesController = require("../controllers/sales.controller");
const {
  sellProductsValidation,
  getLastSalesValidation,
  calcDaysValidation,
} = require("../validations/sales.validation");

router
  .route("/sell-product")
  .post(
    config.auth,
    sellProductsValidation,
    config.mwError,
    salesController.sellProduct
  );

router
  .route("/get-last-sales")
  .get(
    config.auth,
    getLastSalesValidation,
    config.mwError,
    salesController.getlastsales
  );
router
  .route("/calc-daily-sales")
  .get(
    config.auth,
    calcDaysValidation,
    config.mwError,
    salesController.calcDailySales
  );
module.exports = router;
