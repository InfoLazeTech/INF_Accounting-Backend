const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bank.controller");
const authToken = require("../middlewares/authToken");

router.post("/createBank", authToken, bankController.createBankAccount);
router.get("/listBanks", bankController.listBankAccounts);
router.get("/:bankId", bankController.getBankAccountById);

module.exports = router;