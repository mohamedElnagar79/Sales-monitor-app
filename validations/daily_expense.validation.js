const { body, query } = require("express-validator");

exports.addNewExpenseValidation = [
  body("amount")
    .notEmpty()
    .withMessage("amount is required")
    .isNumeric()
    .withMessage("amount must be a valid number")
    .isLength({ max: 10 })
    .withMessage("amount must be less than 10 characters long"),
  body("expenseName")
    .notEmpty()
    .withMessage("expenseName is required")
    .isString()
    .withMessage("expenseName must be a string")
    .isLength({ max: 191 })
    .withMessage("expenseName must be less than 191 characters long"),
  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string")
    .isLength({ max: 191 })
    .withMessage("description must be less than 191 characters long"),
  body("reasone")
    .optional()
    .isString()
    .withMessage("reasone must be a string")
    .isLength({ max: 191 })
    .withMessage("reasone must be less than 191 characters long"),
];

exports.getExpensesValidation = [
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
