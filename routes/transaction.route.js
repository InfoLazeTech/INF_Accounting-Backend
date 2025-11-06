const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");
const authToken = require("../middlewares/authToken");

router.post("/addTransaction", authToken, transactionController.addTransaction);
router.get("/bank/:bankId/:companyId", transactionController.getTransactionsByBankId); 

module.exports = router;