const mongoose = require("mongoose");
const CounterService = require("../services/counter.service");

const addressSchema = new mongoose.Schema(
  {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
  },
  { _id: false }
);

const customerVendorSchema = new mongoose.Schema(
  {
    customerVendorId: { type: String }, // CUS-00001 (unique per company)
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    companyName: { type: String },
    type: {
      isCustomer: { type: Boolean, default: false },
      isVendor: { type: Boolean, default: false },
    },
    name: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String },
    billingAddress: { type: addressSchema },
    shippingAddress: { type: addressSchema },
    gstNumber: { type: String },
    creditLimit: { type: Number },
    paymentTerms: {
      type: String,
      enum: ["Prepaid", "Net 15", "Net 30", "Custom"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// Compound unique index: customerVendorId must be unique within each company
customerVendorSchema.index({ companyId: 1, customerVendorId: 1 }, { unique: true });

customerVendorSchema.pre("save", function (next) {
  if (
    (this.type.isCustomer && this.type.isVendor) ||
    (!this.type.isCustomer && !this.type.isVendor)
  ) {
    return next(
      new Error("You must select either Customer OR Vendor, not both or none.")
    );
  }
  next();
});

customerVendorSchema.pre("save", async function (next) {
  if (this.isNew) {
    if (!this.companyId) {
      return next(new Error("Company ID is required for customer/vendor"));
    }

    try {
      // Generate unique customer ID using the robust counter system
      this.customerVendorId = await CounterService.generateNextId(
        this.companyId.toString(), 
        'CUSTOMER', 
        5
      );
      
      // Double-check uniqueness within the company
      const existingCustomer = await this.constructor.findOne({
        companyId: this.companyId,
        customerVendorId: this.customerVendorId
      });
      
      if (existingCustomer) {
        // If ID already exists, generate a new one
        this.customerVendorId = await CounterService.generateNextId(
          this.companyId.toString(), 
          'CUSTOMER', 
          5
        );
      }
    } catch (error) {
      return next(new Error(`Failed to generate customer ID: ${error.message}`));
    }
  }
  next();
});

const CustomerVendor = mongoose.model("CustomerVendor", customerVendorSchema);
module.exports = CustomerVendor;
