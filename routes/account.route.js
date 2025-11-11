const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller");
const validate = require("../middlewares/validate");
const {
  createAccountValidation,
} = require("../validations/account.validation");

router.post(
  "/create",
  validate(createAccountValidation),
  accountController.createAccount
);

router.get("/list", accountController.listAccounts);

router.get("/:accountId", accountController.getAccountById);

router.get("/", accountController.getAccountsByCompany);

module.exports = router;