const { error } = require('./response'); // adjust path if needed

const catchAsync = (fn) => (req, res) => {
  Promise.resolve(fn(req, res)).catch((err) => {
    return error(res, err.message || 'Something went wrong', 500, err);
  });
};

module.exports = catchAsync;
