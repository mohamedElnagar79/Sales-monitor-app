const InvoiceItems = require("../models/invoice_items.model");
const Product = require("../models/product.model");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment");
const config = require("../config/middlewares");
const DailyExpense = require("../models/Daily_expense.model");
const Clients = require("../models/clients.model");
const Invoices = require("../models/invoice.model");
const IvoicePayments = require("../models/invoice_payments.model");
const Returns = require("../models/returns.model");
const InvoiceReturnsMoney = require("../models/invoice-returns-money.model");

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
    await IvoicePayments.create({
      total,
      amountPaid,
      remaining: remainingBalance,
      comments: comments ? comments : "",
      clientId,
      invoiceId,
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
        "invoiceId",
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
    nextDay.setHours(0, 0, 0, 0); // Start of the next day

    const invoices = await Invoices.findAll({
      attributes: [
        "id",
        "total",
        "amountPaid",
        "remainingBalance",
        "updatedAt",
      ],
      where: {
        createdAt: {
          [Op.between]: [specifiedDate, nextDay],
        },
      },
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: InvoiceItems,
          required: false,
          attributes: [
            "id",
            "quantity",
            "piecePrice",
            // [Sequelize.col("product.id"), "productId"],
          ],
          include: {
            model: Product,
            attributes: ["id", "name"],
          },
        },
        {
          model: Clients,
          required: false,
          attributes: ["id", "name", "phone"],
        },
      ],
    });

    const dailyExpense = await DailyExpense.findAll({
      attributes: ["id", "amount", "expenseName", "description"],
      where: {
        createdAt: {
          [Op.between]: [specifiedDate, nextDay],
        },
      },
      order: [["updatedAt", "DESC"]],
    });

    const invoice_payments = await IvoicePayments.findAll({
      attributes: ["id", "total", "amountPaid", "remaining", "invoiceId"],
      where: {
        createdAt: {
          [Op.between]: [specifiedDate, nextDay],
        },
      },
      include: { model: Clients, required: false, attributes: ["id", "name"] },
    });
    const totalAmountPaid = invoice_payments.reduce(
      (sum, invoice_payments) => sum + parseFloat(invoice_payments.amountPaid),
      0
    );
    const oldPayments = invoice_payments.filter((payment) => {
      for (const invoice of invoices) {
        if (invoice.id === payment.invoiceId) {
          return false; // Payment has a matching invoice
        }
      }
      return true; // Payment does not have a matching invoice
    });
    console.log("oldPayments  =  =>", oldPayments.dataValues);
    const totalDailyExpense = dailyExpense.reduce(
      (sum, expense) => sum + parseFloat(expense.amount),
      0
    );
    dailyExpense.map((outgoing) => {
      outgoing.description = config.truncateText(outgoing.description, 50);
    });
    invoices.map((invoice) => {
      invoice.dataValues.updatedAt = moment(
        invoice.dataValues.updatedAt
      ).format("DD/MM/YYYY");
    });
    console.log("totalAmountPaid ==> ", totalAmountPaid);
    console.log("Daily_expense ==> ", totalDailyExpense);

    const totalExistMoney = totalAmountPaid - totalDailyExpense;

    return res.status(200).json({
      status_code: 200,
      data: {
        invoices,
        dailyExpense,
        totalAmountPaid,
        oldPayments,
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

exports.deleteInvoiceItem = async (req, res, next) => {
  try {
    const id = req.params.id;
    let returnedMoney = 0;
    let productName;
    const invoiceItem = await InvoiceItems.findByPk(id);
    if (invoiceItem) {
      console.log("invoice item ", invoiceItem.dataValues);
      // delete this invoice item first
      const productId = invoiceItem.dataValues.productId;
      await invoiceItem.destroy();
      // increase quantity of product or create new one if it deleted
      const product = await Product.findByPk(productId);
      productName = product.dataValues.name;
      if (product) {
        const newStock =
          product.dataValues.stock + invoiceItem.dataValues.quantity;
        product.update({
          stock: newStock,
        });
      } else {
        await Product.create({
          name: product.dataValues.name,
          stock: invoiceItem.dataValues.quantity,
          price: invoiceItem.dataValues.piecePrice,
          soldPrice: invoiceItem.dataValues.piecePrice,
        });
      }
      // create new return
      await Returns.create({
        quantity: invoiceItem.dataValues.quantity,
        productId: invoiceItem.dataValues.productId,
      });
      const invoice_items = await InvoiceItems.findAll({
        where: {
          invoiceId: invoiceItem.dataValues.invoiceId,
        },
      });
      const invoice = await Invoices.findByPk(invoiceItem.dataValues.invoiceId);
      if (invoice) {
        if (invoice_items.length > 0) {
          console.log("there is another items ===>>>", invoice_items);
          let total = 0;
          console.log("invoiceItems ", invoice_items);
          for (const item of invoice_items) {
            const itemTotalPrice = item.quantity * item.piecePrice;
            total += itemTotalPrice;
          }
          if (total >= invoice.dataValues.amountPaid) {
            // now client will not take money
            const remainingBalance = total - invoice.dataValues.amountPaid;
            await invoice.update({
              total,
              remainingBalance,
            });
          } else {
            // now user will take money and we will create new expense as return
            returnedMoney = invoice.dataValues.amountPaid - total;
            await invoice.update({
              total,
              remainingBalance: 0,
              amountPaid: total,
            });
            if (returnedMoney > 0) {
              await InvoiceReturnsMoney.create({
                invoiceId: invoice.dataValues.id,
                clientId: invoice.dataValues.clientId,
                returned_money: returnedMoney,
              });
            }
          }
        } else {
          console.log("there is not other items ");

          // if not it means that this is only one check here to the invoice and calc if remainder and returned money or not
          // if user paid thie invoice he will take returnedMoney and delete invoice and create expense
          returnedMoney = invoice.dataValues.amountPaid;
          await invoice.destroy();
        }
      }

      // create deaily espense if user will take remainer
      // i will get invoice items and calc invoice agian
    } else {
      return res.status(404).json({
        status_code: 404,
        data: null,
        message: "item not found or is already deleted",
      });
    }
    if (returnedMoney != 0) {
      let deletedQuantity = invoiceItem.dataValues.quantity;
      await DailyExpense.create({
        amount: returnedMoney,
        expenseName: "مرتجع",
        description:
          deletedQuantity > 1
            ? `${deletedQuantity} - ` + productName
            : productName,
      });
    }
    return res.status(200).json({
      status_code: 200,
      data: returnedMoney,
      message: "item deleted succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: error.message,
    });
  }
};
