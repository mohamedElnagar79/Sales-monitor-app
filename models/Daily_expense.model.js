const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const DailyExpense = sequelize.define(
  "daily_expenses",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    expenseName: {
      type: Sequelize.STRING(191),
      required: true,
    },
    description: {
      type: Sequelize.STRING(191),
      required: false,
      default: " ",
    },
    reasone: {
      type: Sequelize.STRING(191),
      required: false,
      default: " ",
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true,
    deletedAt: "deletedAt",
  }
);

module.exports = DailyExpense;
