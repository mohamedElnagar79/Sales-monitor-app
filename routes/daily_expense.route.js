const express = require("express");
const router = express.Router();
const dailyExpenseController = require("../controllers/daily_expense.controller");
const {
  addNewExpenseValidation,
  getExpensesValidation,
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
router
  .route("/get-expenses")
  .get(
    config.auth,
    getExpensesValidation,
    config.mwError,
    dailyExpenseController.getAllExpenses
  );

module.exports = router;
