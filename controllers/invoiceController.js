const { Op, Sequelize } = require("sequelize");
const moment = require("moment");
const config = require("../config/middlewares");
const Invoices = require("../models/invoice.model");
const Clients = require("../models/clients.model");
const InvoiceItems = require("../models/invoice_items.model");
const Product = require("../models/product.model");
const IvoicePayments = require("../models/invoice_payments.model");
const InvoiceReturnsMoney = require("../models/invoice-returns-money.model");
const Returns = require("../models/returns.model");
const DailyExpense = require("../models/Daily_expense.model");

exports.getInvoices = async (req, res) => {
  try {
    const searchDate = req.query.date ? moment(req.query.date) : moment();

    const startOfDay = searchDate.startOf("day").toDate();
    const endOfDay = searchDate.endOf("day").toDate();

    console.log("startOfDay: ", startOfDay);
    console.log("endOfDay: ", endOfDay);

    const invoices = await Invoices.findAll({
      attributes: [
        "id",
        [Sequelize.col("client.name"), "clientName"],
        "total",
        "amountPaid",
        "remainingBalance",
        "createdAt",
        [
          Sequelize.literal(
            "(SELECT COUNT(*) FROM invoice_items WHERE invoice_items.invoiceId = Invoices.id)"
          ),
          "itemCount",
        ],
      ],
      include: [
        {
          model: Clients,
          required: false,
          attributes: [],
        },
        {
          model: InvoiceItems,
          required: false,
          attributes: [],
        },
      ],

      where: {
        createdAt: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    invoices.map((item) => {
      item.dataValues.createdAt = config.formatDate(item.dataValues.createdAt);
    });

    return res.status(200).json({
      status_code: 200,
      data: invoices,
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

exports.getOneInvoiceById = async (req, res) => {
  const invoiceId = req.params.id;
  try {
    const invoice = await Invoices.findByPk(invoiceId, {
      attributes: [
        "id",
        "amountPaid",
        "remainingBalance",
        "total",
        [Sequelize.col("client.name"), "clientName"],
        [Sequelize.col("client.id"), "clientId"],
        [Sequelize.col("client.phone"), "phone"],
      ],
      include: [
        {
          model: Clients,
          required: false,
          attributes: [],
        },
        {
          model: InvoiceItems,
          required: false,
          attributes: ["id", "piecePrice", "quantity", "productId"],
          include: {
            model: Product,
            required: false,
            attributes: ["name"],
          },
        },
      ],
    });
    if (invoice) {
      invoice.invoice_items.map((item) => {
        item.dataValues.productName = item.dataValues.product.name;
        delete item.dataValues.product;
      });
    }
    return res.status(200).json({
      status_code: 200,
      data: invoice,
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

exports.getInvoicePayments = async (req, res) => {
  const invoiceId = req.params.id;
  try {
    let totalOfOldPaid = 0;
    let returnesMoney = 0;
    const Invoice_returnes_money = await InvoiceReturnsMoney.findAll({
      where: {
        invoiceId,
      },
    });
    Invoice_returnes_money.map((item) => {
      returnesMoney += item.dataValues.returned_money;
    });
    const payments = await IvoicePayments.findAll({
      attributes: ["id", "total", "amountPaid", "remaining", "createdAt"],
      where: {
        invoiceId,
      },
    });
    payments.map((item) => {
      totalOfOldPaid += item.dataValues.amountPaid - returnesMoney;
      item.dataValues.createdAt = moment(item.dataValues.createdAt).format(
        "DD/MM/YYYY"
      );
    });
    console.log("tota     l   ", totalOfOldPaid);
    return res.status(200).json({
      status_code: 200,
      data: {
        totalOfOldPaid,
        returnesMoney,
        payments,
      },
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

exports.updateInvoice = async (req, res) => {
  try {
    const { invoiceId, updatedinvoiceItems, newPayments } = req.body;
    let returnedItems = [];
    let totalReturnedAmount = 0;
    const invoice = await Invoices.findByPk(invoiceId);
    for (const invoiceItem of updatedinvoiceItems) {
      try {
        const item = await InvoiceItems.findByPk(invoiceItem.id);
        const oldquantity = item.dataValues.quantity;
        await item.update({
          quantity: invoiceItem.quantity,
          piecePrice: invoiceItem.piecePrice,
        });

        const product = await Product.findByPk(item.dataValues.productId);
        if (product != null) {
          const oldStock = product.dataValues.stock;

          if (oldquantity < invoiceItem.quantity) {
            // Decrease product stock if client increases quantity
            const newQuantity = invoiceItem.quantity - oldquantity;
            const newStock = oldStock - newQuantity;
            await product.update({ stock: newStock });
          } else if (oldquantity > invoiceItem.quantity) {
            // Increase product stock if user returns some items
            const newQuantity = oldquantity - invoiceItem.quantity;
            const newStock = oldStock + newQuantity;
            await product.update({ stock: newStock });

            // Create new return
            await Returns.create({
              quantity: newQuantity,
              productId: invoiceItem.productId,
            });
            let returnedItemPrice = newQuantity * invoiceItem.piecePrice;
            console.log("say hi ", returnedItemPrice);

            if (returnedItemPrice > 0 && invoice) {
              console.log("heloo000 ");
              console.log("heloo000 ", returnedItemPrice);
              await InvoiceReturnsMoney.create({
                invoiceId,
                clientId: invoice.clientId,
                returned_money: returnedItemPrice,
              });
            }
            // Add to returned items array
            returnedItems.push({
              quantity: newQuantity,
              name: product.dataValues.name,
            });
            totalReturnedAmount += newQuantity * invoiceItem.piecePrice;
          }
          const invoice_items = await InvoiceItems.findAll({
            where: { invoiceId: invoiceId },
          });
          if (invoice) {
            if (invoice_items.length > 0) {
              let total = 0;
              for (const item of invoice_items) {
                const itemTotalPrice = item.quantity * item.piecePrice;
                total += itemTotalPrice;
              }
              let remainingBalance = 0;
              if (total >= invoice.amountPaid) {
                remainingBalance = total - invoice.dataValues.amountPaid;
                await invoice.update({ total, remainingBalance });
              } else {
                console.log("total<<<>>>>>>>paid ");
                const returnedMoney = invoice.dataValues.amountPaid - total;
                console.log("returned MMoney", returnedMoney);
                await invoice.update({
                  total,
                  remainingBalance: remainingBalance, //0
                  amountPaid: invoice.amountPaid - returnedMoney,
                });
                // if (returnedMoney > 0) {
                //   await invoice.update({
                //     amountPaid: invoice.amountPaid - returnedMoney,
                //   });
                // }
              }
            }
          }
        }
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    }

    // Create a single DailyExpense entry after processing all updated invoice items
    if (returnedItems.length > 0) {
      const descriptions = returnedItems
        .map((item) => `${item.quantity} - ${item.name}`)
        .join(", ");
      await DailyExpense.create({
        amount: totalReturnedAmount,
        expenseName: "مرتجع",
        description: descriptions,
      });
    }
    if (newPayments.length > 0) {
      let remainder = 0;
      let paymentPaid = 0;
      for (const payment of newPayments) {
        try {
          await IvoicePayments.create({
            total: payment.total,
            amountPaid: payment.amountPaid,
            remaining: payment.remaining,
            clientId: invoice.clientId,
            invoiceId,
          });
          remainder = payment.remaining;
          paymentPaid += payment.amountPaid;
        } catch (error) {
          console.error("Error creating payment:", error);
        }
      }
      // calc here remainder

      await Invoices.update(
        {
          amountPaid: invoice.amountPaid + paymentPaid,
          remainingBalance: remainder,
        },
        { where: { id: invoiceId } }
      );
    }

    return res.status(200).json({
      status_code: 200,
      data: null,
      message: "updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: error.message,
    });
  }
};
