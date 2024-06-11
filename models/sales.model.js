const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const Sales = sequelize.define(
  "Sales",
  {
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
    soldPrice: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    amountPaid: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    remainingBalance: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    clientName: {
      type: Sequelize.STRING(191),
      required: true,
      unique: true,
    },
    comments: {
      type: Sequelize.STRING(225),
      required: true,
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true,
    deletedAt: "deletedAt",
  },

  {
    indexes: [{ unique: true, fields: ["clientName"] }],
  }
);

module.exports = Sales;
