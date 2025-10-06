const mongoose = require("mongoose");
const CounterService = require("../services/counter.service");
const { 
  addressSchema, 
  contactSchema, 
  itemLineSchema, 
  paymentTermsSchema, 
  totalsSchema 
} = require("./commonSchemas");

const billSchema = new mongoose.Schema(
  {
    billNumber: { type: String }, // BIL-00001 (unique per company)
    companyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Company", 
      required: true 
    },
    
    // Vendor/Supplier Information
    vendorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "CustomerVendor", 
      required: true 
    },
    vendorName: { type: String, required: true },
    // vendorContact: contactSchema,
    // vendorAddress: addressSchema,
    
    // Bill Details
    billDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    referenceNumber: { type: String }, // PO Number, etc.
    description: { type: String },
    
    // Items
    items: [itemLineSchema],
    
    // Financial Information
    totals: totalsSchema,
    paymentTerms: paymentTermsSchema,
    
    // Status and Workflow
    status: { 
      type: String, 
      enum: ["draft", "pending", "approved", "paid", "cancelled", "overdue"], 
      default: "draft" 
    },
    paymentStatus: { 
      type: String, 
      enum: ["unpaid", "partial", "paid"], 
      default: "unpaid" 
    },
    paidAmount: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    
    // Additional Information
    customerNotes: { type: String },
    termsAndConditions: { type: String },
    attachments: [{ 
      filename: String, 
      originalName: String, 
      url: String, 
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    // Audit Fields
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
    //  required: true 
    },
    updatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    approvedAt: { type: Date },
    
    // Soft Delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound unique index for billNumber per company
billSchema.index({ companyId: 1, billNumber: 1 }, { unique: true });

// Indexes for better query performance
billSchema.index({ companyId: 1, status: 1 });
billSchema.index({ companyId: 1, vendorId: 1 });
billSchema.index({ companyId: 1, billDate: -1 });
billSchema.index({ companyId: 1, dueDate: 1 });
billSchema.index({ companyId: 1, paymentStatus: 1 });

// Virtual for days overdue
billSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'overdue' || (this.dueDate < new Date() && this.paymentStatus !== 'paid')) {
    const today = new Date();
    const diffTime = today - this.dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Pre-save middleware for auto-increment billNumber
billSchema.pre("save", async function (next) {
  if (this.isNew) {
    if (!this.companyId) {
      return next(new Error("Company ID is required for bill"));
    }
    
    try {
      this.billNumber = await CounterService.generateNextId(
        this.companyId.toString(),
        'BILL',
        5
      );
      
      // Double-check for uniqueness within the company
      const existingBill = await this.constructor.findOne({
        companyId: this.companyId,
        billNumber: this.billNumber
      });
      
      if (existingBill) {
        this.billNumber = await CounterService.generateNextId(
          this.companyId.toString(),
          'BILL',
          5
        );
      }
      
      // Calculate remaining amount
      this.remainingAmount = this.totals.grandTotal - this.paidAmount;
      
    } catch (error) {
      return next(new Error(`Failed to generate bill number: ${error.message}`));
    }
  }
  next();
});

// Pre-save middleware to update remaining amount
billSchema.pre("save", function (next) {
  if (this.isModified('paidAmount') || this.isModified('totals.grandTotal')) {
    this.remainingAmount = this.totals.grandTotal - this.paidAmount;
    
    // Update payment status based on remaining amount
    if (this.remainingAmount <= 0) {
      this.paymentStatus = 'paid';
    } else if (this.paidAmount > 0) {
      this.paymentStatus = 'partial';
    } else {
      this.paymentStatus = 'unpaid';
    }
  }
  next();
});

// Static method to get bills by status
billSchema.statics.getBillsByStatus = function(companyId, status) {
  return this.find({ companyId, status, isDeleted: false });
};

// Static method to get overdue bills
billSchema.statics.getOverdueBills = function(companyId) {
  const today = new Date();
  return this.find({
    companyId,
    dueDate: { $lt: today },
    paymentStatus: { $ne: 'paid' },
    isDeleted: false
  });
};

// Static method to get bills by vendor
billSchema.statics.getBillsByVendor = function(companyId, vendorId) {
  return this.find({ companyId, vendorId, isDeleted: false });
};

// Static method to get bill summary
billSchema.statics.getBillSummary = function(companyId, startDate, endDate) {
  const matchStage = {
    companyId: new mongoose.Types.ObjectId(companyId),
    isDeleted: false
  };
  
  if (startDate && endDate) {
    matchStage.billDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalBills: { $sum: 1 },
        totalAmount: { $sum: "$totals.grandTotal" },
        paidAmount: { $sum: "$paidAmount" },
        pendingAmount: { $sum: "$remainingAmount" },
        averageBillAmount: { $avg: "$totals.grandTotal" }
      }
    }
  ]);
};

module.exports = mongoose.model("Bill", billSchema);
