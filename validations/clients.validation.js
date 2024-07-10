const { query } = require("express-validator");

exports.getClientsListValidation = [
  query("phone")
    .optional()
    .isString()
    .withMessage("phone must be string")
    .isLength({ min: 1, max: 11 })
    .withMessage("phone length must be 11 characters long"),
  query("name")
    .optional()
    .isString()
    .withMessage("name must be string")
    .isLength({ min: 0, max: 191 })
    .withMessage("name length must be 191 characters long"),
];
