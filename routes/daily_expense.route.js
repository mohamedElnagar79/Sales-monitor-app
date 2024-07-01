const express = require("express");
const router = express.Router();
const dailyExpenseController = require("../controllers/daily_expense.controller");
const {
  addNewExpenseValidation,
} = require("../validations/daily_expense.validation");
const config = require("../config/middlewares");

router
  .route("/new-expense")
  .post(
    config.auth,
    addNewExpenseValidation,
    config.mwError,
    dailyExpenseController.addNewExpense
  );

module.exports = router;
