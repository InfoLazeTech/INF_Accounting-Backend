const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemMaster.controller");
const authMiddleware = require("../middlewares/authToken");
const validate = require("../middlewares/validate");
const { 
  itemValidation, 
  updateItemValidation, 
  getItemsValidation, 
  getItemValidation 
} = require("../validations/itemMaster.validation");

router.post("/createItem", authMiddleware, validate(itemValidation), itemController.createItem);
router.get("/getItem", authMiddleware, validate(getItemsValidation), itemController.getAllItems);
router.get("/:id", authMiddleware, validate(getItemValidation), itemController.getItemById);
router.put("/:id", authMiddleware, validate(updateItemValidation), itemController.updateItem);
router.delete("/:id", authMiddleware, itemController.deleteItem);

module.exports = router;
