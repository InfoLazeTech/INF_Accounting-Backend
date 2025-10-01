const { successResponse, errorResponse } = require("../utils/response");
const catchAsync = require("../utils/catchAsync");
const customerVendorService = require("../services/customer.service");

const createCustomerVendor = catchAsync(async (req, res) => {
  const data = req.body;
  

  const customerVendor = await customerVendorService.createCustomerVendor(data);

  return successResponse(res, customerVendor, "Customer/Vendor created successfully", 201);
});

const getAllCustomerVendors = catchAsync(async (req, res) => {
  const { role } = req.query;
  let filter = {};

  if (role === "customer") filter = { "type.isCustomer": true };
  else if (role === "vendor") filter = { "type.isVendor": true };
  else if (role === "both") filter = { "type.isCustomer": true, "type.isVendor": true };

  const customerVendors = await customerVendorService.getAllCustomerVendors(filter);

  return successResponse(res, customerVendors, "Customer/Vendors fetched successfully");
});

const getCustomerVendorById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const customerVendor = await customerVendorService.getCustomerVendorById(id);

  if (!customerVendor) {
    return errorResponse(res, "Customer/Vendor not found", 404);
  }

  return successResponse(res, customerVendor, "Customer/Vendor fetched successfully");
});

const updateCustomerVendor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const updated = await customerVendorService.updateCustomerVendor(id, updateData);

  if (!updated) {
    return errorResponse(res, "Customer/Vendor not found", 404);
  }

  return successResponse(res, updated, "Customer/Vendor updated successfully");
});

const deleteCustomerVendor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deleted = await customerVendorService.deleteCustomerVendor(id);

  if (!deleted) {
    return errorResponse(res, "Customer/Vendor not found", 404);
  }

  return successResponse(res, null, "Customer/Vendor deleted successfully");
});

module.exports = {
  createCustomerVendor,
  getAllCustomerVendors,
  getCustomerVendorById,
  updateCustomerVendor,
  deleteCustomerVendor,
};
