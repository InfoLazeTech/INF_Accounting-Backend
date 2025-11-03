const CustomerVendor = require("../models/customer.model");

// Create
const createCustomerVendor = async (data) => {
  const customerVendor = new CustomerVendor(data);
  return await customerVendor.save();
};

// Get all (with filter, search, and pagination)
const getAllCustomerVendors = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, search } = options;
  
  // Build the complete query with filters and search
  let query = { ...filter };
  
  // Add search filter if search term is provided
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search
    query = {
      ...filter,
      $or: [
        { customerVendorId: searchRegex },
        { name: searchRegex },
        { contactPerson: searchRegex },
        {companyName:searchRegex}
      ]
    };
  }
  
  // Get total count of filtered results
  const totalCount = await CustomerVendor.countDocuments(query);
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  // Get paginated results from filtered data
  const customers = await CustomerVendor.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  return {
    customers,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage,
      hasPrevPage
    },
    search: search || null
  };
};

// Get by ID with company filter
const getCustomerVendorById = async (id, companyId) => {
  return await CustomerVendor.findOne({ 
    _id: id, 
  })
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

// Get dropdown list (simplified data for dropdowns)
const getCustomerVendorDropdown = async (companyId, type, search) => {
  // Build filter based on type
  let filter = { companyId };
  
  if (type === "customer") {
    filter = { ...filter, "type.isCustomer": true };
  } else if (type === "vendor") {
    filter = { ...filter, "type.isVendor": true };
  } else if (type === "both") {
    filter = { ...filter, "type.isCustomer": true, "type.isVendor": true };
  }
  
  // Add search filter if search term is provided
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter = {
      ...filter,
      $or: [
        { name: searchRegex },
        { contactPerson: searchRegex },
        { companyName: searchRegex }
      ]
    };
  }
  
  // Get only essential fields for dropdown
  const customers = await CustomerVendor.find(filter)
    .select('_id name contactPerson companyName type billingAddress shippingAddress')
    .sort({ name: 1 }); 
    // .limit(100); // Limit to 100 for dropdown performance
  
  return {
    customers,
    search: search || null,
    type: type || "all"
  };
};

module.exports = {
  createCustomerVendor,
  getAllCustomerVendors,
  getCustomerVendorById,
  updateCustomerVendor,
  deleteCustomerVendor,
  getCustomerVendorDropdown,
};
