const Product = require("../models/product.model");

exports.createNewProduct = async (req, res) => {
  const { name, price, soldPrice, stock } = req.body;
  try {
    const newProduct = await Product.create({
      name,
      price,
      soldPrice: soldPrice ? soldPrice : price,
      stock,
    });
    if (newProduct) {
      return res.status(200).json({
        status_code: 200,
        data: null,
        message: "new product added succesfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: error.message,
    });
  }
};
