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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
  let query = { companyId };

    if (search) {
      query.$or = [
        { accountname: { $regex: search, $options: "i" } },
        { accountcode: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const accounts = await Account.find(query)
      .populate({ path: "addedBy", select: "name email" })
      .populate({ path: "companyId", select: "companyName" })
      .skip(skip)
      .limit(limit)
      .session(session);

    const total = await Account.countDocuments(query).session(session);

    await session.commitTransaction();
    session.endSession();

    return {
      data: accounts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAccountById = async (accountId,companyId) => {
return await Account.findOne({ _id: accountId, companyId })
    .populate({ path: "addedBy", select: "name email" })
    .populate({ path: "companyId", select: "companyName" });
};

const getAccountsByCompany = async (companyId) => {
  return await Account.find({ companyId }).select(
    "accountname accountcode parenttype _id"
  );
};

module.exports = {
  createAccount,
  listAccounts,
  getAccountById,
  getAccountsByCompany,
};