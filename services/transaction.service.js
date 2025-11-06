const Transactions = require("../models/transaction.model");
const Bank = require("../models/bank.model");
const { default: mongoose } = require("mongoose");

const addTransaction = async (
  bankId,
  description,
  amount,
  type,
  date,
  companyId
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const lastTransaction = await Transactions.findOne({ bankId })
      .sort({ date: -1 })
      .session(session);

   let previousBalance = 0;

    if (bank && bank.bankBalance > 0) {
      previousBalance = bank.bankBalance;
    } else if (lastTransaction) {
      previousBalance = lastTransaction.balance;
    }

    const newBalance =
      type === "credit"
        ? previousBalance + Number(amount)
        : previousBalance - Number(amount);

    const transaction = new Transactions({
      bankId,
      companyId,
      description,
      amount: Number(amount),
      type,
      balance: newBalance,
      date: date || new Date(),
    });

    const bank = await Bank.findById(bankId).session(session);
    if (bank) {
      bank.bankBalance = newBalance;
      await bank.save({ session });
    }

    await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();

    return transaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getTransactionsByBankId = async (bankId, companyId, month, year) => {
  const m = Number(month);
  const y = Number(year);

  const startOfMonth = new Date(y, m - 1, 1); // month is 0-based
  const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999); // last day of month

  const bank = await Bank.findById(bankId).lean();
  
  const lastBeforeMonth = await Transactions.findOne({
    bankId,
    companyId,
    date: { $lt: startOfMonth },
  })
    .sort({ date: -1 })
    .lean();

 let openingBalance = 0;

  if (lastBeforeMonth) {
    openingBalance = lastBeforeMonth.balance;
  } else if (bank && bank.openingBalance) {
    openingBalance = bank.openingBalance;
  }

  const transactions = await Transactions.find({
    bankId,
    companyId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  })
    .sort({ date: 1 })
    .lean();

  const lastTransactionOfMonth = transactions[transactions.length - 1];
  const closingBalance = lastTransactionOfMonth
    ? lastTransactionOfMonth.balance
    : openingBalance;

  return {
    openingBalance,
    closingBalance,
    transactions,
  };
};


module.exports = {
  addTransaction,
  getTransactionsByBankId,
};
