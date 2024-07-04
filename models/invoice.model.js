const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const Invoices = sequelize.define("invoices", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  total: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  amountPaid: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  remainingBalance: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  comments: {
    type: Sequelize.STRING,
    allowNull: false,
    default: " ",
  },
});

module.exports = Invoices;
