const mongoose = require("mongoose");
const CounterService = require("../services/counter.service");
const { 
  addressSchema, 
  contactSchema, 
  itemLineSchema, 
  paymentTermsSchema, 
  totalsSchema 
} = require("./commonSchemas");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String }, // INV-00001 (unique per company)
    companyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Company", 
      required: true 
    },
    
    // Customer Information
    customerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "CustomerVendor", 
      required: true 
    },
    customerName: { type: String, required: true },
    customerContact: contactSchema,
    customerAddress: addressSchema,
    
    // Invoice Details
    invoiceDate: { type: Date, required: true, default: Date.now },
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
      enum: ["draft", "sent", "viewed", "paid", "overdue", "cancelled", "refunded"], 
      default: "draft" 
    },
    paymentStatus: { 
      type: String, 
      enum: ["unpaid", "partial", "paid"], 
      default: "unpaid" 
    },
    receivedAmount: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    
    // Delivery Information
    deliveryDate: { type: Date },
    deliveryAddress: addressSchema,
    deliveryNotes: { type: String },
    
    // Additional Information
    notes: { type: String },
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
    },
    updatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    sentBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    sentAt: { type: Date },
    viewedAt: { type: Date },
    
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

// Compound unique index for invoiceNumber per company
invoiceSchema.index({ companyId: 1, invoiceNumber: 1 }, { unique: true });

// Indexes for better query performance
invoiceSchema.index({ companyId: 1, status: 1 });
invoiceSchema.index({ companyId: 1, customerId: 1 });
invoiceSchema.index({ companyId: 1, invoiceDate: -1 });
invoiceSchema.index({ companyId: 1, dueDate: 1 });
invoiceSchema.index({ companyId: 1, paymentStatus: 1 });

// Virtual for days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'overdue' || (this.dueDate < new Date() && this.paymentStatus !== 'paid')) {
    const today = new Date();
    const diffTime = today - this.dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for invoice age
invoiceSchema.virtual('invoiceAge').get(function() {
  const today = new Date();
  const diffTime = today - this.invoiceDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware for auto-increment invoiceNumber
invoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    if (!this.companyId) {
      return next(new Error("Company ID is required for invoice"));
    }
    
    try {
      this.invoiceNumber = await CounterService.generateNextId(
        this.companyId.toString(),
        'INVOICE',
        5
      );
      
      // Double-check for uniqueness within the company
      const existingInvoice = await this.constructor.findOne({
        companyId: this.companyId,
        invoiceNumber: this.invoiceNumber
      });
      
      if (existingInvoice) {
        this.invoiceNumber = await CounterService.generateNextId(
          this.companyId.toString(),
          'INVOICE',
          5
        );
      }
      
      // Calculate remaining amount
      this.remainingAmount = this.totals.grandTotal - this.receivedAmount;
      
    } catch (error) {
      return next(new Error(`Failed to generate invoice number: ${error.message}`));
    }
  }
  next();
});

// Pre-save middleware to update remaining amount
invoiceSchema.pre("save", function (next) {
  if (this.isModified('receivedAmount') || this.isModified('totals.grandTotal')) {
    this.remainingAmount = this.totals.grandTotal - this.receivedAmount;
    
    // Update payment status based on remaining amount
    if (this.remainingAmount <= 0) {
      this.paymentStatus = 'paid';
    } else if (this.receivedAmount > 0) {
      this.paymentStatus = 'partial';
    } else {
      this.paymentStatus = 'unpaid';
    }
  }
  next();
});

// Static method to get invoices by status
invoiceSchema.statics.getInvoicesByStatus = function(companyId, status) {
  return this.find({ companyId, status, isDeleted: false });
};

// Static method to get overdue invoices
invoiceSchema.statics.getOverdueInvoices = function(companyId) {
  const today = new Date();
  return this.find({
    companyId,
    dueDate: { $lt: today },
    paymentStatus: { $ne: 'paid' },
    isDeleted: false
  });
};

// Static method to get invoices by customer
invoiceSchema.statics.getInvoicesByCustomer = function(companyId, customerId) {
  return this.find({ companyId, customerId, isDeleted: false });
};

// Static method to get revenue summary
invoiceSchema.statics.getRevenueSummary = function(companyId, startDate, endDate) {
  const matchStage = {
    companyId: new mongoose.Types.ObjectId(companyId),
    isDeleted: false
  };
  
  if (startDate && endDate) {
    matchStage.invoiceDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalAmount: { $sum: "$totals.grandTotal" },
        paidAmount: { $sum: "$receivedAmount" },
        pendingAmount: { $sum: "$remainingAmount" }
      }
    }
  ]);
};

module.exports = mongoose.model("Invoice", invoiceSchema);
