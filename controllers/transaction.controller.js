const transactionService = require("../services/transaction.service");
const { successResponse, errorResponse } = require("../utils/response");

const addTransaction = async (req, res) => {
  try {
    const { bankId, description, amount, type, date, companyId } = req.body;
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

const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { description, amount, type, date } = req.body;
    const transaction = await transactionService.updateTransaction(
      transactionId,
      description,
      amount,
      type,
      date
    );
    return successResponse(
      res,
      transaction,
      "Transaction Updating successfully",
      201
    );
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error While Update Transaction",
      500
    );
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await transactionService.deleteTransaction(
      transactionId
    );
    return successResponse(res, null, "Transaction Deleted successfully", 201);
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error While Delete Transaction",
      500
    );
  }
};

const getTransactionsByBankId = async (req, res) => {
  try {
    const { bankId, companyId } = req.params;
    const { startDate, endDate } = req.query;
    const transactions = await transactionService.getTransactionsByBankId(
      bankId,
      companyId,
      startDate,
      endDate
    );
    return successResponse(
      res,
      transactions.transactions,
      "Bank Transactions Fetched",
      200,
      {
        openingBalance: transactions.openingBalance,
        closingBalance: transactions.closingBalance,
      }
    );
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
  updateTransaction,
  deleteTransaction,
  getTransactionsByBankId,
};
