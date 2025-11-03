const mongoose = require("mongoose");
const Bill = require("../models/bill.model");
const stockService = require("./stock.service");

// Create a new bill
const createBill = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create bill with session
    const bill = new Bill(data);
    const savedBill = await bill.save({ session });
    
    // Update stock for all items in the bill
    await stockService.updateStockForBill(savedBill);
    
    // Commit both bill creation and stock updates
    await session.commitTransaction();
    session.endSession();
    
    return savedBill;
  } catch (error) {
    // Rollback both bill creation and stock updates
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Get all bills with filter, search, and pagination
const getAllBills = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, search } = options;

  // Build the complete query with filters and search
  let query = { ...filter, isDeleted: false };

  // Add search filter if search term is provided
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search
    query = {
      ...filter,
      isDeleted: false,
      $or: [
        { billNumber: searchRegex },
        { vendorName: searchRegex },
        { referenceNumber: searchRegex },
        { description: searchRegex }
      ]
    };
  }

  // Get total count of filtered results
  const totalCount = await Bill.countDocuments(query);

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Get paginated results from filtered data
  const bills = await Bill.find(query)
    .populate("vendorId", "name contactPerson")
    .populate("companyId", "companyName")
    // .populate("createdBy", "name email")
    // .populate("updatedBy", "name email")
    // .populate("approvedBy", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    bills,
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

// Get bill by ID
const getBillById = async (id, companyId) => {
  return await Bill.findOne({
    _id: id,
    companyId: companyId,
    isDeleted: false
  })
    .populate("vendorId", "name contactPerson email phone billingAddress shippingAddress gstNumber customerVendorId")
    .populate("companyId", "companyName")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .populate("approvedBy", "name email");
};

// Update bill
const updateBill = async (id, updateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove companyId from update data to prevent changing company
    const { companyId, ...safeUpdateData } = updateData;
    
    // Get the existing bill to compare items
    const existingBill = await Bill.findById(id).session(session);
    if (!existingBill) {
      throw new Error("Bill not found");
    }
    
    // Check if items have changed
    const itemsChanged = JSON.stringify(existingBill.items) !== JSON.stringify(safeUpdateData.items);
    
    const updatedBill = await Bill.findByIdAndUpdate(
      { _id: id },
      { $set: safeUpdateData },
      {
        new: true,
        runValidators: true,
        session: session
      }
    );
    
    // Handle stock updates if items changed
    if (itemsChanged && safeUpdateData.items) {
      await stockService.handleBillEdit(
        existingBill.items,
        safeUpdateData.items,
        existingBill.companyId
      );
    }
    
    // Commit both bill update and stock changes
    await session.commitTransaction();
    session.endSession();
    
    return updatedBill;
  } catch (error) {
    // Rollback both bill update and stock changes
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Delete bill (soft delete)
const deleteBill = async (id, deletedBy) => {
  return await Bill.findByIdAndUpdate(
    { _id: id },
    { 
      $set: { 
        isDeleted: true, 
        deletedAt: new Date(),
        deletedBy: deletedBy
      }
    },
    { new: true }
  );
};

// Get bills by status
const getBillsByStatus = async (companyId, status) => {
  return await Bill.getBillsByStatus(companyId, status)
    .populate("vendorId", "name contactPerson")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

// Get overdue bills
const getOverdueBills = async (companyId) => {
  return await Bill.getOverdueBills(companyId)
    .populate("vendorId", "name contactPerson")
    .populate("createdBy", "name email")
    .sort({ dueDate: 1 });
};

// Get bills by vendor
const getBillsByVendor = async (companyId, vendorId) => {
  return await Bill.getBillsByVendor(companyId, vendorId)
    .populate("vendorId", "name contactPerson")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

// Update bill status
const updateBillStatus = async (id, status, updatedBy) => {
  const updateData = { status, updatedBy };
  
  if (status === 'approved') {
    updateData.approvedBy = updatedBy;
    updateData.approvedAt = new Date();
  }
  
  return await Bill.findByIdAndUpdate(
    { _id: id },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

// Record payment
const recordPayment = async (id, paymentAmount, updatedBy) => {
  const bill = await Bill.findById(id);
  if (!bill) {
    throw new Error("Bill not found");
  }
  
  const newPaidAmount = bill.paidAmount + paymentAmount;
  const remainingAmount = bill.totals.grandTotal - newPaidAmount;
  
  const updateData = {
    paidAmount: newPaidAmount,
    remainingAmount: remainingAmount,
    updatedBy: updatedBy
  };
  
  // Update payment status
  if (remainingAmount <= 0) {
    updateData.paymentStatus = 'paid';
    updateData.status = 'paid';
  } else if (newPaidAmount > 0) {
    updateData.paymentStatus = 'partial';
  }
  
  return await Bill.findByIdAndUpdate(
    { _id: id },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

// Get bill summary
const getBillSummary = async (companyId, startDate, endDate) => {
  return await Bill.getBillSummary(companyId, startDate, endDate);
};

// Get bills by date range
const getBillsByDateRange = async (companyId, startDate, endDate) => {
  return await Bill.find({
    companyId,
    billDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    isDeleted: false
  })
    .populate("vendorId", "name contactPerson")
    .populate("createdBy", "name email")
    .sort({ billDate: -1 });
};

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
