const { successResponse, errorResponse } = require("../utils/response");
const catchAsync = require("../utils/catchAsync");
const customerVendorService = require("../services/customer.service");

const createCustomerVendor = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const customerVendor = await customerVendorService.createCustomerVendor(data);

    return successResponse(res, customerVendor, "Customer/Vendor created successfully", 201);
  } catch (error) {
    const message = error.message || "Customer/Vendor creation failed";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

const getAllCustomerVendors = async (req, res) => {
  try {
    const { companyId, role, page, limit, search } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }
    
    let filter = { companyId };

    if (role === "customer") filter = { ...filter, "type.isCustomer": true };
    else if (role === "vendor") filter = { ...filter, "type.isVendor": true };
    else if (role === "both") filter = { ...filter, "type.isCustomer": true, "type.isVendor": true };

    const result = await customerVendorService.getAllCustomerVendors(filter, { page, limit, search });

    return successResponse(
      res, 
      result.customers, 
      result.search ? `Search results for "${result.search}"` : "Customer/Vendors fetched successfully", 
      200,
      {
        ...result.pagination,
        search: result.search
      }
    );
  } catch (error) {
    const message = error.message || "Failed to fetch customers/vendors";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

const getCustomerVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.query; 
    const customerVendor = await customerVendorService.getCustomerVendorById(id, companyId);

    if (!customerVendor) {
      return errorResponse(res, "Customer/Vendor not found", 404);
    }

    return successResponse(res, customerVendor, "Customer/Vendor fetched successfully");
  } catch (error) {
    const message = error.message || "Failed to fetch customer/vendor";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

const updateCustomerVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove companyId from update data to prevent changing company
    delete updateData.companyId;

    const updated = await customerVendorService.updateCustomerVendor(id, updateData);

    if (!updated) {
      return errorResponse(res, "Customer/Vendor not found", 404);
    }

    return successResponse(res, updated, "Customer/Vendor updated successfully");
  } catch (error) {
    const message = error.message || "Failed to update customer/vendor";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

const deleteCustomerVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await customerVendorService.deleteCustomerVendor(id);

    if (!deleted) {
      return errorResponse(res, "Customer/Vendor not found", 404);
    }

    return successResponse(res, null, "Customer/Vendor deleted successfully");
  } catch (error) {
    const message = error.message || "Failed to delete customer/vendor";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

const getCustomerVendorDropdown = async (req, res) => {
  try {
    const { companyId, type, search } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }
    
    const result = await customerVendorService.getCustomerVendorDropdown(companyId, type, search);

    return successResponse(
      res, 
      result, 
      result.search ? `Dropdown results for "${result.search}"` : "Customer/Vendor dropdown fetched successfully"
    );
  } catch (error) {
    const message = error.message || "Failed to fetch customer/vendor dropdown";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

module.exports = {
  createCustomerVendor,
  getAllCustomerVendors,
  getCustomerVendorById,
  updateCustomerVendor,
  deleteCustomerVendor,
  getCustomerVendorDropdown,
};
