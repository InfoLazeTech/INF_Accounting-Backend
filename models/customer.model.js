const mongoose = require("mongoose");

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
    type: {
      isCustomer: { type: Boolean, default: false },
      isVendor: { type: Boolean, default: false },
    },
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
      enum: ["Active", "Inactive", "Blocked"],
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

const CustomerVendor = mongoose.model("CustomerVendor", customerVendorSchema);
module.exports = CustomerVendor;
