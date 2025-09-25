const express = require("express");
const router = express.Router();
const customerVendorController = require("../controllers/customer.controller");

router.post("/create", customerVendorController.createCustomerVendor);
router.get("/get", customerVendorController.getAllCustomerVendors);
router.get("/:id", customerVendorController.getCustomerVendorById);
router.put("/:id", customerVendorController.updateCustomerVendor);
router.delete("/:id", customerVendorController.deleteCustomerVendor);

module.exports = router;
