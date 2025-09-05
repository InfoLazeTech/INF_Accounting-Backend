const { verifyToken } = require("../config/jwt");
const { errorResponse } = require("../utils/response");

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return errorResponse(res, "Unauthorized", 401, "NO_TOKEN");

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // attach user to request
    next();
  } catch (e) {
    return errorResponse(res, "Invalid token", 403, "INVALID_TOKEN");
  }
};
