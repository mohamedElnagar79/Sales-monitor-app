const { body, check, param, query } = require("express-validator");
const Product = require("../models/product.model");
const Clients = require("../models/clients.model");

exports.sellProductsValidation = [
  body("clientName")
    .optional()
    .isString()
    .withMessage("clientName must be a string")
    .isLength({ max: 191 })
    .withMessage("clientName must be less than 191 char"),
  body("phone")
    .optional()
    .isString()
    .withMessage("phone must be a string")
    .isLength({ max: 11 })
    .withMessage("phone must be less than 11 char"),
  check("phone")
    .optional()
    .custom(async (value) => {
      const client = await Clients.findOne({
        where: { phone: value },
      });
      if (client) {
        return Promise.reject("phone is already exist");
      }
    }),
  body("clientId")
    .optional()
    .isNumeric()
    .withMessage("clientId must be a number")
    .isLength({ max: 10 })
    .withMessage("clientId must be less than 10 char"),
  check("clientId")
    .optional()
    .custom((value) => {
      return Clients.findOne({ where: { id: value } }).then((client) => {
        if (!client) {
          return Promise.reject("client not found! create new one");
        }
      });
    }),
  body("comments")
    .optional()
    .isString()
    .withMessage("comments must be a string")
    .isLength({ max: 191 })
    .withMessage("comments must be less than 191 char"),

  body("amountPaid")
    .notEmpty()
    .withMessage("amountPaid is required")
    .isNumeric()
    .withMessage("amountPaid must be a number")
    .isLength({ max: 10 })
    .withMessage("amountPaid must be less than 10 nums long"),
  body("newInvoiceItems")
    .notEmpty()
    .withMessage("newInvoiceItems is required")
    .isArray()
    .withMessage("newInvoiceItems must be a array of objects"),
  body("newInvoiceItems.*.productId")
    .notEmpty()
    .withMessage("each newInvoiceItems must have productId")
    .isNumeric()
    .withMessage("newInvoiceItems productId must be a number")
    .isLength({ max: 10 })
    .withMessage("newInvoiceItems productId must be less than 10 nums long"),
  check("newInvoiceItems.*.productId").custom((value, req) => {
    const itemIndex = req.req.body.newInvoiceItems.findIndex(
      (item) => item.productId === value
    );
    if (itemIndex === -1) {
      return Promise.reject("product Id not found in the request body!");
    }
    const currentQuantity = req.req.body.newInvoiceItems[itemIndex].quantity;
    return Product.findOne({ where: { id: value } }).then((product) => {
      if (!product) {
        return Promise.reject("product Id not found!");
      }
      if (product.stock < currentQuantity) {
        return Promise.reject(
          "there is no enough quantity exist in this product"
        );
      }
    });
  }),
  body("newInvoiceItems.*.quantity")
    .notEmpty()
    .withMessage("each newInvoiceItems must have quantity")
    .isNumeric()
    .withMessage("newInvoiceItems quantity must be a number")
    .isLength({ max: 10 })
    .withMessage("newInvoiceItems quantity must be less than 10 nums long"),
  body("newInvoiceItems.*.piecePrice")
    .notEmpty()
    .withMessage("each newInvoiceItems must have piecePrice")
    .isNumeric()
    .withMessage("newInvoiceItems piecePrice must be a number")
    .isLength({ max: 10 })
    .withMessage("newInvoiceItems piecePrice must be less than 10 nums long"),
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
exports.calcDaysValidation = [
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

exports.validateParamId = [
  param("id")
    .notEmpty()
    .withMessage("id is required")
    .isNumeric()
    .withMessage("id must be anumber")
    .isLength({ min: 0, max: 10 })
    .withMessage("id length must be less than 10 characters long"),
];
