const mongoose = require("mongoose");
const Payment = require("../models/payment.model");

// Create payment
const createPayment = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = new Payment(data);
    const savedPayment = await payment.save({ session });

    await session.commitTransaction();
    session.endSession();

    return savedPayment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Get all payments with filters
const getAllPayments = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, search, startDate, endDate, paymentType, paymentMode } = options;
  
  // Convert page and limit to numbers
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  
  // Build the complete query with filters
  let query = { ...filter, isDeleted: false };
  
  // Add payment type filter
  if (paymentType) {
    query.paymentType = paymentType;
  }
  
  // Add payment mode filter
  if (paymentMode) {
    query.paymentMode = paymentMode;
  }
  
  // Add date range filter
  if (startDate && endDate) {
    query.paymentDate = { 
      $gte: new Date(startDate), 
      $lte: new Date(endDate) 
    };
  }
  
  // Add search filter if search term is provided
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query = {
      ...query,
      $or: [
        { paymentId: searchRegex },
        { referenceNumber: searchRegex },
        { notes: searchRegex }
      ]
    };
  }
  
  // Get total count of filtered results
  const totalCount = await Payment.countDocuments(query);
  
  // Calculate pagination
  const skip = (pageNum - 1) * limitNum;
  const totalPages = Math.ceil(totalCount / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;
  
  // Get paginated results
  const payments = await Payment.find(query)
    .populate("partyId", "name contactPerson companyName")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(limitNum);
  
  return {
    payments,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalCount,
      limit: limitNum,
      hasNextPage,
      hasPrevPage
    },
    search: search || null
  };
};

// Get payment by ID
const getPaymentById = async (id, companyId) => {
  return await Payment.findOne({ 
    _id: id, 
    companyId: companyId,
    isDeleted: false 
  })
    .populate("partyId", "name contactPerson companyName email phone")
    // .populate("referenceId", "billNumber invoiceNumber totals")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");
};

// Update payment
const updatePayment = async (id, updateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove companyId from update data to prevent changing company
    const { companyId, ...safeUpdateData } = updateData;
    
    const updatedPayment = await Payment.findByIdAndUpdate(
      { _id: id },
      { $set: safeUpdateData },
      {
        new: true,
        runValidators: true,
        session: session
      }
    )
      .populate("partyId", "name contactPerson companyName")
      // .populate("referenceId", "billNumber invoiceNumber")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    await session.commitTransaction();
    session.endSession();

    return updatedPayment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Delete payment (soft delete)
const deletePayment = async (id, deletedBy) => {
  return await Payment.findByIdAndUpdate(
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

// Get payments by type (paymentMade or paymentReceived)
const getPaymentsByType = async (companyId, paymentType, options = {}) => {
  return await Payment.getPaymentsByType(companyId, paymentType, options);
};

// Get payment summary
const getPaymentSummary = async (companyId, startDate, endDate) => {
  return await Payment.getPaymentSummary(companyId, startDate, endDate);
};

// Get payments by party
const getPaymentsByParty = async (companyId, partyId, paymentType) => {
  return await Payment.getPaymentsByParty(companyId, partyId, paymentType);
};

// Get payments by reference (Bill or Invoice)
const getPaymentsByReference = async (companyId, referenceId, referenceType) => {
  return await Payment.find({
    companyId,
    referenceId,
    referenceType,
    isDeleted: false
  })
    .populate("partyId", "name contactPerson companyName")
    .populate("createdBy", "name email")
    .sort({ paymentDate: -1 });
};

// Get recent payments
const getRecentPayments = async (companyId, limit = 10) => {
  return await Payment.find({
    companyId,
    isDeleted: false
  })
    .populate("partyId", "name contactPerson companyName")
    .populate("referenceId", "billNumber invoiceNumber")
    .sort({ paymentDate: -1 })
    .limit(limit);
};

// Get payment analytics
const getPaymentAnalytics = async (companyId, startDate, endDate) => {
  const filter = { 
    companyId, 
    isDeleted: false,
    paymentDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };
  
  const analytics = await Payment.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          paymentType: "$paymentType",
          paymentMode: "$paymentMode"
        },
        totalAmount: { $sum: "$amount" },
        totalCharges: { $sum: "$charges" },
        totalNetAmount: { $sum: "$netAmount" },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.paymentType",
        paymentModes: {
          $push: {
            mode: "$_id.paymentMode",
            totalAmount: "$totalAmount",
            totalCharges: "$totalCharges",
            totalNetAmount: "$totalNetAmount",
            count: "$count"
          }
        },
        totalAmount: { $sum: "$totalAmount" },
        totalCharges: { $sum: "$totalCharges" },
        totalNetAmount: { $sum: "$totalNetAmount" },
        totalCount: { $sum: "$count" }
      }
    }
  ]);
  
  return analytics;
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentsByType,
  getPaymentSummary,
  getPaymentsByParty,
  getPaymentsByReference,
  getRecentPayments,
  getPaymentAnalytics,
};
