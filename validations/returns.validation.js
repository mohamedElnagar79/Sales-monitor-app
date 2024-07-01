const { body } = require("express-validator");

exports.addAreturnValidation = [
  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isNumeric()
    .withMessage("quantity must be a number")
    .isLength({ max: 10 })
    .withMessage("quantity must be less than 10 characters long"),
  body("reasone").optional().isString().withMessage("reasone must be a string"),
];
