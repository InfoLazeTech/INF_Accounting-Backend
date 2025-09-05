const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");

const authRoutes = require("./auth.route");
const walletRoutes = require("./wallet.route");

router.use("/auth", authRoutes);
router.use("/wallets", authToken, walletRoutes);

module.exports = router;
