const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  gstNo: { type: String, required: true },
  panNo: { type: String, required: true },

  termsAndConditions: { type: String },

  address: {
    street1: { type: String },
    street2: { type: String },
    city: { type: String },
    state: { type: String },
    pinCode: { type: String },
    faxNumber: { type: String },
  },
  logo: { type: String },
  signature: { type: String },

  // Invoice number configuration (optional, defaults to 'INV' prefix)
  invoiceNumberConfig: {
    prefix: { type: String }, // Custom prefix (e.g., 'INV', 'INV-2024', etc.)
    suffix: { type: String }, // Custom suffix (e.g., '2024', 'Q1', etc.)
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Company", companySchema);
