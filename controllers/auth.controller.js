const httpStatus = require('http-status');
const { successResponse, errorResponse } = require("../utils/response");
const authService = require("../services/auth.service");
const catchAsync = require("../utils/catchAsync");
const { AUTH_MESSAGES } = require("../types/messages");

const register = async (req, res) => {
  try {
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
          // company: { _id: user.company },
        },
        
        company: {
          _id: company._id,
          companyName: company.companyName,
          gstNo: company.gstNo,
          panNo: company.panNo,
        },
      },
      AUTH_MESSAGES.REGISTER_SUCCESS,
      httpStatus.CREATED
    );
  } catch (error) {
    // Handle different error types from service
    const message = error.message || AUTH_MESSAGES.REGISTER_FAILURE;
    const statusCode = error.statusCode || httpStatus.BAD_REQUEST; // Use service's status or default to 400
    
    return errorResponse(res, message, statusCode);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);

    return successResponse(
      res,
      {
        token,
        user: {
          ...user,
          company: user.company || null,
        },
      },
      AUTH_MESSAGES.LOGIN_SUCCESS,
      httpStatus.OK
    );
  } catch (error) {
    // Handle different error types from service
    const message = error.message || AUTH_MESSAGES.LOGIN_FAILURE;
    const statusCode = error.statusCode || httpStatus.UNAUTHORIZED; // Use service's status or default to 401
    
    return errorResponse(res, message, statusCode);
  }
};

module.exports = { register, login };
