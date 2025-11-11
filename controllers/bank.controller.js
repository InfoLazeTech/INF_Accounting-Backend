const bankService = require("../services/bank.service");
const { successResponse, errorResponse } = require("../utils/response");

const createBankAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bankName, accountNumber, companyId, openingBalance } = req.body;
    const bank = await bankService.createBankAccount(
      bankName,
      accountNumber,
      userId,
      companyId,
      openingBalance
    );
    return successResponse(res, bank, "Bank account created successfully", 201);
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error While Creating Bank Account",
      500
    );
  }
};

const updateBankAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bankId } = req.params;
    const { bankName, accountNumber, openingBalance } = req.body;
    const updates = { bankName, accountNumber, openingBalance };
    const bank = await bankService.updateBankAccount(bankId, updates, userId);
    return successResponse(res, bank, "Bank account updated successfully", 201);
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error While Updating Bank Account",
      500
    );
  }
};

const listBankAccounts = async (req, res) => {
  try {
    const { companyId, search, page, limit } = req.query;
    const banks = await bankService.listBankAccounts({ companyId, search, page, limit });
    return successResponse(
      res,
      banks.data,
      "Bank accounts fetched successfully",
      200,
      banks.pagination
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

const BankAccounts = async (req, res) => {
  try {
    const { companyId } = req.query;
    const bank = await bankService.getBankAccounts(companyId);
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
  updateBankAccount,
  listBankAccounts,
  getBankAccountById,
  BankAccounts,
};
