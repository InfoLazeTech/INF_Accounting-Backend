const express = require("express");
const router = express.Router();
const customerVendorController = require("../controllers/customer.controller");
const authMiddleware = require("../middlewares/authToken");
const validate = require("../middlewares/validate"); 
const { customerVendorValidation } = require("../validations/customer.validation");

router.post("/create", authMiddleware,validate(customerVendorValidation), customerVendorController.createCustomerVendor);
router.get("/get", authMiddleware, customerVendorController.getAllCustomerVendors);
router.get("/:id", authMiddleware, customerVendorController.getCustomerVendorById);
router.put("/:id", authMiddleware, validate(customerVendorValidation), customerVendorController.updateCustomerVendor);
router.delete("/:id", authMiddleware, customerVendorController.deleteCustomerVendor);

module.exports = router;
