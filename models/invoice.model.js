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
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  amountPaid: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  remainingBalance: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  comments: {
    type: Sequelize.STRING,
    allowNull: true,
    default: " ",
  },
});

module.exports = Invoices;
