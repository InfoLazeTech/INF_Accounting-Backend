const express = require("express");
const router = express.Router();
const customerVendorController = require("../controllers/customer.controller");
const authMiddleware = require("../middlewares/authToken");

router.post("/create", authMiddleware, customerVendorController.createCustomerVendor);
router.get("/get", authMiddleware, customerVendorController.getAllCustomerVendors);
router.get("/:id", authMiddleware, customerVendorController.getCustomerVendorById);
router.put("/:id", authMiddleware, customerVendorController.updateCustomerVendor);
router.delete("/:id", authMiddleware, customerVendorController.deleteCustomerVendor);

module.exports = router;
