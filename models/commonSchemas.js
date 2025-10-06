const mongoose = require("mongoose");

// Common address schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" }
}, { _id: false });

// Common contact schema
const contactSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: { type: String }
}, { _id: false });

// Common item line schema for bills and invoices
const itemLineSchema = new mongoose.Schema({
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ItemMaster", 
    required: true 
  },
  itemName: { type: String, required: true }, // Store for reference
  hsnCode: { type: String, required: true },
  sku: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  discountType: { 
    type: String, 
    enum: ["percentage", "fixed"], 
    default: "percentage" 
  },
  taxRate: { type: Number, default: 0, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 }
}, { _id: false });

// Common payment terms schema
const paymentTermsSchema = new mongoose.Schema({
  dueDate: { type: Date, required: true },
  paymentMethod: { 
    type: String, 
    enum: ["cash", "bank_transfer", "cheque", "card", "upi", "other"],
    default: "cash"
  },
  paymentTerms: {
    type: String,
    enum: ["Prepaid", "Net 15", "Net 30", "Custom"],
  },
  notes: { type: String }
}, { _id: false });

// Common totals schema
const totalsSchema = new mongoose.Schema({
  subtotal: { type: Number, required: true, min: 0 },
  totalDiscount: { type: Number, default: 0, min: 0 },
  sgst: {
    type: Number,
    default: 0.0,
  },
  cgst: {
    type: Number,
    default: 0.0,
  },
  igst: {
    type: Number,
    default: 0.0,
  },
  totalTax: { type: Number, default: 0, min: 0 },
  shippingCharges: { type: Number, default: 0, min: 0 },
  otherCharges: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 }
}, { _id: false });

module.exports = {
  addressSchema,
  contactSchema,
  itemLineSchema,
  paymentTermsSchema,
  totalsSchema
};
