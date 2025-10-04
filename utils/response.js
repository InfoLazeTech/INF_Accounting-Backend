const successResponse = (res, data = null, message = null, statusCode = null, extras = null) => {
  const response = {
    success: true,
    message: message || 'Success',
  };

  if (data !== null) {
    response.data = data;
  }
  
  if (extras) response.extras = extras;
  return res.status(statusCode || 200).json(response);
};

const errorResponse = (res, message = null, statusCode = null, details = null) => {
  return res.status(statusCode || 500).json({
    success: false,
    error: {
      message: message || 'Something went wrong',
      code: statusCode || 500,
      details,
    },
  });
};

module.exports = { successResponse, errorResponse };
