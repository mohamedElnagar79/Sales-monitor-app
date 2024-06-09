const { validationResult } = require("express-validator");
module.exports = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().every((error) => {
      res.status(400).json({
        status_code: 400,
        message: error.msg,
        data: null,
        error: error,
      });
      return false;
    });
  } else next();
};
