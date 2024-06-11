const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
  "products",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    soldPrice: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    stock: {
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

module.exports = Product;
