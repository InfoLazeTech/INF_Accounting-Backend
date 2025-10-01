const mongoose = require("mongoose");
const Counter = require("./counter.model");

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
    customerVendorId: { type: String, unique: true }, // CUS-00001
    type: {
      isCustomer: { type: Boolean, default: false },
      isVendor: { type: Boolean, default: false },
    },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    name: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String, unique: true },
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
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

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
    if (!this.company)
      return next(new Error("Company ID is required for customer/vendor"));

    const counterId = `customerVendorId_${this.company.toString()}`;
    const counter = await Counter.findByIdAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.customerVendorId = `CUS-${String(counter.seq).padStart(5, "0")}`;
  }
  next();
});

const CustomerVendor = mongoose.model("CustomerVendor", customerVendorSchema);
module.exports = CustomerVendor;
