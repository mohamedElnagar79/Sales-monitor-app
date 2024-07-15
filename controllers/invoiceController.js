const { Op, Sequelize } = require("sequelize");
const moment = require("moment");
const config = require("../config/middlewares");
const Invoices = require("../models/invoice.model");
const Clients = require("../models/clients.model");
const InvoiceItems = require("../models/invoice_items.model");

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
