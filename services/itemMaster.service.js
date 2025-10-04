const Item = require("../models/itemMaster.model");

const createItem = async (data) => {
  const item = new Item(data);
  return await item.save();
};

// Get all items with filter, search, and pagination
const getAllItems = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, search } = options;

  // Build the complete query with filters and search
  let query = { ...filter };

  // Add search filter if search term is provided
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search
    query = {
      ...filter,
      $or: [
        { itemId: searchRegex },
        { sku: searchRegex },
        { name: searchRegex },
        { description: searchRegex }
      ]
    };
  }

  // Get total count of filtered results
  const totalCount = await Item.countDocuments(query);

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Get paginated results from filtered data
  const items = await Item.find(query)
    .populate("category", "name")
    .populate("companyId", "companyName")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    items,
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

const getItemById = async (id, companyId) => {
  return await Item.findOne({
    _id: id,
    // companyId: companyId
  })
    .populate("category", "name")
    .populate("companyId", "companyName");
};

const updateItem = async (id, updateData) => {
  // Remove companyId from update data to prevent changing company
  const { companyId, ...safeUpdateData } = updateData;
  
  return await Item.findByIdAndUpdate(
    { _id: id },
    { $set: safeUpdateData },
    {
      new: true,
      runValidators: true,
    }
  );
};

const deleteItem = async (id) => {
  return await Item.findByIdAndDelete(id);
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
};
