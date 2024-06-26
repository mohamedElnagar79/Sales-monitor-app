const Sales = require("../models/sales.model");
const Product = require("../models/product.model");

exports.sellProduct = async (req, res, next) => {
  const {
    quantity,
    soldPrice,
    amountPaid,
    remainingBalance,
    clientName,
    comments,
    productId,
  } = req.body;
  try {
    const newSellObject = await Sales.create({
      quantity: quantity ? quantity : 1,
      soldPrice,
      amountPaid,
      remainingBalance,
      clientName,
      comments,
      productId,
    });
    if (newSellObject) {
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
