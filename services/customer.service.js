const CustomerVendor = require("../models/customer.model");

// Create
const createCustomerVendor = async (data) => {
  const customerVendor = new CustomerVendor(data);
  return await customerVendor.save();
};

// Get all (with filter)
const getAllCustomerVendors = async (filter = {}) => {
  return await CustomerVendor.find(filter).populate(
    "addedBy updatedBy",
    "name email"
  );
};

// Get by ID
const getCustomerVendorById = async (id) => {
  return await CustomerVendor.findById(id).populate(
    "addedBy updatedBy",
    "name email"
  );
};

// Update
const updateCustomerVendor = async (id, updateData) => {
  return await CustomerVendor.findByIdAndUpdate(
    { _id: id },
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  );
};

// Delete
const deleteCustomerVendor = async (id) => {
  return await CustomerVendor.findByIdAndDelete(id);
};

module.exports = {
  createCustomerVendor,
  getAllCustomerVendors,
  getCustomerVendorById,
  updateCustomerVendor,
  deleteCustomerVendor,
};
