const express = require("express");
const router = express.Router();
const wallet = require("../controllers/wallet.controller");

router.post('/create-default', wallet.createDefaultWallets);
router.post('/import', wallet.importWallet);
router.post('/create', wallet.createWallet);
router.get('/', wallet.list);

module.exports = router;