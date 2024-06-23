const express = require("express");
const router = express.Router();
const config = require("../config/middlewares");
const productController = require("../controllers/product.controller");
const {
  productValidationAdd,
  getAllProductsValidation,
  productValidationupdate,
} = require("../validations/product.validation");

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
  .get(
    config.auth,
    getAllProductsValidation,
    config.mwError,
    productController.getAllProducts
  );
router
  .route("/update-product/:id")
  .put(
    config.auth,
    productValidationupdate,
    config.mwError,
    productController.updateOneProduct
  );

module.exports = router;
