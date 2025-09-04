const { verifyToken } = require("../config/jwt");
const { error } = require("../utils/response");

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json(error("Unauthorized", "NO_TOKEN"));

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // attach user to request
    next();
  } catch (e) {
    return res.status(403).json(error("Invalid token", "INVALID_TOKEN"));
  }
};
