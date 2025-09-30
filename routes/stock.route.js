const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stock.controller");

router.post("/add", stockController.addStock);
router.post("/remove", stockController.removeStock);

module.exports = router;
