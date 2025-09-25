const customerVendorService = require("../services/customer.service");

// Create
const createCustomerVendor = async (req, res) => {
  try {
    const data = req.body;

    // Validation rule: not both false at creation
    if (!data.type?.isCustomer && !data.type?.isVendor) {
      return res.status(400).json({
        success: false,
        message: "At least one of isCustomer or isVendor must be true",
      });
    }

    const customerVendor = await customerVendorService.createCustomerVendor(data);
    return res.status(201).json({ success: true, data: customerVendor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all with optional filter
const getAllCustomerVendors = async (req, res) => {
  try {
    const { role } = req.query; // role=customer | vendor | both

    let filter = {};
    if (role === "customer") {
      filter = { "type.isCustomer": true };
    } else if (role === "vendor") {
      filter = { "type.isVendor": true };
    } else if (role === "both") {
      filter = { "type.isCustomer": true, "type.isVendor": true };
    }

    const customerVendors = await customerVendorService.getAllCustomerVendors(filter);
    return res.json({ success: true, data: customerVendors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get by ID
const getCustomerVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const customerVendor = await customerVendorService.getCustomerVendorById(id);

    if (!customerVendor) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, data: customerVendor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update
const updateCustomerVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (
      updateData.type &&
      !updateData.type.isCustomer &&
      !updateData.type.isVendor
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one of isCustomer or isVendor must be true",
      });
    }

    const updated = await customerVendorService.updateCustomerVendor(id, updateData);

    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete
const deleteCustomerVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await customerVendorService.deleteCustomerVendor(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCustomerVendor,
  getAllCustomerVendors,
  getCustomerVendorById,
  updateCustomerVendor,
  deleteCustomerVendor,
};
