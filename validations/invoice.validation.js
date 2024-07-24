const { query, param, body, check } = require("express-validator");
const moment = require("moment");
const Invoices = require("../models/invoice.model");
const InvoiceItems = require("../models/invoice_items.model");

exports.getInvoicesValidation = [
  query("date")
    .optional()
    .isString()
    .withMessage("date must be string")
    .isLength({ min: 0, max: 191 })
    .withMessage("date length must be less than 191 characters long")
    .custom((value) => {
      if (value && !moment(value, "MM-DD-YYYY", true).isValid()) {
        throw new Error("date must be in the format MM-DD-YYYY");
      }
      return true;
    }),
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

exports.validateUpdateInvoice = [
  body("invoiceId")
    .notEmpty()
    .withMessage("invoiceId is required")
    .isNumeric()
    .withMessage("invoiceId must be a number")
    .isLength({ max: 10 })
    .withMessage("invoiceId must be less than 10 char"),
  check("invoiceId").custom((value) => {
    return Invoices.findOne({ where: { id: value } }).then((invoice) => {
      if (!invoice) {
        return Promise.reject("invoice not found! create new one");
      }
    });
  }),
  body("updatedinvoiceItems")
    .optional()
    .isArray()
    .withMessage("updatedinvoiceItems must be a array of objects"),
  body("updatedinvoiceItems.*.id")
    .notEmpty()
    .withMessage("each updatedinvoiceItems must have id")
    .isNumeric()
    .withMessage("updatedinvoiceItems id must be a number")
    .isLength({ max: 10 })
    .withMessage("updatedinvoiceItems id must be less than 10 nums long"),

  check("updatedinvoiceItems.*.id").custom((value, req) => {
    return InvoiceItems.findOne({ where: { id: value } }).then((item) => {
      if (!item) {
        return Promise.reject("invoice item Id not found!");
      }
    });
  }),
  body("updatedinvoiceItems.*.quantity")
    .optional()
    .isNumeric()
    .withMessage("updatedinvoiceItems quantity must be a number")
    .isLength({ max: 10 })
    .withMessage("updatedinvoiceItems quantity must be less than 10 nums long"),

  body("updatedinvoiceItems.*.piecePrice")
    .optional()
    .isNumeric()
    .withMessage("updatedinvoiceItems piecePrice must be a number")
    .isLength({ max: 10 })
    .withMessage(
      "updatedinvoiceItems piecePrice must be less than 10 nums long"
    ),

  body("newPayments")
    .optional()
    .isArray()
    .withMessage("newPayments must be a array of objects"),
  body("newPayments.*.total")
    .notEmpty()
    .withMessage("each newPayments object must have total")
    .isNumeric()
    .withMessage("newPayments total must be a number")
    .isLength({ max: 10 })
    .withMessage("newPayments total must be less than 10 nums long"),
  body("newPayments.*.amountPaid")
    .notEmpty()
    .withMessage("each newPayments object must have amountpaid")
    .isNumeric()
    .withMessage("newPayments amountPaid must be a number")
    .isLength({ max: 10 })
    .withMessage("newPayments amountPaid must be less than 10 nums long"),
  body("newPayments.*.remaining")
    .notEmpty()
    .withMessage("each newPayments object must have remaining")
    .isNumeric()
    .withMessage("newPayments remaining must be a number")
    .isLength({ max: 10 })
    .withMessage("newPayments remaining must be less than 10 nums long"),
  body("invoice")
    .notEmpty()
    .withMessage("invoice must have remaining")
    .isObject()
    .withMessage("invoice must be a an object"),
  body("invoice.clientId")
    .notEmpty()
    .withMessage("invoice object must have clientId")
    .isNumeric()
    .withMessage("invoice client Id must be a number"),
  body("invoice.amountPaid")
    .notEmpty()
    .withMessage("invoice object must have amountPaid")
    .isNumeric()
    .withMessage("invoice amountPaid must be a number"),
];
