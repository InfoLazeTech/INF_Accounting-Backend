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
      bankBalance:openingBalance
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

const listBankAccounts = async () => {
  const banks = await Bank.find()
    .populate({ path: "addedBy", select: "name email" })
    .populate({ path: "companyId", select: "companyName" });

  return banks;
};

const getBankAccountById = async (bankId) => {
  const bank = await Bank.findById(bankId)
    .populate({ path: "addedBy", select: "name email" })
    .populate({ path: "companyId", select: "companyName" });

  return bank;
};

module.exports = {
  createBankAccount,
  listBankAccounts,
  getBankAccountById,
};
