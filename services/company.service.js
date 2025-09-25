const Company = require("../models/company.model");

const updateCompany = async (companyId, updateData) => {
  const company = await Company.findByIdAndUpdate(
    companyId,
    { ...updateData, updatedAt: new Date() },
    { new: true } // return updated doc
  );

  if (!company) {
    throw new Error("Company not found");
  }
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
