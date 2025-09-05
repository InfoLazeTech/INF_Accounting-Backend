const express = require("express");
const router = express.Router();
const wallet = require("../controllers/wallet.controller");
const {createWalletValidation,listWalletsValidation} = require('../validations/wallet.validation');
const validate = require("../middlewares/validate");

router.post('/create-default', wallet.createDefaultWallets);
// router.post('/import', wallet.importWallet);
router.post('/create',validate(createWalletValidation), wallet.createWallet);
router.get('/',validate(listWalletsValidation), wallet.list);

module.exports = router;