const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");

const authRoutes = require("./auth.route");
const companyRoutes = require("./company.route");
const customerRoutes = require("./customer.routes");
const itemCategory = require("./itemCategory.route");
const itemMaster = require("./itemMaster.route");
const stock = require("./stock.route");

router.use("/auth", authRoutes);
router.use("/company", companyRoutes);
router.use("/customer", customerRoutes);
router.use("/item-category",itemCategory);
router.use("/itemMaster",itemMaster);
router.use("/stock",stock);

module.exports = router;
