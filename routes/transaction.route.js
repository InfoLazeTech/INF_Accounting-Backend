const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");
const validate = require("../middlewares/validate");
const {addTransactionValidation,updateTransactionValidation,deleteTransactionValidation} = require("../validations/transaction.validation");

router.post("/addTransaction", validate(addTransactionValidation), transactionController.addTransaction);
router.put("/updateTransaction/:transactionId", validate(updateTransactionValidation), transactionController.updateTransaction);
router.delete("/deleteTransaction/:transactionId", transactionController.deleteTransaction);
router.get("/bank/:bankId/:companyId", transactionController.getTransactionsByBankId);

module.exports = router;
