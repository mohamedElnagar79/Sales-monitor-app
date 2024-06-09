const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const config = require("../config/middlewares");
const {
  userValidationAdd,
  validateForgetPassword,
  validateHash,
  validateUpdateUserAccount,
  validateUpdateUserPassword,
} = require("../validations/user.validation.js");

router
  .route("/sign-up")
  .post(userValidationAdd, config.mwError, userController.createNewUser);

router
  .route("/forget-password")
  .post(validateForgetPassword, config.mwError, userController.forgetPassword);

router
  .route("/update-password/:hash")
  .post(validateHash, config.mwError, userController.checkForgetHash);

router
  .route("/my-profile")
  .get(config.auth, userController.getUserInfoForSettings);

router
  .route("/update-user-profile")
  .put(
    config.auth,
    validateUpdateUserAccount,
    config.mwError,
    userController.updateUserAccount
  );

router
  .route("/delete-user-account")
  .delete(config.auth, userController.deleteUserAccount);

router
  .route("/update-user-password")
  .put(
    config.auth,
    validateUpdateUserPassword,
    config.mwError,
    userController.updateUserPassword
  );

module.exports = router;
