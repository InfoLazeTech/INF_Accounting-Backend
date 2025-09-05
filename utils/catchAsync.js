const { errorResponse } = require("./response"); // adjust path if needed

const catchAsync = (fn) => (req, res) => {
  Promise.resolve(fn(req, res)).catch((err) => {
    return errorResponse(res, err.message || "Something went wrong", 500, err);
  });
};

module.exports = catchAsync;
