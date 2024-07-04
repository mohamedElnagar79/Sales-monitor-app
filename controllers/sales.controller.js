const Sales = require("../models/sales.model");
const Product = require("../models/product.model");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment");
const config = require("../config/middlewares");
const DailyExpense = require("../models/Daily_expense.model");

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
    const search = req.query.search;
    const whereClause = search
      ? {
          clientName: {
            [Op.like]: `%${search}%`,
          },
        }
      : {};
    // const startOfYesterday = moment()
    //   .subtract(1, "days")
    //   .startOf("day")
    //   .toDate();
    // const now = moment().toDate();
    const sales = await Sales.findAndCountAll({
      attributes: [
        "id",
        [Sequelize.col("product.id"), "productId"],
        [Sequelize.col("product.name"), "productName"],
        "quantity",
        "piecePrice",
        "total",
        "amountPaid",
        "remainingBalance",
        "clientName",
        "comments",
        "createdAt",
      ],
      where: whereClause,
      include: {
        model: Product,
        required: false,
        attributes: [],
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      // where: {
      //   createdAt: {
      //     [Op.gte]: startOfYesterday,
      //     [Op.lt]: now,
      //   },
      // },
    });
    sales.rows.map((item) => {
      item.dataValues.createdAt = config.formatDate(item.dataValues.createdAt);
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

exports.calcDailySales = async (req, res, next) => {
  try {
    const specifiedDate = req.query.date
      ? new Date(req.query.date)
      : new Date();
    specifiedDate.setHours(0, 0, 0, 0); // Start of the day
    const nextDay = new Date(specifiedDate);
    nextDay.setDate(specifiedDate.getDate() + 1);
    // console.log("nextDay ===> ", nextDay);
    nextDay.setHours(0, 0, 0, 0); // Start of the next day
    let limit = req.query.rows ? +req.query.rows : 8;
    let offset = req.query.page ? (req.query.page - 1) * limit : 0;

    const sales = await Sales.findAndCountAll({
      attributes: [
        "id",
        [Sequelize.col("product.name"), "productName"],
        "amountPaid",
        "quantity",
        "remainingBalance",
        "clientName",
      ],
      where: {
        createdAt: {
          [Op.between]: [specifiedDate, nextDay],
        },
      },
      limit,
      offset,
      order: [["updatedAt", "DESC"]],
      include: {
        model: Product,
        required: false,
        attributes: [],
      },
    });

    const dailyExpense = await DailyExpense.findAndCountAll({
      attributes: ["id", "amount", "expenseName", "description"],
      where: {
        createdAt: {
          [Op.between]: [specifiedDate, nextDay],
        },
      },
      order: [["updatedAt", "DESC"]],
      limit,
      offset,
    });
    const totalAmountPaid = sales.rows.reduce(
      (sum, sale) => sum + parseFloat(sale.amountPaid),
      0
    );

    const totalDailyExpense = dailyExpense.rows.reduce(
      (sum, expense) => sum + parseFloat(expense.amount),
      0
    );
    dailyExpense.rows.map((outgoing) => {
      outgoing.description = config.truncateText(outgoing.description, 50);
    });

    console.log("totalAmountPaid ==> ", totalAmountPaid);
    console.log("Daily_expense ==> ", totalDailyExpense);

    const totalExistMoney = totalAmountPaid - totalDailyExpense;

    return res.status(200).json({
      status_code: 200,
      data: {
        sales,
        dailyExpense,
        totalAmountPaid,
        totalDailyExpense,
        totalExistMoney,
      },
      message: "done",
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: error.message,
    });
  }
};
