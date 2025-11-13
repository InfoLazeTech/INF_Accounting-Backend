const mongoose = require("mongoose");
const Account = require("../models/account.model");

const createAccount = async (
  companyId,
  parenttype,
  accountname,
  accountcode,
  description,
  userId
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = new Account({
      companyId,
      parenttype,
      accountname,
      accountcode,
      description,
      addedBy: userId,
    });

    await account.save({ session });
    await session.commitTransaction();
    session.endSession();

    return account;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};



const listAccounts = async ({ search, page = 1, limit = 10, companyId }) => {
  try {
    let query = { companyId };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { accountname: regex },
        { accountcode: regex },
      ];
    }
    const accounts = await Account.find(query)
      .populate({ path: "addedBy", select: "name email" })
      .populate({ path: "companyId", select: "companyName" })
      .sort({ createdAt: -1 });

    const grouped = {};
    for (const acc of accounts) {
      const parent = acc.parenttype;

      if (!grouped[parent]) {
        grouped[parent] = {
          id: acc._id.toString(),
          parentType: parent,
          accountName: parent,
          children: [],
        };
      }
      grouped[parent].children.push({
        id: acc._id,
        accountName: acc.accountname,
        accountCode: acc.accountcode,
        description: acc.description,
        companyId: acc.companyId?._id,
        // companyName: acc.companyId?.companyName,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt,
        parentType: acc.parenttype,
        // children: [],
      });
    }
    const hierarchicalData = Object.values(grouped);

    return {
      data: hierarchicalData,
      total: accounts.length,
    };
  } catch (error) {
    console.error("Error listing accounts:", error);
    throw error;
  }
};


const getAccountById = async (accountId, companyId) => {
  return await Account.findOne({ _id: accountId, companyId })
    .populate({ path: "addedBy", select: "name email" })
    .populate({ path: "companyId", select: "companyName" });
};

const getAccountsByCompany = async (companyId) => {
  return await Account.find({ companyId }).select(
    "accountname accountcode parenttype _id"
  );
};


const updateAccount = async (accountId, updatedData) => {
  console.log("account", updatedData);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await Account.findByIdAndUpdate(
      accountId,
      { $set: updatedData },
      { new: true, session }
    );

    await account.save({ session });

    await session.commitTransaction();
    session.endSession();

    return account;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


const deleteAccount = async (accountId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await Account.findByIdAndDelete(accountId).session(session);
    if (!account) throw new Error("Account not found");

    await session.commitTransaction();
    session.endSession();

    return account;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  createAccount,
  listAccounts,
  getAccountById,
  getAccountsByCompany,
  updateAccount,
  deleteAccount
};