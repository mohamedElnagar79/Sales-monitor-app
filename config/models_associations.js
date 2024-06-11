const User = require("../models/user.model");
const Sales = require("../models/sales.model");
const Product = require("../models/product.model");

Product.hasMany(Sales);
Sales.belongsTo(Product);
