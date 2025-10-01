const express = require("express");
const router = express.Router();
const itemCategoryController = require("../controllers/itemCategory.controller");
const authMiddleware = require("../middlewares/authToken");
const validate = require("../middlewares/validate");
const {
  itemCategoryValidation,
} = require("../validations/itemCategory.validation");

router.post(
  "/create",
  authMiddleware,
  validate(itemCategoryValidation),
  itemCategoryController.createCategory
);
router.get("/get", authMiddleware, itemCategoryController.getCategories);
router.get("/:id", authMiddleware, itemCategoryController.getCategoryById);
router.put(
  "/:id",
  authMiddleware,
  validate(itemCategoryValidation),
  itemCategoryController.updateCategory
);
router.delete("/:id",authMiddleware, itemCategoryController.deleteCategory);

module.exports = router;
