const { successResponse, errorResponse } = require("../utils/response");
const httpStatus = require("http-status");
const stockService = require("../services/stock.service");
const catchAsync = require("../utils/catchAsync");

const addStock = catchAsync(async (req, res) => {
  const { companyId, itemId, quantity } = req.body;
  
  if (!companyId || !itemId || !quantity) {
    return errorResponse(res, "Company ID, item ID, and quantity are required", 400);
  }

  const item = await stockService.addStock({ companyId, itemId, quantity });
  return successResponse(res, item, "Stock added successfully", httpStatus.OK);
});

const removeStock = catchAsync(async (req, res) => {
  const { companyId, itemId, quantity } = req.body;
  
  if (!companyId || !itemId || !quantity) {
    return errorResponse(res, "Company ID, item ID, and quantity are required", 400);
  }

  const item = await stockService.removeStock({ companyId, itemId, quantity });
  return successResponse(res, item, "Stock removed successfully", httpStatus.OK);
});

// Get low stock items
const getLowStockItems = catchAsync(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const items = await stockService.getLowStockItems(companyId);
  return successResponse(res, items, "Low stock items fetched successfully", httpStatus.OK);
});

// Get stock summary
const getStockSummary = catchAsync(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const summary = await stockService.getStockSummary(companyId);
  return successResponse(res, summary, "Stock summary fetched successfully", httpStatus.OK);
});

module.exports = {
  addStock,
  removeStock,
  getLowStockItems,
  getStockSummary
};
