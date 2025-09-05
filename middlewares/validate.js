const { errorResponse } = require('../utils/response');

// const validate = (schema) => (req, res) => {
//   const { error } = schema.validate(req.body, { abortEarly: false });

//   if (error) {
//     const errors = error.details.map((d) => d.message);
//     // Use your error helper for a standardized response
//     return errorResponse(res, 'Validation failed', 400, errors);
//   }

//   // If validation passes, just continue (no next needed)
//   return res.status(200).json({ success: true, message: 'Validation passed' });
// };

// module.exports = validate;

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((d) => d.message);
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  // Validation passed, move to next middleware/handler
  next();
};

module.exports = validate;
