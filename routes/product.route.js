const express = require("express");
const router = express.Router();
const config = require("../config/middlewares");
const productController = require("../controllers/product.controller");
const { productValidationAdd } = require("../validations/product.validation");

router
  .route("/new-product")
  .post(
    config.auth,
    productValidationAdd,
    config.mwError,
    productController.createNewProduct
  );

router
  .route("/get-all-products")
  .get(config.auth, productController.getAllProducts);

module.exports = router;
