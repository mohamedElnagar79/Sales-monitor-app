const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const InvoiceReturnsMoney = sequelize.define(
  "invoice_returns_money",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    returned_money: {
      type: Sequelize.INTEGER,
      allowNull: true,
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

module.exports = InvoiceReturnsMoney;
