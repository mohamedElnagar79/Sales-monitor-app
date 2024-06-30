const Returns = require("../models/returns.model");
const Sales = require("../models/sales.model");

exports.addNewReturn = async (req, res, next) => {
  const { SaleId, quantity, description, reasone } = req.body;
  try {
    const newReturnObject = await Returns.create({
      SaleId,
      quantity,
      description,
      reasone,
    });

    if (newReturnObject) {
      console.log("newReturnObject ", newReturnObject.dataValues);
      const saleObj = await Sales.findByPk(SaleId);
      if (!saleObj) {
        throw new Error("Sale not found");
      }
      let returnedCost = saleObj.piecePrice * quantity;
      //   returnedCost=saleObj.remainingBalance==0?returnedCost
      console.log("returnedCost ", returnedCost);
      console.log("saleobj  ", saleObj.dataValues);
      saleObj.quantity -= quantity;
      saleObj.total = saleObj.piecePrice * saleObj.quantity;
      //   saleObj.amountPaid -= returnedCost;
      let newAmountPaid;
      if (saleObj.total != saleObj.amountPaid) {
        newAmountPaid = saleObj.amountPaid - returnedCost;
      } else {
        newAmountPaid = saleObj.total;
      }

      if (saleObj.remainingBalance > 0) {
        if (returnedCost > saleObj.remainingBalance) {
          returnedCost -= saleObj.remainingBalance;
          saleObj.remainingBalance = 0;
        } else {
          saleObj.remainingBalance -= returnedCost;
          returnedCost = 0;
        }
      }
      //   saleObj.remainingBalance =
      //     saleObj.remainingBalance > 0
      //       ? saleObj.remainingBalance - returnedCost
      //       : saleObj.remainingBalance;
      //   returnedCost =
      //     saleObj.remainingBalance == 0 ? saleObj.remainingBalance : returnedCost;
      console.log("after modification  ", saleObj.dataValues);
      //   saleObj.update({
      //     saleObj,
      //   });
      saleObj.amountPaid = newAmountPaid;

      await saleObj.save();
      saleObj.dataValues.returnedCost = returnedCost;
      console.log("returnedCost===>   ", returnedCost);
      return res.status(200).json({
        status_code: 200,
        data: saleObj,
        message: "done",
      });
    } else throw new Error("error while return product");
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: error.message,
    });
  }
};
