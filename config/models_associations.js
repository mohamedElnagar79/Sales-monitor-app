// const User = require("../models/user.model");
const invoice_items = require("../models/invoice_items.model");
const Product = require("../models/product.model");
const Returns = require("../models/returns.model");
const Clients = require("../models/clients.model");
const Invoices = require("../models/invoice.model");
const IvoicePayments = require("../models/invoice_payments.model");
Product.hasMany(invoice_items);
invoice_items.belongsTo(Product);

invoice_items.hasMany(Returns);
Returns.belongsTo(invoice_items);

Invoices.hasMany(invoice_items);
invoice_items.belongsTo(Invoices);

Clients.hasMany(Invoices);
Invoices.belongsTo(Clients);

Clients.hasMany(IvoicePayments);
IvoicePayments.belongsTo(Clients);

Invoices.hasMany(IvoicePayments);
IvoicePayments.belongsTo(Invoices);
