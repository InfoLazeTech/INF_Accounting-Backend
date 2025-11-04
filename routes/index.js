const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");

const authRoutes = require("./auth.route");
const companyRoutes = require("./company.route");
const customerRoutes = require("./customer.routes");
const itemCategory = require("./itemCategory.route");
const itemMaster = require("./itemMaster.route");
const stock = require("./stock.route");
const counterRoutes = require("./counter.route");
const billRoutes = require("./bill.route");
const invoiceRoutes = require("./invoice.route");
const paymentRoutes = require("./payment.route");
const reportRoutes = require("./report.route");
const itemConfigurationRoutes = require("./itemConfiguration.route");

router.use("/auth", authRoutes);
router.use("/company", companyRoutes);
router.use("/customer", customerRoutes);
router.use("/item-category", itemCategory);
router.use("/item-master", itemMaster);
router.use("/stock", stock);
router.use("/counter", counterRoutes);
router.use("/bill", billRoutes);
router.use("/invoice", invoiceRoutes);
router.use("/payment", paymentRoutes);
router.use("/report", reportRoutes);
router.use("/item-configuration", itemConfigurationRoutes);



module.exports = router;
