const { successResponse, errorResponse } = require("../utils/response");
const httpStatus = require("http-status");
const stockService = require("../services/stock.service");
const invoiceService = require("../services/invoice.service");
const catchAsync = require("../utils/catchAsync");
const Item = require("../models/itemMaster.model");

/**
 * Add stock manually to an item
 * POST /item-configuration/add-stock
 */
const addStock = catchAsync(async (req, res) => {
  const { companyId, itemId, quantity, reason } = req.body;

  if (!companyId || !itemId || !quantity) {
    return errorResponse(res, "Company ID, item ID, and quantity are required", 400);
  }

  if (quantity <= 0) {
    return errorResponse(res, "Quantity must be greater than 0", 400);
  }

  try {
    const item = await stockService.addStock({ companyId, itemId, quantity });
    
    return successResponse(
      res,
      {
        item,
        adjustment: {
          type: "add",
          quantity,
          reason: reason || "Manual stock addition",
          newStock: item.availableStock,
        },
      },
      "Stock added successfully",
      httpStatus.OK
    );
  } catch (error) {
    const message = error.message || "Failed to add stock";
    const statusCode = error.statusCode || httpStatus.BAD_REQUEST;
    
    return errorResponse(res, message, statusCode);
  }
});

/**
 * Remove stock manually from an item
 * POST /item-configuration/remove-stock
 */
const removeStock = catchAsync(async (req, res) => {
  const { companyId, itemId, quantity, reason } = req.body;

  if (!companyId || !itemId || !quantity) {
    return errorResponse(res, "Company ID, item ID, and quantity are required", 400);
  }

  if (quantity <= 0) {
    return errorResponse(res, "Quantity must be greater than 0", 400);
  }

  try {
    const item = await stockService.removeStock({ companyId, itemId, quantity });
    
    return successResponse(
      res,
      {
        item,
        adjustment: {
          type: "remove",
          quantity,
          reason: reason || "Manual stock removal",
          newStock: item.availableStock,
        },
      },
      "Stock removed successfully",
      httpStatus.OK
    );
  } catch (error) {
    const message = error.message || "Failed to remove stock";
    const statusCode = error.statusCode || httpStatus.BAD_REQUEST;
    
    return errorResponse(res, message, statusCode);
  }
});

/**
 * Get available stock for an item
 * GET /item-configuration/available-stock
 */
const getAvailableStock = catchAsync(async (req, res) => {
  const { companyId, itemId } = req.query;

  if (!companyId || !itemId) {
    return errorResponse(res, "Company ID and item ID are required", 400);
  }

  try {
    const item = await Item.findOne({
      _id: itemId,
      companyId: companyId,
    }).select("itemId name sku availableStock openingStock reorderLevel unitOfMeasure");

    if (!item) {
      return errorResponse(res, "Item not found for this company", 404);
    }

    return successResponse(
      res,
      {
        itemId: item._id,
        itemCode: item.itemId,
        itemName: item.name,
        sku: item.sku,
        availableStock: item.availableStock,
        openingStock: item.openingStock,
        reorderLevel: item.reorderLevel,
        unitOfMeasure: item.unitOfMeasure,
        stockStatus: item.availableStock <= item.reorderLevel ? "low" : "normal",
      },
      "Available stock fetched successfully",
      httpStatus.OK
    );
  } catch (error) {
    const message = error.message || "Failed to get available stock";
    const statusCode = error.statusCode || httpStatus.BAD_REQUEST;
    
    return errorResponse(res, message, statusCode);
  }
});

/**
 * Get item sales details from invoices
 * GET /item-configuration/item-sales-details
 */
const getItemSalesDetails = catchAsync(async (req, res) => {
  const { companyId, itemId, customerId, page, limit } = req.query;

  if (!companyId || !itemId) {
    return errorResponse(res, "Company ID and item ID are required", 400);
  }

  try {
    const result = await invoiceService.getItemSalesDetails(
      companyId,
      itemId,
      {
        customerId: customerId || undefined,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      }
    );

    return successResponse(
      res,
      result.sales,
      "Item sales details fetched successfully",
      httpStatus.OK,
      result.pagination
    );
  } catch (error) {
    const message = error.message || "Failed to get item sales details";
    const statusCode = error.statusCode || httpStatus.BAD_REQUEST;
    
    return errorResponse(res, message, statusCode);
  }
});

module.exports = {
  addStock,
  removeStock,
  getAvailableStock,
  getItemSalesDetails,
};

