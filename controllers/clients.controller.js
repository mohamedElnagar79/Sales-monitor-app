const { Op } = require("sequelize");
const Clients = require("../models/clients.model");

exports.getlistOfClients = async (req, res, next) => {
  try {
    const name = req.query.name;
    const phone = req.query.phone;
    let whereClause = name
      ? {
          name: {
            [Op.like]: `%${name}%`,
          },
        }
      : {};
    whereClause = phone
      ? {
          phone: {
            [Op.like]: `%${phone}%`,
          },
        }
      : whereClause;
    const clients = await Clients.findAll({
      attributes: ["id", "name", "phone"],
      order: [["createdAt", "DESC"]],
      where: whereClause,
    });
    return res.status(200).json({
      status_code: 200,
      data: clients,
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
