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

exports.getAllExpenses = async (req, res, next) => {
  try {
    let limit = req.query.rows ? +req.query.rows : 8;
    let offset = req.query.page ? (req.query.page - 1) * limit : 0;
    const dailyExpense = await DailyExpense.findAndCountAll({
      attributes: ["id", "amount", "expenseName", "description", "reasone"],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      status_code: 200,
      data: dailyExpense,
      message: "success",
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: error.message,
    });
  }
};
