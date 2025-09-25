const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const authToken = require("../middlewares/authToken");

// PUT /api/company/:companyId
router.put("/:companyId", companyController.updateCompany);
router.get("/:companyId", companyController.getCompany);

module.exports = router;
