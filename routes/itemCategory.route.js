const express = require("express");
const router = express.Router();
const itemCategoryController = require("../controllers/itemCategory.controller");

router.post("/create", itemCategoryController.createCategory);
router.get("/get", itemCategoryController.getCategories);
router.get("/:id", itemCategoryController.getCategoryById);
router.put("/:id", itemCategoryController.updateCategory);
router.delete("/:id", itemCategoryController.deleteCategory);

module.exports = router;
