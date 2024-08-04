const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const IvoicePayments = sequelize.define("ivoice_payments", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  total: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
  },
  amountPaid: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  remaining: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  comments: {
    type: Sequelize.STRING,
    allowNull: true,
    default: " ",
  },
});

module.exports = IvoicePayments;
