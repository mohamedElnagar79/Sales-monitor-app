const { body, check, param, query } = require("express-validator");
const Product = require("../models/product.model");

exports.productValidationAdd = [
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .withMessage("name must be only string")
    .isLength({ min: 0, max: 191 })
    .withMessage("name length must be less than 10 characters long"),
  check("name").custom((value) => {
    return Product.findOne({ where: { name: value } }).then((user) => {
      if (user) {
        return Promise.reject("this product name already exist");
      }
    });
  }),
  body("price")
    .notEmpty()
    .withMessage("price is required")
    .isNumeric()
    .withMessage("price must be a number")
    .isLength({ max: 191 })
    .withMessage("price must be less than 191 characters long"),
  body("soldPrice")
    .optional()
    .isNumeric()
    .withMessage("soldPrice must be a number")
    .isLength({ max: 191 })
    .withMessage("soldPrice must be less than 191 characters long"),
  body("stock")
    .notEmpty()
    .withMessage("stock is required")
    .isNumeric()
    .withMessage("stock must be a number")
    .isLength({ max: 191 })
    .withMessage("stock must be less than 191 characters long"),
];

exports.getAllProductsValidation = [
  query("page")
    .optional()
    .isNumeric()
    .withMessage("page must be anumber")
    .isLength({ min: 0, max: 10 })
    .withMessage("page length must be less than 10 characters long"),
  query("rows")
    .optional()
    .isNumeric()
    .withMessage("rows must be anumber")
    .isLength({ min: 0, max: 10 })
    .withMessage("rows length must be less than 10 characters long"),
];
