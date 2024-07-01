const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const Returns = sequelize.define(
  "returns",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: true,
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

module.exports = Returns;
