const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const IvoicePayments = sequelize.define("ivoice_payments", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  oldRemaining: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  amountPaid: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  newRemaining: {
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
