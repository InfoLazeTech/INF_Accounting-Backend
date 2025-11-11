const accountService = require("../services/account.service");
const { successResponse, errorResponse } = require("../utils/response");

const createAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { companyId, parenttype, accountname, accountcode, description } = req.body;

    const account = await accountService.createAccount(
      companyId,
      parenttype,
      accountname,
      accountcode,
      description,
      userId
    );

    return successResponse(res, account, "Account created successfully", 201);
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error while creating account",
      500
    );
  }
};



const listAccounts = async (req, res) => {
  try {
    const { search, page, limit, companyId } = req.query;
    const result = await accountService.listAccounts({
      search,
      page,
      limit,
      companyId,
    });

    return successResponse(
      res,
      result.data,
      "Accounts fetched successfully",
      200,
      result.pagination
    );
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error while fetching accounts",
      500
    );
  }
};

const getAccountById = async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await accountService.getAccountById(accountId);
    if (!account) throw new Error("Account not found");

    return successResponse(res, account, "Account fetched successfully", 200);
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error while fetching account",
      500
    );
  }
};

const getAccountsByCompany = async (req, res) => {
  try {
    const { companyId } = req.query;
    const accounts = await accountService.getAccountsByCompany(companyId);
    return successResponse(
      res,
      accounts,
      "Accounts fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err.message || "Error while fetching accounts",
      500
    );
  }
};

module.exports = {
  createAccount,
  listAccounts,
  getAccountById,
  getAccountsByCompany,
};