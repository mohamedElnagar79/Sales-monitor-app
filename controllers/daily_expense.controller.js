const config = require("../config/middlewares");
const DailyExpense = require("../models/Daily_expense.model");
const moment = require("moment");

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
      attributes: [
        "id",
        "amount",
        "expenseName",
        "description",
        "reasone",
        "updatedAt",
      ],
      limit,
      offset,
      order: [["updatedAt", "DESC"]],
    });
    dailyExpense.rows.map((outgoing) => {
      outgoing.description = config.truncateText(outgoing.description, 50);
      outgoing.dataValues.updatedAt = moment(
        outgoing.dataValues.updatedAt
      ).format("DD/MM/YYYY");
    });
    return res.status(200).json({
      status_code: 200,
      data: dailyExpense,
      message: "success",
    });
  } catch (error) {
    console.log("error ", error);
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: error.message,
    });
  }
};

exports.updateOneExpense = async (req, res, next) => {
  const { amount, expenseName, description } = req.body;
  const expenseId = req.params.id;
  try {
    const expense = await DailyExpense.findByPk(expenseId);
    if (!expense) {
      return res.status(404).json({
        status_code: 404,
        data: null,
        message: "expense not found",
      });
    } else {
      await expense.update({ amount, expenseName, description });
      return res.status(200).json({
        status_code: 200,
        data: null,
        message: "expense updated succesfully",
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

exports.DeleteOneExpense = async (req, res, next) => {
  const expenseId = +req.params.id;
  try {
    const expense = await DailyExpense.findByPk(expenseId);
    if (expense) {
      await expense.destroy();
      return res.status(200).json({
        status_code: 200,
        data: null,
        message: "expense deleted succesfully",
      });
    } else {
      return res.status(404).json({
        status_code: 404,
        data: null,
        message: "expense not found or is already deleted",
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
