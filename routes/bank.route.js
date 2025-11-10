const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bank.controller");
const validate = require("../middlewares/validate");
const {createBankAccountValidation, updateBankAccountValidation} = require("../validations/bank.validations");

router.post("/createBank", validate(createBankAccountValidation), bankController.createBankAccount);
router.post("/updateBank/:bankId", validate(updateBankAccountValidation), bankController.updateBankAccount);
router.get("/listBanks", bankController.listBankAccounts);
router.get("/getBank/:bankId", bankController.getBankAccountById);
router.get("/getBankslist", bankController.BankAccounts);

module.exports = router;
