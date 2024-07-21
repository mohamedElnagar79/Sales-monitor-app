const { Sequelize } = require("sequelize");
const DailyExpense = require("../models/Daily_expense.model");
const Product = require("../models/product.model");
const Returns = require("../models/returns.model");
// const Sales = require("../models/sales.model");

// exports.addNewReturn = async (req, res, next) => {
//   const { SaleId, quantity, reasone } = req.body;
//   try {
//     const saleObj = await Sales.findByPk(SaleId, {
//       attributes: [
//         "id",
//         "quantity",
//         "piecePrice",
//         "total",
//         "amountPaid",
//         "remainingBalance",
//         "clientName",
//         "comments",
//         // "productId",
//         [Sequelize.col("product.id"), "productId"],
//         [Sequelize.col("product.name"), "productName"],
//       ],
//       include: {
//         model: Product,
//         required: false,
//         attributes: [],
//       },
//     });
//     if (!saleObj) {
//       throw new Error("Sale not found");
//     }
//     if (saleObj.quantity < quantity) {
//       return res.status(400).json({
//         status_code: 400,
//         data: null,
//         message: "enter a valid quantity to return",
//       });
//     }
//     const newReturnObject = await Returns.create({
//       SaleId,
//       quantity,
//       reasone,
//     });
//     if (newReturnObject) {
//       let returnedCost = saleObj.piecePrice * quantity;
//       if (saleObj.quantity == 1 && quantity == 1) {
//         await saleObj.destroy();
//       } else {
//         saleObj.quantity -= quantity;
//         saleObj.total = saleObj.piecePrice * saleObj.quantity;
//         if (saleObj.remainingBalance > 0) {
//           if (returnedCost > saleObj.remainingBalance) {
//             returnedCost -= saleObj.remainingBalance;
//             saleObj.remainingBalance = 0;
//           } else {
//             saleObj.remainingBalance -= returnedCost;
//             returnedCost = 0;
//           }
//         }
//         if (saleObj.total != saleObj.remainingBalance) {
//           saleObj.amountPaid = saleObj.total - saleObj.remainingBalance;
//         }
//         await saleObj.save();
//         if (saleObj.quantity == 0) {
//           await saleObj.destroy();
//         }
//       }
//       saleObj.dataValues.returnedCost = returnedCost;
//       if (returnedCost > 0) {
//         console.log("helllooo");
//         const Expenses = await DailyExpense.create({
//           amount: returnedCost,
//           expenseName: "مرتجع",
//           description: saleObj.dataValues.productName,
//           reasone,
//         });
//       }

//       console.log("returnedCost===>   ", returnedCost);
//       return res.status(200).json({
//         status_code: 200,
//         data: saleObj,
//         message: "done",
//       });
//     } else throw new Error("error while return product");
//   } catch (error) {
//     return res.status(500).json({
//       status_code: 500,
//       data: null,
//       message: error.message,
//     });
//   }
// };
