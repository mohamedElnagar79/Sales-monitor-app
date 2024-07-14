const { Op, Sequelize } = require("sequelize");
const moment = require("moment");
const config = require("../config/middlewares");
const Invoices = require("../models/invoice.model");
const Clients = require("../models/clients.model");

exports.getInvoices = async (req, res) => {
  try {
    const search = req.query.search;

    const startOfYesterday = moment()
      .subtract(1, "days")
      .startOf("day")
      .toDate();
    const now = moment().toDate();
    const invoices = await Invoices.findAll({
      attributes: [
        "id",
        // [Sequelize.col("Clients.id"), "clientId"],
        // [Sequelize.col("Clients.name"), "clientName"],
        "total",
        "amountPaid",
        "remainingBalance",
        "comments",
        "createdAt",
      ],
      where: whereClause,
      include: {
        model: Clients,
        required: false,
        // attributes: [],
      },
      order: [["createdAt", "DESC"]],
    });
    invoices.rows.map((item) => {
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
