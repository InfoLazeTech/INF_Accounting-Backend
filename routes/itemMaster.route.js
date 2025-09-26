const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemMaster.controller");

router.post("/createItem", itemController.createItem);
router.get("/getItem", itemController.getAllItems);
router.get("/:id", itemController.getItemById);
router.put("/:id", itemController.updateItem);
router.delete("/:id", itemController.deleteItem);

module.exports = router;
