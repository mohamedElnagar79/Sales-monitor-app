const { body, check, param, query } = require("express-validator");
const Product = require("../models/product.model");
const Sales = require("../models/sales.model");

exports.sellProductsValidation = [
  body("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isNumeric()
    .withMessage("productId must be a number")
    .isLength({ max: 10 })
    .withMessage("productId must be less than 10 nums long"),
  check("productId").custom((value) => {
    return Product.findOne({ where: { id: value } }).then((product) => {
      console.log("helllo iam here");
      if (!product || product.dataValues.Stock == 0) {
        return Promise.reject("this product not found or out of Stock");
      }
    });
  }),

  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isNumeric()
    .withMessage("quantity must be a number")
    .isLength({ max: 10 })
    .withMessage("quantity must be less than 10 nums long"),
  body("piecePrice")
    .notEmpty()
    .withMessage("piecePrice is required")
    .isNumeric()
    .withMessage("piecePrice must be a number")
    .isLength({ max: 10 })
    .withMessage("piecePrice must be less than 10 nums long"),
  body("total")
    .notEmpty()
    .withMessage("total is required")
    .isNumeric()
    .withMessage("total must be a number")
    .isLength({ max: 10 })
    .withMessage("total must be less than 10 nums long"),
  body("amountPaid")
    .notEmpty()
    .withMessage("amountPaid is required")
    .isNumeric()
    .withMessage("amountPaid must be a number")
    .isLength({ max: 10 })
    .withMessage("amountPaid must be less than 10 nums long"),
  body("remainingBalance")
    .notEmpty()
    .withMessage("remainingBalance is required")
    .isNumeric()
    .withMessage("remainingBalance must be a number")
    .isLength({ max: 10 })
    .withMessage("remainingBalance must be less than 10 nums long"),
  body("clientName")
    .notEmpty()
    .withMessage("clientName is required")
    .isString()
    .withMessage("clientName must be a string")
    .isLength({ max: 191 })
    .withMessage("clientName must be less than 191 char long"),
  body("comments")
    .notEmpty()
    .withMessage("comments is required")
    .isString()
    .withMessage("comments must be a string")
    .isLength({ max: 191 })
    .withMessage("comments must be less than 10 char long"),
];

exports.getLastSalesValidation = [
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
