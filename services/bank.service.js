const { default: mongoose } = require("mongoose");
const Bank = require("../models/bank.model");

const createBankAccount = async (
  bankName,
  accountNumber,
  userId,
  companyId,
  openingBalance
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingBank = await Bank.findOne({ accountNumber }).session(session);
    if (existingBank) {
      throw new Error("Bank account with this account number already exists");
    }

    const bank = new Bank({
      bankName,
      accountNumber,
      addedBy: userId,
      companyId,
      openingBalance,
      bankBalance: openingBalance,
    });

    await bank.save({ session });

    await session.commitTransaction();
    session.endSession();

    return bank;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const updateBankAccount = async (bankId, updates = {}, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const allowedFields = ["bankName", "accountNumber", "openingBalance"];
    const updateData = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No valid fields provided for update");
    }

    if (updateData.accountNumber) {
      const existingBank = await Bank.findOne({
        accountNumber: updateData.accountNumber,
        _id: { $ne: bankId },
      }).session(session);

      if (existingBank) {
        throw new Error("Bank account with this account number already exists");
      }
    }

    const updatedBank = await Bank.findByIdAndUpdate(
      bankId,
      { $set: updateData, lastModifiedBy: userId },
      { new: true, session }
    );

    if (!updatedBank) {
      throw new Error("Bank account not found");
    }

    await session.commitTransaction();
    session.endSession();

    return updatedBank;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const listBankAccounts = async ({ companyId,search, page = 1, limit = 10 }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let query = {};
    if (search) {
      query.$or = [
        { bankName: { $regex: search, $options: "i" } },
        { accountNumber: { $regex: search, $options: "i" } },
      ];
    }

   if (companyId) {
  query.companyId = companyId;
}
    const skip = (page - 1) * limit;
    const banks = await Bank.find(query)
      .populate({ path: "addedBy", select: "name email" })
      .populate({ path: "companyId", select: "companyName" })
      .skip(skip)
      .limit(limit)
      .session(session);

    const total = await Bank.countDocuments(query).session(session);

    await session.commitTransaction();
    session.endSession();

    return {
      data: banks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getBankAccountById = async (bankId) => {
  const bank = await Bank.findById(bankId)
    .populate({ path: "addedBy", select: "name email" })
    .populate({ path: "companyId", select: "companyName" });

  return bank;
};

const getBankAccounts = async (companyId) => {
  const bank = await Bank.find({companyId:companyId}).select("bankName accountNumber _id");
  return bank;
};

module.exports = {
  createBankAccount,
  updateBankAccount,
  listBankAccounts,
  getBankAccountById,
  getBankAccounts,
};
