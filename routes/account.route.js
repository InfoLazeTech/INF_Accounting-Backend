const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller");
const validate = require("../middlewares/validate");
const {
  createAccountValidation,
  getAccountByIdValidation,
  listAccountsValidation,
  updateAccountValidation,
  // updateAccountParamsValidation,
  deleteAccountValidation
} = require("../validations/account.validation");

router.post(
  "/create",
  validate(createAccountValidation),
  accountController.createAccount
);

router.get("/list", validate(listAccountsValidation), accountController.listAccounts);

router.get("/:accountId", validate(getAccountByIdValidation), accountController.getAccountById);

router.get("/", validate(listAccountsValidation), accountController.getAccountsByCompany);
router.put( "/:accountId", validate(updateAccountValidation), accountController.updateAccount
);
router.delete( "/:accountId",validate(deleteAccountValidation, "params"),accountController.deleteAccount);

module.exports = router;