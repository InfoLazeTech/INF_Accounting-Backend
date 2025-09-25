const { successResponse } = require("../utils/response");
const catchAsync = require("../utils/catchAsync");
const companyService = require("../services/company.service");

const updateCompany = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const updateData = req.body;

  const company = await companyService.updateCompany(companyId, updateData);

  return successResponse(res, company, "Company updated successfully");
});

const getCompany = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const company = await companyService.getCompany(companyId);
  return successResponse(res, company, "Company fetched successfully");
});

module.exports = { updateCompany, getCompany };
