const express = require("express");
const router = express.Router();
const config = require("../config/middlewares");
const clientsController = require("../controllers/clients.controller");
const {
  getClientsListValidation,
} = require("../validations/clients.validation");

router
  .route("clients-list")
  .get(
    config.auth,
    getClientsListValidation,
    config.mwError,
    clientsController.getlistOfClients
  );

module.exports = router;
