const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const validate = require("../middlewares/validate");
const {
  companyUpdateValidation,
} = require("../validations/company.validations");
const authToken = require("../middlewares/authToken");

router.get("/:companyId", authToken, companyController.getCompany);
router.put("/:companyId", authToken,validate(companyUpdateValidation),companyController.updateCompany);

module.exports = router;
