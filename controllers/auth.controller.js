const { successResponse, errorResponse } = require("../utils/response");
const authService = require("../services/auth.service");
const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req, res) => {
  const { email, password, name, phone, companyName, gstNo, panNo } = req.body;

  const { user, company } = await authService.register(
    email,
    password,
    phone,
    name,
    companyName,
    gstNo,
    panNo
  );

  return successResponse(
    res,
    {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        password: user.password,
        company: { _id: user.company },
      },
      company: {
        _id: company._id,
        companyName: company.companyName,
        gstNo: company.gstNo,
        panNo: company.panNo,
      },
    },
    "Registered Successfully"
  );
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  return successResponse(res, data, "Logged in successfully");
});

module.exports = { register, login };
