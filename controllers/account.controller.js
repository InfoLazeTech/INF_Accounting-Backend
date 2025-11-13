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
    const { search, companyId } = req.query;
    if (!companyId) {
      return errorResponse(res, "Company ID is required", httpStatus.BAD_REQUEST);
    }
    const result = await accountService.listAccounts({
      search,
      companyId,
    });

    return successResponse(
      res,
      result.data,
      "Accounts fetched successfully",
      httpStatus.OK,
      { total: result.total }
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
    const account = await accountService.getAccountById(accountId, companyId);
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
const updateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const updateData = req.body;
    const userId = req.user?._id || null;

    const account = await accountService.updateAccount(accountId, updateData, userId);
    return successResponse(res, account, "Account updated successfully");
  } catch (err) {
    const status = err.message === "Account not found" ? httpStatus.NOT_FOUND : httpStatus.BAD_REQUEST;
    return errorResponse(res, err.message || "Error while updating account", status);
  }
};
const deleteAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    await accountService.deleteAccount(accountId);
    return successResponse(res, null, "Account deleted successfully");
  } catch (err) {
    const status = err.message === "Account not found" ? httpStatus.NOT_FOUND : httpStatus.INTERNAL_SERVER_ERROR;
    return errorResponse(res, err.message || "Error while deleting account", status);
  }
};

module.exports = {
  createAccount,
  listAccounts,
  getAccountById,
  deleteAccount,
  updateAccount,
  getAccountsByCompany,
};