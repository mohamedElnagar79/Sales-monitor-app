const DailyExpense = require("../models/Daily_expense.model");

exports.addNewExpense = async (req, res, next) => {
  try {
    const { amount, expenseName, description, reasone } = req.body;
    const Expenses = await DailyExpense.create({
      amount,
      expenseName,
      description,
      reasone,
    });
    if (Expenses) {
      return res.status(200).json({
        status_code: 200,
        data: Expenses,
        message: "done",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: error.message,
    });
  }
};
