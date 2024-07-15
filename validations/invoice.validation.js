const { query } = require("express-validator");
const moment = require("moment");

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
