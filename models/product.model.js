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
      unique: true,
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    soldPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    stock: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    min_stock: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    description: {
      type: Sequelize.STRING(225),
      allowNull: false,
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
  },
  {
    indexes: [{ unique: true, fields: ["name"] }],
  }
);

module.exports = Product;
