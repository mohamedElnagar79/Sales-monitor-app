const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const InvoiceItems = sequelize.define("invoice_items", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  piecePrice: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
});

module.exports = InvoiceItems;
// total: {
//   type: Sequelize.INTEGER,
//   allowNull: true,
// },
// amountPaid: {
//   type: Sequelize.INTEGER,
//   allowNull: false,
// },
// remainingBalance: {
//   type: Sequelize.INTEGER,
//   allowNull: false,
// },
