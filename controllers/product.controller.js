const Product = require("../models/product.model");
const config = require("../config/middlewares");

exports.createNewProduct = async (req, res) => {
  const { name, price, soldPrice, stock, description } = req.body;
  try {
    const newProduct = await Product.create({
      name,
      price,
      soldPrice: soldPrice ? soldPrice : price,
      stock,
      description,
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

exports.getAllProducts = async (req, res) => {
  try {
    let limit = req.query.rows ? +req.query.rows : 10;
    let offset = req.query.page ? (req.query.page - 1) * limit : 0;

    const products = await Product.findAndCountAll({
      attributes: [
        "id",
        "name",
        "price",
        "soldPrice",
        "stock",
        "createdAt",
        "updatedAt",
        "description",
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    products.rows.map((product) => {
      product.dataValues.createdAt = config.formatDate(
        product.dataValues.createdAt
      );
      product.dataValues.updatedAt = config.formatDate(
        product.dataValues.updatedAt
      );
    });

    return res.status(200).json({
      status_code: 200,
      data: products,
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

exports.updateOneProduct = async (req, res, next) => {
  const { name, price, soldPrice, stock, description } = req.body;
  const productId = +req.params.id;
  try {
    const product = await Product.findByPk(productId);
    if (product) {
      await product.update({
        name,
        price,
        soldPrice: soldPrice,
        stock,
        description,
      });
      return res.status(200).json({
        status_code: 200,
        data: null,
        message: "product updated succesfully",
      });
    } else {
      return res.status(404).json({
        status_code: 404,
        data: null,
        message: "product not found",
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

exports.DeleteOneProduct = async (req, res, next) => {
  const productId = +req.params.id;
  try {
    const product = await Product.findByPk(productId);
    if (product) {
      await product.destroy();
      return res.status(200).json({
        status_code: 200,
        data: null,
        message: "product deleted succesfully",
      });
    } else {
      return res.status(404).json({
        status_code: 404,
        data: null,
        message: "product not found",
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
