const User = require("../models/user.model");
const Company = require("../models/company.model");
const { generateToken } = require("../config/jwt");
const { mongoose } = require("../config/db");
const { createCompany } = require("./company.service");

const register = async (
  email,
  password,
  phone,
  name,
  companyName,
  gstNo,
  panNo
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let user = await User.findOne({ email }).session(session);

    if (user && user.isVerified) {
      throw new Error("Email already registered");
    }

    const hash = await User.hashPassword(password);

    if (user) {
      // Update existing (unverified) user
      user.password = hash;
      user.name = name;
      user.phone = phone;
      user.isVerified = true;
      await user.save({ session });
    } else {
      // Create new user
      user = new User({
        email,
        password: hash,
        name,
        phone,
        isVerified: true,
        isActive: false,
      });
      await user.save({ session });
    }

    // Create company linked to user
    const company = new Company({
      companyName,
      gstNo,
      panNo,
    });
    await company.save({ session });

    user.company = company._id;
    user.isActive = true;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { user, company };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const login = async (email, password) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ email }).populate("company").session(session);
    if (!user) throw new Error("User not found");

    const ok = await user.verifyPassword(password);
    if (!ok) throw new Error("Invalid credentials");

    await session.commitTransaction();
    session.endSession();

    return {
      token: generateToken({ userId: user._id, email: user.email }),
      user: user.toObject(),
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

module.exports = {
  register,
  login,
};
