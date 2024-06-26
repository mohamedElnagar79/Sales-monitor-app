const Sales = require("../models/sales.model");
const Product = require("../models/product.model");
const { Op } = require("sequelize");
const moment = require("moment");
const config = require("../config/middlewares");
exports.sellProduct = async (req, res, next) => {
  const {
    quantity,
    piecePrice,
    total,
    amountPaid,
    remainingBalance,
    clientName,
    comments,
    productId,
  } = req.body;
  try {
    const newSellObject = await Sales.create({
      quantity: quantity,
      piecePrice,
      amountPaid,
      total,
      remainingBalance,
      clientName,
      comments,
      productId,
    });
    if (newSellObject) {
      const product = await Product.findByPk(productId);
      const newStock = product.dataValues.stock - quantity;
      console.log("newStock", product.dataValues);
      await product.update({ stock: newStock });
      return res.status(200).json({
        status_code: 200,
        data: null,
        message: "done",
      });
    } else throw new Error("error while creating sell");
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: error.message,
    });
  }
};

exports.getlastsales = async (req, res) => {
  try {
    let limit = req.query.rows ? +req.query.rows : 8;
    let offset = req.query.page ? (req.query.page - 1) * limit : 0;
    const startOfYesterday = moment()
      .subtract(1, "days")
      .startOf("day")
      .toDate();
    const now = moment().toDate();
    const sales = await Sales.findAndCountAll({
      attributes: [
        "id",
        "quantity",
        "piecePrice",
        "total",
        "amountPaid",
        "remainingBalance",
        "clientName",
        "comments",
        "updatedAt",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      where: {
        createdAt: {
          [Op.gte]: startOfYesterday,
          [Op.lt]: now,
        },
      },
    });
    sales.rows.map((item) => {
      item.dataValues.createdAt = config.formatDate(item.dataValues.createdAt);
      item.dataValues.updatedAt = config.formatDate(item.dataValues.updatedAt);
    });

    return res.status(200).json({
      status_code: 200,
      data: sales,
      message: "success",
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: error.message,
    });
  }
};
