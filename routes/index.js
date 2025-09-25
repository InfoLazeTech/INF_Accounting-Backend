const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");

const authRoutes = require("./auth.route");
const companyRoutes = require("./company.route");
const customerRoutes = require("./customer.routes");

router.use("/auth", authRoutes);
router.use("/company", companyRoutes);
router.use("/customer", customerRoutes);

module.exports = router;
