const { body, check, param } = require("express-validator");
const User = require("../models/user.model");
const { Op } = require("sequelize");

exports.userValidationAdd = [
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .withMessage("name must be only string")
    .isLength({ min: 0, max: 191 })
    .withMessage("name length must be less than 10 characters long"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email must be a valid email")
    .isLength({ max: 191 })
    .withMessage("email must be less than 191 characters long"),
  check("email").custom((value) => {
    return User.findOne({ where: { email: value } }).then((user) => {
      console.log("helllo iam here");
      if (user) {
        return Promise.reject("E-mail already in use");
      }
    });
  }),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isStrongPassword({
      minLength: 8,
      minNumbers: 1,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password is too weak password must contain at least 8 characters, 1 number, 1 lowercase, uppercase character and a symbol"
    ),
  body("avatar")
    .optional()
    .isString()
    .withMessage("avatar must be only string"),
  body("id").optional().isNumeric().withMessage("id must be only a number"),
  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("role is must be only admin or member")
    .isString()
    .withMessage("role must be only string"),
];
exports.validateForgetPassword = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email must be a valid email")
    .isLength({ max: 191 })
    .withMessage("email must be less than 191 characters long"),
];
exports.validateHash = [
  param("hash")
    .notEmpty()
    .withMessage("hash is required")
    .isString()
    .withMessage("hash must be only string")
    .isLength({ min: 1, max: 10 })
    .withMessage("hash  must be between 1 and 10 characters long"),
];

exports.validateUpdateUserAccount = [
  body("name")
    .optional()
    .isString()
    .withMessage("name must be a string")
    .isLength({ max: 191 })
    .withMessage("name must be less than 191 characters long"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("email must be a valid email")
    .isLength({ max: 191 })
    .withMessage("email must be less than 191 characters long"),
  check("email")
    .optional()
    .custom(async (value, req) => {
      let id = +req.req.id;
      id = req.req.body.userId ? req.req.body.userId : id;
      const user = await User.findOne({
        where: {
          id: {
            [Op.ne]: id,
          },
          email: value,
        },
      });
      if (user) {
        return Promise.reject("E-mail is already in use");
      }
    }),
  body("avatar")
    .optional()
    .isString()
    .withMessage("avatar must be only string"),
  body("file_name")
    .optional()
    .isString()
    .withMessage("filename must be only string"),
  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("role is must be only admin or member")
    .isString()
    .withMessage("role must be only string"),
  body("userId")
    .optional()
    .isNumeric()
    .withMessage("userId must be only a number"),
];

exports.validateUpdateUserPassword = [
  body("originalPassword")
    .notEmpty()
    .withMessage("originalPassword is required")
    .isString()
    .withMessage("originalPassword must be a string"),
  body("newPassword")
    .notEmpty()
    .withMessage("new password is required")
    .isString()
    .withMessage("newPassword must be a string")
    .isStrongPassword({
      minLength: 8,
      minNumbers: 1,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password is too weak password must contain at least 8 characters, 1 number, 1 lowercase, uppercase character and a symbol"
    ),
];
