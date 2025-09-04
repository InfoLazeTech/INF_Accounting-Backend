const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");

const authRoutes = require("./auth.route");
const walletRoutes = require("./wallet.route");
const txRoutes = require("./transaction.route");

router.use("/auth", authRoutes);
router.use("/wallets", authToken, walletRoutes);
router.use("/tx", authToken ,txRoutes);

module.exports = router;
