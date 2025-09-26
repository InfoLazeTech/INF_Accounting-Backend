const Company = require("../models/company.model");
const mongoose = require("mongoose");

const updateCompany = async (companyId, updateData) => {
  console.log(companyId);
  
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    throw new Error("Invalid company ID");
  }

  const c = await Company.findById(companyId);
  

  const company = await Company.findByIdAndUpdate(
    companyId,
    { ...updateData, updatedAt: new Date() },
    { new: true }
  );
  console.log(company);
  

  if (!company) throw new Error("Company not found");

  return company;
};

const getCompany = async (companyId) => {
  const company = await Company.findById(companyId);
  if (!company) {
    throw new Error("Company not found");
  }
  return company;
};

module.exports = { getCompany, updateCompany };
