const User = require("../models/user.model");
const Sales = require("../models/sales.model");
const Product = require("../models/product.model");
const Returns = require("../models/returns.model");

Product.hasMany(Sales);
Sales.belongsTo(Product);

Sales.hasMany(Returns);
Returns.belongsTo(Sales);
