const { checkAttachmentType } = require("../middlewares/helperFunctions");
const mwError = require("../middlewares/validationMW");
const auth = require("../middlewares/authMW");
module.exports = {
  checkAttachmentType,
  mwError,
  auth,
};
