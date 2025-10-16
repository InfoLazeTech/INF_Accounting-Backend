const { successResponse, errorResponse } = require("../utils/response");
const paymentService = require("../services/payment.service");

// Create payment
const createPayment = async (req, res) => {
  try {
    const data = req.body;
    const payment = await paymentService.createPayment(data);

    return successResponse(res, payment, "Payment created successfully", 201);
  } catch (error) {
    const message = error.message || "Payment creation failed";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const { companyId, paymentType, page, limit, search, startDate, endDate, partyId, status } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }
    
    let filter = { companyId };
    
    if (paymentType) {
      filter.paymentType = paymentType;
    }
    
    if (partyId) {
      filter.partyId = partyId;
    }
    
    if (status) {
      filter.status = status;
    }

    const result = await paymentService.getAllPayments(filter, { 
      page, 
      limit, 
      search, 
      startDate, 
      endDate 
    });

    return successResponse(
      res, 
      result.payments, 
      result.search ? `Search results for "${result.search}"` : "Payments fetched successfully", 
      200,
      {
        ...result.pagination,
        search: result.search
      }
    );
  } catch (error) {
    const message = error.message || "Failed to fetch payments";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }
    
    const payment = await paymentService.getPaymentById(id, companyId);

    if (!payment) {
      return errorResponse(res, "Payment not found", 404);
    }

    return successResponse(res, payment, "Payment fetched successfully");
  } catch (error) {
    const message = error.message || "Failed to fetch payment";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove companyId from update data to prevent changing company
    delete updateData.companyId;

    const updated = await paymentService.updatePayment(id, updateData);

    if (!updated) {
      return errorResponse(res, "Payment not found", 404);
    }

    return successResponse(res, updated, "Payment updated successfully");
  } catch (error) {
    const message = error.message || "Failed to update payment";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Delete payment
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Assuming user ID is passed in request body

    const deleted = await paymentService.deletePayment(id, userId);

    if (!deleted) {
      return errorResponse(res, "Payment not found", 404);
    }

    return successResponse(res, null, "Payment deleted successfully");
  } catch (error) {
    const message = error.message || "Failed to delete payment";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Get payments by type
const getPaymentsByType = async (req, res) => {
  try {
    const { companyId, paymentType } = req.query;
    const { page, limit, startDate, endDate, partyId, status } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }
    
    if (!paymentType) {
      return errorResponse(res, "Payment type is required", 400);
    }
    
    if (!["paymentMade", "paymentReceived"].includes(paymentType)) {
      return errorResponse(res, "Invalid payment type", 400);
    }

    const result = await paymentService.getPaymentsByType(companyId, paymentType, {
      page,
      limit,
      startDate,
      endDate,
      partyId,
      status
    });

    return successResponse(
      res, 
      result.payments, 
      `${paymentType} payments fetched successfully`, 
      200,
      result.pagination
    );
  } catch (error) {
    const message = error.message || "Failed to fetch payments by type";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Get payment summary
const getPaymentSummary = async (req, res) => {
  try {
    const { companyId, startDate, endDate } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }
    
    if (!startDate || !endDate) {
      return errorResponse(res, "Start date and end date are required", 400);
    }

    const summary = await paymentService.getPaymentSummary(companyId, startDate, endDate);

    return successResponse(res, summary, "Payment summary fetched successfully");
  } catch (error) {
    const message = error.message || "Failed to fetch payment summary";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Get payments by party
const getPaymentsByParty = async (req, res) => {
  try {
    const { companyId, partyId, paymentType } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }
    
    if (!partyId) {
      return errorResponse(res, "Party ID is required", 400);
    }

    const payments = await paymentService.getPaymentsByParty(companyId, partyId, paymentType);

    return successResponse(res, payments, "Party payments fetched successfully");
  } catch (error) {
    const message = error.message || "Failed to fetch party payments";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Get payments by reference
const getPaymentsByReference = async (req, res) => {
  try {
    const { companyId, referenceId, referenceType } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }
    
    if (!referenceId) {
      return errorResponse(res, "Reference ID is required", 400);
    }
    
    if (!referenceType) {
      return errorResponse(res, "Reference type is required", 400);
    }

    const payments = await paymentService.getPaymentsByReference(companyId, referenceId, referenceType);

    return successResponse(res, payments, "Reference payments fetched successfully");
  } catch (error) {
    const message = error.message || "Failed to fetch reference payments";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Get recent payments
const getRecentPayments = async (req, res) => {
  try {
    const { companyId, limit } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }

    const payments = await paymentService.getRecentPayments(companyId, limit);

    return successResponse(res, payments, "Recent payments fetched successfully");
  } catch (error) {
    const message = error.message || "Failed to fetch recent payments";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

// Get payment analytics
const getPaymentAnalytics = async (req, res) => {
  try {
    const { companyId, startDate, endDate } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }
    
    if (!startDate || !endDate) {
      return errorResponse(res, "Start date and end date are required", 400);
    }

    const analytics = await paymentService.getPaymentAnalytics(companyId, startDate, endDate);

    return successResponse(res, analytics, "Payment analytics fetched successfully");
  } catch (error) {
    const message = error.message || "Failed to fetch payment analytics";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentsByType,
  getPaymentSummary,
  getPaymentsByParty,
  getPaymentsByReference,
  getRecentPayments,
  getPaymentAnalytics,
};
