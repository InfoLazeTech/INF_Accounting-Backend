const { successResponse, errorResponse } = require("../utils/response");
const httpStatus = require("http-status");
const billService = require("../services/bill.service");
const catchAsync = require("../utils/catchAsync");

// Create a new bill
const createBill = catchAsync(async (req, res) => {
  const data = req.body;
  const userId = req.user.id;

  // Add createdBy to the bill data
  data.createdBy = userId;
  data.remainingAmount = data.totals.grandTotal;
  const bill = await billService.createBill(data);
  return successResponse(res, bill, "Bill created successfully", httpStatus.CREATED);
});

// Get all bills with filter, search, and pagination
const getAllBills = catchAsync(async (req, res) => {
  const { companyId } = req.query;
  
  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const { page, limit, search, status, vendorId, startDate, endDate } = req.query;
  
  // Build filter object
  const filter = { companyId };
  if (status) filter.status = status;
  if (vendorId) filter.vendorId = vendorId;
  if (startDate && endDate) {
    filter.billDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const options = { page, limit, search };
  const result = await billService.getAllBills(filter, options);
  
  return successResponse(res, result.bills, "Bills fetched successfully", httpStatus.OK, {
    pagination: result.pagination,
    search: result.search
  });
});

// Get bill by ID
const getBillById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req.query;

  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const bill = await billService.getBillById(id, companyId);
  if (!bill) {
    return errorResponse(res, "Bill not found", 404);
  }

  return successResponse(res, bill, "Bill fetched successfully", httpStatus.OK);
});

// Update bill
const updateBill = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const userId = req.user.id;

  // Add updatedBy to the update data
  updateData.updatedBy = userId;

  const bill = await billService.updateBill(id, updateData);
  if (!bill) {
    return errorResponse(res, "Bill not found", 404);
  }

  return successResponse(res, bill, "Bill updated successfully", httpStatus.OK);
});

// Delete bill (soft delete)
const deleteBill = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const bill = await billService.deleteBill(id, userId);
  if (!bill) {
    return errorResponse(res, "Bill not found", 404);
  }

  return successResponse(res, null, "Bill deleted successfully", httpStatus.OK);
});

// Get bills by status
const getBillsByStatus = catchAsync(async (req, res) => {
  const { companyId, status } = req.query;

  if (!companyId || !status) {
    return errorResponse(res, "Company ID and status are required", 400);
  }

  const bills = await billService.getBillsByStatus(companyId, status);
  return successResponse(res, bills, "Bills fetched successfully", httpStatus.OK);
});

// Get overdue bills
const getOverdueBills = catchAsync(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const bills = await billService.getOverdueBills(companyId);
  return successResponse(res, bills, "Overdue bills fetched successfully", httpStatus.OK);
});

// Get bills by vendor
const getBillsByVendor = catchAsync(async (req, res) => {
  const { companyId, vendorId } = req.query;

  if (!companyId || !vendorId) {
    return errorResponse(res, "Company ID and vendor ID are required", 400);
  }

  const bills = await billService.getBillsByVendor(companyId, vendorId);
  return successResponse(res, bills, "Bills fetched successfully", httpStatus.OK);
});

// Update bill status
const updateBillStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (!status) {
    return errorResponse(res, "Status is required", 400);
  }

  const bill = await billService.updateBillStatus(id, status, userId);
  if (!bill) {
    return errorResponse(res, "Bill not found", 404);
  }

  return successResponse(res, bill, "Bill status updated successfully", httpStatus.OK);
});

// Record payment
const recordPayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { paymentAmount } = req.body;
  const userId = req.user.id;

  if (!paymentAmount || paymentAmount <= 0) {
    return errorResponse(res, "Valid payment amount is required", 400);
  }

  const bill = await billService.recordPayment(id, paymentAmount, userId);
  if (!bill) {
    return errorResponse(res, "Bill not found", 404);
  }

  return successResponse(res, bill, "Payment recorded successfully", httpStatus.OK);
});

// Get bill summary
const getBillSummary = catchAsync(async (req, res) => {
  const { companyId, startDate, endDate } = req.query;

  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const summary = await billService.getBillSummary(companyId, startDate, endDate);
  return successResponse(res, summary, "Bill summary fetched successfully", httpStatus.OK);
});

// Get bills by date range
const getBillsByDateRange = catchAsync(async (req, res) => {
  const { companyId, startDate, endDate } = req.query;

  if (!companyId || !startDate || !endDate) {
    return errorResponse(res, "Company ID, start date, and end date are required", 400);
  }

  const bills = await billService.getBillsByDateRange(companyId, startDate, endDate);
  return successResponse(res, bills, "Bills fetched successfully", httpStatus.OK);
});

module.exports = {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  getBillsByStatus,
  getOverdueBills,
  getBillsByVendor,
  updateBillStatus,
  recordPayment,
  getBillSummary,
  getBillsByDateRange
};
