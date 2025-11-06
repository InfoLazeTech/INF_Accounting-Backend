const transactionService = require("../services/transaction.service");
const { successResponse, errorResponse } = require("../utils/response");

const addTransaction = async (req, res) => {
  try {
    const { bankId, description, amount , type, date, companyId } = req.body;
    const transaction = await transactionService.addTransaction(
      bankId,
      description,
      amount,
      type,
      date,
      companyId
    );
    return successResponse(
      res,
      transaction,
      "Transaction added successfully",
      201
    );
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error While Add Transaction",
      500
    );
  }
};

const getTransactionsByBankId = async (req, res) => {
  try {
    const { bankId, companyId } = req.params;
    const { month, year } = req.query;
    const transactions = await transactionService.getTransactionsByBankId(
      bankId,
      companyId,
      month, 
      year
    );
    return successResponse(
      res, transactions.transactions, "Bank Transactions Fetched", 200, {
    openingBalance: transactions.openingBalance,
    closingBalance: transactions.closingBalance,
  });
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error While Fetching Transactions",
      500
    );
  }
};

module.exports = {
  addTransaction,
  getTransactionsByBankId,
};
