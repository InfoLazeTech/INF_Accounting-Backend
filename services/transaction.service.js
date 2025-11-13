const Transactions = require("../models/transaction.model");
const Bank = require("../models/bank.model");
const { default: mongoose } = require("mongoose");
// const { getCustomerVendorById } = require("../../INF_Accounting-Frontend/src/redux/slice/customer/customerVendorSlice");

const addTransaction = async (
  bankId,
  description,
  amount,
  type,
  date,
  companyId,
  customerVendorId,
  parentId,
  childrenId,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const lastTransaction = await Transactions.findOne({ bankId })
      .sort({ date: -1 })
      .session(session);
    const bank = await Bank.findById(bankId).session(session);

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
      customerVendorId: customerVendorId || null,
      parentId: parentId,
      childrenId: childrenId
    });

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

const updateTransaction = async (
  transactionId, description, amount, type, date
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingTx = await Transactions.findById(transactionId)
      .session(session);
    if (!existingTx) {
      throw new Error("Transaction not found");
    }

    const bank = await Bank.findById(existingTx.bankId).session(session);
    if (!bank) {
      throw new Error("Bank not found");
    }

    // Reverse old transaction effect on bank balance
    if (existingTx.type === "credit") {
      bank.bankBalance -= existingTx.amount;
    } else if (existingTx.type === "debit") {
      bank.bankBalance += existingTx.amount;
    }

    // Apply new transaction effect
    const newAmount = Number(amount ?? existingTx.amount);
    const newType = type ?? existingTx.type;

    if (newType === "credit") {
      bank.bankBalance += newAmount;
    } else if (newType === "debit") {
      bank.bankBalance -= newAmount;
    }

    // Update transaction record
    existingTx.description = description ?? existingTx.description;
    existingTx.amount = newAmount;
    existingTx.type = newType;
    existingTx.date = date ?? existingTx.date;
    existingTx.balance = bank.bankBalance;

    await existingTx.save({ session });
    await bank.save({ session });

    await session.commitTransaction();
    session.endSession();

    return existingTx;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deleteTransaction = async (transactionId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingTx = await Transactions.findById(transactionId)
      .session(session);
    if (!existingTx) {
      throw new Error("Transaction not found");
    }

    const bank = await Bank.findById(existingTx.bankId).session(session);
    if (!bank) {
      throw new Error("Bank not found");
    }

    // Reverse the effect of deleted transaction
    if (existingTx.type === "credit") {
      bank.bankBalance -= existingTx.amount;
    } else if (existingTx.type === "debit") {
      bank.bankBalance += existingTx.amount;
    }

    await existingTx.deleteOne({ session });
    await bank.save({ session });

    await session.commitTransaction();
    session.endSession();

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getTransactionsByBankIdold = async (bankId, companyId, month, year) => {
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

const getTransactionsByBankIdOLD = async (
  bankId,
  companyId,
  startDate,
  endDate
) => {
  let start, end;

  if (startDate) {
    start = new Date(startDate);
  } else {
    // Default: first day of the current month
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (endDate) {
    end = new Date(endDate);
    // Include entire day for endDate
    end.setHours(23, 59, 59, 999);
  } else {
    // Default: last day of the current month
    const now = new Date();
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
  const bank = await Bank.findById(bankId).lean();

  const prevTransactions = await Transactions.find({
    bankId,
    companyId,
    date: { $lt: start },
  })
    .sort({ date: 1 })
    .lean();

  let openingBalance = bank?.openingBalance || 0;
  openingBalance = prevTransactions.reduce((balance, tx) => {
    if (tx.type === "credit") return balance + tx.amount;
    if (tx.type === "debit") return balance - tx.amount;
    return balance;
  }, openingBalance);

  const transactions = await Transactions.find({
    bankId,
    companyId,
    date: { $gte: start, $lte: end },
  })
    .sort({ date: 1 })
    .lean();

  let runningBalance = openingBalance;
  const dynamicTransactions = transactions.map((tx) => {
    if (tx.type === "credit") runningBalance += tx.amount;
    else if (tx.type === "debit") runningBalance -= tx.amount;
    return { ...tx, balance: runningBalance }; // attach dynamic balance
  });

  const closingBalance = runningBalance;
  const bankName = bank.bankName;
  const BankAccountNo = bank.accountNumber
  const bankData = { openingBalance, closingBalance, bankName, BankAccountNo };
  return {
    bankData: bankData,
    transactions: dynamicTransactions,
  };
};

const getTransactionsByBankId = async (
  bankId,
  companyId,
  startDate,
  endDate
) => {
  let start, end;

  if (startDate) {
    start = new Date(startDate);
  } else {
    // Default: first day of the current month
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (endDate) {
    end = new Date(endDate);
    // Include entire day for endDate
    end.setHours(23, 59, 59, 999);
  } else {
    // Default: last day of the current month
    const now = new Date();
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
  const bank = await Bank.findById(bankId).lean();

  if (!bank) throw new Error("Bank not found");

  const initialOpening = bank.openingBalance || 0;

  const allTransactions = await Transactions.find({
    bankId,
    companyId,
    date: { $lte: end },
  })
    .sort({ date: 1 })
    .lean();

  const prevTransactions = allTransactions.filter(tx => tx.date < start);
  const currentTransactions = allTransactions.filter(tx => tx.date >= start);

  const openingBalance = prevTransactions.reduce((balance, tx) => {
    return tx.type === "credit" ? balance + tx.amount :
      tx.type === "debit" ? balance - tx.amount : balance;
  }, initialOpening);

  let runningBalance = openingBalance;
  const dynamicTransactions = currentTransactions.map(tx => {
    runningBalance += tx.type === "credit" ? tx.amount :
      tx.type === "debit" ? -tx.amount : 0;
    return { ...tx, balance: runningBalance };
  });

  const closingBalance = runningBalance;
  const bankName = bank.bankName;
  const BankAccountNo = bank.accountNumber
  const bankData = { openingBalance, closingBalance, bankName, BankAccountNo };
  return {
    bankData: bankData,
    transactions: dynamicTransactions,
  };
};

module.exports = {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByBankId,
};
