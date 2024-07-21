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
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  amountPaid: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  remaining: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  comments: {
    type: Sequelize.STRING,
    allowNull: true,
    default: " ",
  },
});

module.exports = IvoicePayments;
