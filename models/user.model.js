const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: String,
  name: String,
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};

userSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
