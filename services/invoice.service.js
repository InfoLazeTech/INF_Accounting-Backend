const mongoose = require("mongoose");
const Invoice = require("../models/invoice.model");
const stockService = require("./stock.service");

// Create a new invoice
const createInvoice = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    data.remainingAmount = data.totals.grandTotal;
    // Create invoice with session
    const invoice = new Invoice(data);
    const savedInvoice = await invoice.save({ session });
    
    // Update stock for all items in the invoice
    await stockService.updateStockForInvoice(savedInvoice);
    
    // Commit both invoice creation and stock updates
    await session.commitTransaction();
    session.endSession();
    
    return savedInvoice;
  } catch (error) {
    // Rollback both invoice creation and stock updates
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Get all invoices with filter, search, and pagination
const getAllInvoices = async (filter = {}, options = {}) => {
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
        { invoiceNumber: searchRegex },
        { customerName: searchRegex },
        { referenceNumber: searchRegex },
        { description: searchRegex }
      ]
    };
  }

  // Get total count of filtered results
  const totalCount = await Invoice.countDocuments(query);

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Get paginated results from filtered data
  const invoices = await Invoice.find(query)
    .populate("customerId", "name contactPerson")
    .populate("companyId", "companyName")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .populate("sentBy", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    invoices,
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

// Get invoice by ID
const getInvoiceById = async (id, companyId) => {
  return await Invoice.findOne({
    _id: id,
    companyId: companyId,
    isDeleted: false
  })
    .populate("customerId", "name contactPerson email phone")
    .populate("companyId", "companyName")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .populate("sentBy", "name email");
};

// Update invoice
const updateInvoice = async (id, updateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove companyId from update data to prevent changing company
    const { companyId, ...safeUpdateData } = updateData;
    
    // Get the existing invoice to compare items
    const existingInvoice = await Invoice.findById(id).session(session);
    if (!existingInvoice) {
      throw new Error("Invoice not found");
    }
    
    // Check if items have changed
    const itemsChanged = JSON.stringify(existingInvoice.items) !== JSON.stringify(safeUpdateData.items);
    
    const updatedInvoice = await Invoice.findByIdAndUpdate(
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
      await stockService.handleInvoiceEdit(
        existingInvoice.items,
        safeUpdateData.items,
        existingInvoice.companyId
      );
    }
    
    // Commit both invoice update and stock changes
    await session.commitTransaction();
    session.endSession();
    
    return updatedInvoice;
  } catch (error) {
    // Rollback both invoice update and stock changes
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Delete invoice (soft delete)
const deleteInvoice = async (id, deletedBy) => {
  return await Invoice.findByIdAndUpdate(
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

// Get invoices by status
const getInvoicesByStatus = async (companyId, status) => {
  return await Invoice.find({
    companyId,
    status,
    isDeleted: false
  })
    .populate("customerId", "name contactPerson")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

// Get overdue invoices
const getOverdueInvoices = async (companyId) => {
  const today = new Date();
  return await Invoice.find({
    companyId,
    dueDate: { $lt: today },
    paymentStatus: { $ne: 'paid' },
    isDeleted: false
  })
    .populate("customerId", "name contactPerson")
    .populate("createdBy", "name email")
    .sort({ dueDate: 1 });
};

// Get invoices by customer
const getInvoicesByCustomer = async (companyId, customerId) => {
  return await Invoice.find({
    companyId,
    customerId,
    isDeleted: false
  })
    .populate("customerId", "name contactPerson")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

// Update invoice status
const updateInvoiceStatus = async (id, status, updatedBy) => {
  const updateData = { status, updatedBy };
  
  if (status === 'sent') {
    updateData.sentBy = updatedBy;
    updateData.sentAt = new Date();
  } else if (status === 'viewed') {
    updateData.viewedAt = new Date();
  }
  
  return await Invoice.findByIdAndUpdate(
    { _id: id },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

// Record payment
const recordPayment = async (id, paymentAmount, updatedBy) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new Error("Invoice not found");
  }
  
  const newReceivedAmount = invoice.receivedAmount + paymentAmount;
  const remainingAmount = invoice.totals.grandTotal - newReceivedAmount;
  
  const updateData = {
    receivedAmount: newReceivedAmount,
    remainingAmount: remainingAmount,
    updatedBy: updatedBy
  };
  
  // Update payment status
  if (remainingAmount <= 0) {
    updateData.paymentStatus = 'paid';
    updateData.status = 'paid';
  } else if (newReceivedAmount > 0) {
    updateData.paymentStatus = 'partial';
  }
  
  return await Invoice.findByIdAndUpdate(
    { _id: id },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

// Get revenue summary
const getRevenueSummary = async (companyId, startDate, endDate) => {
  const matchStage = {
    companyId: new require("mongoose").Types.ObjectId(companyId),
    isDeleted: false
  };
  
  if (startDate && endDate) {
    matchStage.invoiceDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return await Invoice.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalAmount: { $sum: "$totals.grandTotal" },
        receivedAmount: { $sum: "$receivedAmount" },
        pendingAmount: { $sum: "$remainingAmount" },
        averageInvoiceAmount: { $avg: "$totals.grandTotal" }
      }
    }
  ]);
};

// Get invoices by date range
const getInvoicesByDateRange = async (companyId, startDate, endDate) => {
  return await Invoice.find({
    companyId,
    invoiceDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    isDeleted: false
  })
    .populate("customerId", "name contactPerson")
    .populate("createdBy", "name email")
    .sort({ invoiceDate: -1 });
};

// Get top customers by revenue
const getTopCustomersByRevenue = async (companyId, limit = 10) => {
  return await Invoice.aggregate([
    {
      $match: {
        companyId: new require("mongoose").Types.ObjectId(companyId),
        isDeleted: false
      }
    },
    {
      $group: {
        _id: "$customerId",
        totalRevenue: { $sum: "$totals.grandTotal" },
        invoiceCount: { $sum: 1 },
        averageInvoiceValue: { $avg: "$totals.grandTotal" }
      }
    },
    {
      $lookup: {
        from: "customervendors",
        localField: "_id",
        foreignField: "_id",
        as: "customer"
      }
    },
    {
      $unwind: "$customer"
    },
    {
      $project: {
        customerName: "$customer.name",
        totalRevenue: 1,
        invoiceCount: 1,
        averageInvoiceValue: 1
      }
    },
    {
      $sort: { totalRevenue: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Get monthly revenue trend
const getMonthlyRevenueTrend = async (companyId, months = 12) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  return await Invoice.aggregate([
    {
      $match: {
        companyId: new require("mongoose").Types.ObjectId(companyId),
        invoiceDate: { $gte: startDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$invoiceDate" },
          month: { $month: "$invoiceDate" }
        },
        totalRevenue: { $sum: "$totals.grandTotal" },
        invoiceCount: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    }
  ]);
};

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
