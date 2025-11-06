const bankService = require("../services/bank.service");
const { successResponse, errorResponse } = require("../utils/response");

const createBankAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bankName, accountNumber, companyId, openingBalance } = req.body;
    const bank = await bankService.createBankAccount(bankName, accountNumber, userId, companyId, openingBalance);
    return successResponse(res, bank, "Bank account created successfully", 201);
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error While Creating Bank Account",
      500
    );
  }
};

const listBankAccounts = async (req, res) => {
  try {
    const banks = await bankService.listBankAccounts();
    return successResponse(
      res,
      banks,
      "Bank accounts fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error While Fetching Bank Accounts",
      500
    );
  }
};

const getBankAccountById = async (req, res) => {
  try {
    const { bankId } = req.params;

    const bank = await bankService.getBankAccountById(bankId);
    return successResponse(res, bank, "Bank account fetched successfully", 200);
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error While Fetching Bank Account",
      500
    );
  }
};
module.exports = {
  createBankAccount,
  listBankAccounts,
  getBankAccountById,
};
