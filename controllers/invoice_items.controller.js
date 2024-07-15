const InvoiceItems = require("../models/invoice_items.model");
const Product = require("../models/product.model");
const { Op, Sequelize, where } = require("sequelize");
const moment = require("moment");
const config = require("../config/middlewares");
const DailyExpense = require("../models/Daily_expense.model");
const Clients = require("../models/clients.model");
const Invoices = require("../models/invoice.model");

exports.createNewInvoice = async (req, res, next) => {
  const { clientName, phone, newInvoiceItems, comments, amountPaid } = req.body;
  let clientId = req.body.clientId;
  let invoiceId;
  let total = 0;
  let remainingBalance = 0;

  try {
    // create new client or get it
    if (clientName) {
      const client = await Clients.create({
        name: clientName,
        phone: phone,
      });
      clientId = client.dataValues.id;
    }
    console.log("===> ", clientId, clientName);
    if (!clientName && !clientId) {
      return res.status(400).json({
        status_code: 400,
        data: null,
        message: "please choose client!",
      });
    }
    // create new invoice without calc total and remaining
    const newInvoice = await Invoices.create({
      clientId,
      total: 0,
      amountPaid,
      remainingBalance: 0,
      comments,
    });
    invoiceId = newInvoice.dataValues.id;
    // loop at Invoice Item and create one
    for (const item of newInvoiceItems) {
      const newInvoiceItem = await InvoiceItems.create({
        productId: item.productId,
        quantity: item.quantity,
        piecePrice: item.piecePrice,
        invoiceId: invoiceId,
      });
      const product = await Product.findByPk(item.productId);
      const stock = product.stock - item.quantity;
      await product.update({
        stock,
      });
      const itemTotalPrice =
        newInvoiceItem.quantity * newInvoiceItem.piecePrice;
      total += itemTotalPrice;
    }
    // calc remaining balance then update invoice
    remainingBalance = total - amountPaid;
    await newInvoice.update({
      total,
      remainingBalance,
    });
    return res.status(200).json({
      status_code: 200,
      data: newInvoice,
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

exports.getInvoiceItems = async (req, res, next) => {
  const invoiceId = req.params.id;
  try {
    const invoiceItems = await InvoiceItems.findAll({
      where: {
        invoiceId,
      },
      attributes: [
        "id",
        "piecePrice",
        "quantity",
        "createdAt",
        [Sequelize.col("product.name"), "productName"],
      ],
      include: {
        model: Product,
        attributes: [],
      },
    });
    invoiceItems.map((item) => {
      item.dataValues.createdAt = config.formatDate(item.dataValues.createdAt);
    });
    return res.status(200).json({
      status_code: 200,
      data: invoiceItems,
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
