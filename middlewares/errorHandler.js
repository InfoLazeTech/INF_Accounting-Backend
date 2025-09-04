const { error } = require('../utils/response');
module.exports = function (err, req, res, next) {
  console.error(err);
  res.status(500).json(error(err.message || 'Internal Server Error', err.code || 'INTERNAL_ERROR'));
};
