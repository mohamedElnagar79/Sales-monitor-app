const { body } = require("express-validator");

exports.loginValidation = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email must be a valid email")
    .isLength({ max: 191 })
    .withMessage("email must be less than 191 characters long"),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isString()
    .withMessage("password must be a string"),
  body("remember_me")
    .optional()
    .isBoolean()
    .withMessage("remember_me must be 1 or 0 only"),
];
