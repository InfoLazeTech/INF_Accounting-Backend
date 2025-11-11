const accountService = require("../services/account.service");
const { successResponse, errorResponse } = require("../utils/response");
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");

const createAccount = async (req, res) => {
  try {
    const { companyId, parenttype, accountname, accountcode, description } = req.body;

    const account = await accountService.createAccount(
      companyId,
      parenttype,
      accountname,
      accountcode,
      description,
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
    if (!companyId) {
    return errorResponse(res, "Company ID is required", httpStatus.BAD_REQUEST);
  }
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
      httpStatus.OK,
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
    const { companyId } = req.query;
    if (!companyId) {
    return errorResponse(res, "Company ID is required", httpStatus.BAD_REQUEST);
  }
    const account = await accountService.getAccountById(accountId,companyId);
  if (!account) {
    return errorResponse(res, "Account not found", httpStatus.NOT_FOUND);
  }
    return successResponse(res, account, "Account fetched successfully", httpStatus.OK);
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