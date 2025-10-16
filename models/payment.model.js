const mongoose = require("mongoose");
const CounterService = require("../services/counter.service");

const paymentSchema = new mongoose.Schema(
  {
    // Basic Information
    paymentId: {
      type: String,
      unique: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    
    // Payment Type
    paymentType: {
      type: String,
      enum: ["paymentMade", "paymentReceived"],
      required: true,
    },
    
    referenceNumber: {
      type: String,
    },
    
    // Party Information
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerVendor",
      required: true,
    },

    // Payment Details
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    charges: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      min: 0,
    },
    
    // Payment Mode
    paymentMode: {
      type: String,
      enum: ["cash", "bank","other"],
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },
    // Status
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    
    // Audit Fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
paymentSchema.index({ companyId: 1, paymentType: 1 });
paymentSchema.index({ companyId: 1, partyId: 1 });
paymentSchema.index({ companyId: 1, referenceId: 1 });
paymentSchema.index({ companyId: 1, paymentDate: -1 });
paymentSchema.index({ companyId: 1, status: 1 });
paymentSchema.index({ paymentId: 1 });

// Virtual for total amount (amount + charges)
paymentSchema.virtual("totalAmount").get(function () {
  return this.amount + this.charges;
});

// Pre-save middleware to generate payment ID and calculate net amount
paymentSchema.pre("save", async function (next) {
  if (this.isNew) {
    if (!this.companyId) {
      return next(new Error("Company ID is required for payment"));
    }
    
    try {
      this.paymentId = await CounterService.generateNextId(
        this.companyId.toString(),
        'PAYMENT',
        5
      );
    } catch (error) {
      return next(error);
    }
  }
  
  // Calculate net amount
  this.netAmount = this.amount - this.charges;
  next();
});

// Static method to get payments by type
paymentSchema.statics.getPaymentsByType = async function (companyId, paymentType, options = {}) {
  const { page = 1, limit = 10, startDate, endDate, partyId, status } = options;
  
  let filter = { companyId, paymentType, isDeleted: false };
  
  if (startDate && endDate) {
    filter.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  
  if (partyId) {
    filter.partyId = partyId;
  }
  
  if (status) {
    filter.status = status;
  }
  
  const skip = (page - 1) * limit;
  const totalCount = await this.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / limit);
  
  const payments = await this.find(filter)
    .populate("partyId", "name contactPerson companyName")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(limit);
  
  return {
    payments,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// Static method to get payment summary
paymentSchema.statics.getPaymentSummary = async function (companyId, startDate, endDate) {
  const filter = { 
    companyId, 
    isDeleted: false,
    paymentDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };
  
  const summary = await this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$paymentType",
        totalAmount: { $sum: "$amount" },
        totalCharges: { $sum: "$charges" },
        totalNetAmount: { $sum: "$netAmount" },
        count: { $sum: 1 },
        averageAmount: { $avg: "$amount" }
      }
    }
  ]);
  
  return summary;
};

// Static method to get payments by party
paymentSchema.statics.getPaymentsByParty = async function (companyId, partyId, paymentType) {
  const filter = { companyId, partyId, isDeleted: false };
  
  if (paymentType) {
    filter.paymentType = paymentType;
  }
  
  return await this.find(filter)
    .populate("referenceId", "billNumber invoiceNumber")
    .sort({ paymentDate: -1 });
};

module.exports = mongoose.model("Payment", paymentSchema);
