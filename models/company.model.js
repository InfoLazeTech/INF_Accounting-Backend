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

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Company", companySchema);
