const httpStatus = require('http-status');
const { successResponse, errorResponse } = require("../utils/response");
const companyService = require("../services/company.service");
const { AUTH_MESSAGES } = require("../types/messages");

const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const updateData = req.body;

    const company = await companyService.updateCompany(companyId, updateData);

    return successResponse(res, company, "Company updated successfully", httpStatus.OK);
  } catch (error) {
    // Handle different error types from service
    const message = error.message || "Company update failed";
    const statusCode = error.statusCode || httpStatus.BAD_REQUEST;
    
    return errorResponse(res, message, statusCode);
  }
};

const getCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await companyService.getCompany(companyId);
    
    return successResponse(res, company, "Company fetched successfully", httpStatus.OK);
  } catch (error) {
    // Handle different error types from service
    const message = error.message || "Company fetch failed";
    
    const statusCode = error.statusCode || httpStatus.NOT_FOUND;
    
    return errorResponse(res, message, statusCode);
  }
};

module.exports = { updateCompany, getCompany };
