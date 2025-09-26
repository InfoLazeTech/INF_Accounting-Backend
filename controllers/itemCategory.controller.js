const itemCategoryService = require("../services/itemCategory.service");

exports.createCategory = async (req, res) => {
  try {
    const category = await itemCategoryService.createItemCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    let filter = {};
    if (req.query.companyId) {
      filter.companyId = req.query.companyId;
    }
    const categories = await itemCategoryService.getAllItemCategories(filter);
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await itemCategoryService.getItemCategoryById(
      req.params.id
    );
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await itemCategoryService.updateItemCategory(
      req.params.id,
      req.body
    );
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await itemCategoryService.deleteItemCategory(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
