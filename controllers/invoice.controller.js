const { successResponse, errorResponse } = require("../utils/response");
const httpStatus = require("http-status");
const invoiceService = require("../services/invoice.service");
const catchAsync = require("../utils/catchAsync");

// Create a new invoice
const createInvoice = catchAsync(async (req, res) => {
  const data = req.body;
  const userId = req.user.id;

  // Add createdBy to the invoice data
  data.createdBy = userId;

  const invoice = await invoiceService.createInvoice(data);
  return successResponse(res, invoice, "Invoice created successfully", httpStatus.CREATED);
});

// Get all invoices with filter, search, and pagination
const getAllInvoices = catchAsync(async (req, res) => {
  const { companyId } = req.query;
  
  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const { page, limit, search, status, customerId, startDate, endDate } = req.query;
  
  // Build filter object
  const filter = { companyId };
  if (status) filter.status = status;
  if (customerId) filter.customerId = customerId;
  if (startDate && endDate) {
    filter.invoiceDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const options = { page, limit, search };
  const result = await invoiceService.getAllInvoices(filter, options);
  
  return successResponse(res, result.invoices, "Invoices fetched successfully", httpStatus.OK, {
    pagination: result.pagination,
    search: result.search
  });
});

// Get invoice by ID
const getInvoiceById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req.query;

  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const invoice = await invoiceService.getInvoiceById(id, companyId);
  if (!invoice) {
    return errorResponse(res, "Invoice not found", 404);
  }

  return successResponse(res, invoice, "Invoice fetched successfully", httpStatus.OK);
});

// Update invoice
const updateInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const userId = req.user.id;

  // Add updatedBy to the update data
  updateData.updatedBy = userId;

  const invoice = await invoiceService.updateInvoice(id, updateData);
  if (!invoice) {
    return errorResponse(res, "Invoice not found", 404);
  }

  return successResponse(res, invoice, "Invoice updated successfully", httpStatus.OK);
});

// Delete invoice (soft delete)
const deleteInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const invoice = await invoiceService.deleteInvoice(id, userId);
  if (!invoice) {
    return errorResponse(res, "Invoice not found", 404);
  }

  return successResponse(res, null, "Invoice deleted successfully", httpStatus.OK);
});

// Get invoices by status
const getInvoicesByStatus = catchAsync(async (req, res) => {
  const { companyId, status } = req.query;

  if (!companyId || !status) {
    return errorResponse(res, "Company ID and status are required", 400);
  }

  const invoices = await invoiceService.getInvoicesByStatus(companyId, status);
  return successResponse(res, invoices, "Invoices fetched successfully", httpStatus.OK);
});

// Get overdue invoices
const getOverdueInvoices = catchAsync(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const invoices = await invoiceService.getOverdueInvoices(companyId);
  return successResponse(res, invoices, "Overdue invoices fetched successfully", httpStatus.OK);
});

// Get invoices by customer
const getInvoicesByCustomer = catchAsync(async (req, res) => {
  const { companyId, customerId } = req.query;

  if (!companyId || !customerId) {
    return errorResponse(res, "Company ID and customer ID are required", 400);
  }

  const invoices = await invoiceService.getInvoicesByCustomer(companyId, customerId);
  return successResponse(res, invoices, "Invoices fetched successfully", httpStatus.OK);
});

// Update invoice status
const updateInvoiceStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (!status) {
    return errorResponse(res, "Status is required", 400);
  }

  const invoice = await invoiceService.updateInvoiceStatus(id, status, userId);
  if (!invoice) {
    return errorResponse(res, "Invoice not found", 404);
  }

  return successResponse(res, invoice, "Invoice status updated successfully", httpStatus.OK);
});

// Record payment
const recordPayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { paymentAmount } = req.body;
  const userId = req.user.id;

  if (!paymentAmount || paymentAmount <= 0) {
    return errorResponse(res, "Valid payment amount is required", 400);
  }

  const invoice = await invoiceService.recordPayment(id, paymentAmount, userId);
  if (!invoice) {
    return errorResponse(res, "Invoice not found", 404);
  }

  return successResponse(res, invoice, "Payment recorded successfully", httpStatus.OK);
});

// Get revenue summary
const getRevenueSummary = catchAsync(async (req, res) => {
  const { companyId, startDate, endDate } = req.query;

  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const summary = await invoiceService.getRevenueSummary(companyId, startDate, endDate);
  return successResponse(res, summary, "Revenue summary fetched successfully", httpStatus.OK);
});

// Get invoices by date range
const getInvoicesByDateRange = catchAsync(async (req, res) => {
  const { companyId, startDate, endDate } = req.query;

  if (!companyId || !startDate || !endDate) {
    return errorResponse(res, "Company ID, start date, and end date are required", 400);
  }

  const invoices = await invoiceService.getInvoicesByDateRange(companyId, startDate, endDate);
  return successResponse(res, invoices, "Invoices fetched successfully", httpStatus.OK);
});

// Get top customers by revenue
const getTopCustomersByRevenue = catchAsync(async (req, res) => {
  const { companyId, limit } = req.query;

  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const customers = await invoiceService.getTopCustomersByRevenue(companyId, limit);
  return successResponse(res, customers, "Top customers fetched successfully", httpStatus.OK);
});

// Get monthly revenue trend
const getMonthlyRevenueTrend = catchAsync(async (req, res) => {
  const { companyId, months } = req.query;

  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const trend = await invoiceService.getMonthlyRevenueTrend(companyId, months);
  return successResponse(res, trend, "Monthly revenue trend fetched successfully", httpStatus.OK);
});

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoicesByStatus,
  getOverdueInvoices,
  getInvoicesByCustomer,
  updateInvoiceStatus,
  recordPayment,
  getRevenueSummary,
  getInvoicesByDateRange,
  getTopCustomersByRevenue,
  getMonthlyRevenueTrend
};
