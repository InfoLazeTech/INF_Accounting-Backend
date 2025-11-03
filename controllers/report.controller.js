const reportService = require("../services/report.service");
const { successResponse, errorResponse } = require("../utils/response");

// Generate Sales Report (on-the-fly)
const generateSalesReport = async (req, res) => {
  try {
    const { companyId, startDate, endDate, customerId, status } = req.query;

    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }

    const filters = {
      startDate,
      endDate,
      customerId,
      status
    };

    const result = await reportService.generateSalesReport(companyId, filters);

    return successResponse(
      res,
      result,
      "Sales report generated successfully"
    );
  } catch (error) {
    const message = error.message || "Failed to generate sales report";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Generate Purchase Report (on-the-fly)
const generatePurchaseReport = async (req, res) => {
  try {
    const { companyId, startDate, endDate, vendorId, status } = req.query;

    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }

    const filters = {
      startDate,
      endDate,
      vendorId,
      status
    };

    const result = await reportService.generatePurchaseReport(companyId, filters);

    return successResponse(
      res,
      result,
      "Purchase report generated successfully"
    );
  } catch (error) {
    const message = error.message || "Failed to generate purchase report";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Get Sales Summary (Quick stats)
const getSalesSummary = async (req, res) => {
  try {
    const { companyId, startDate, endDate, customerId, status, page, limit } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }

    const filters = {
      startDate,
      endDate,
      customerId,
      status,
      page,
      limit
    };

    const result = await reportService.getSalesSummary(companyId, filters);

    return successResponse(
      res,
      result,
      "Sales summary fetched successfully"
    );
  } catch (error) {
    const message = error.message || "Failed to fetch sales summary";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Get Purchase Summary (Quick stats)
const getPurchaseSummary = async (req, res) => {
  try {
    const { companyId, startDate, endDate, vendorId, status, page, limit } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }

    const filters = {
      startDate,
      endDate,
      vendorId,
      status,
      page,
      limit
    };

    const result = await reportService.getPurchaseSummary(companyId, filters);

    return successResponse(
      res,
      result,
      "Purchase summary fetched successfully"
    );
  } catch (error) {
    const message = error.message || "Failed to fetch purchase summary";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

module.exports = {
  generateSalesReport,
  generatePurchaseReport,
  getSalesSummary,
  getPurchaseSummary
};
