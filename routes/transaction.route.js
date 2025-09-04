const express = require("express");
const router = express.Router();
const transaction = require("../controllers/transaction.Controller");

router.post('/tx/transfer',transaction.transfer);

module.exports = router;