const stockService = require("../services/stock.service");

const addStock = async (req, res) => {
  try {
    const { companyId, itemId, quantity } = req.body;
    if (!companyId || !itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "companyId, itemId and quantity are required",
      });
    }

    const item = await stockService.addStock({ companyId, itemId, quantity });
    res.json({
      success: true,
      message: "Stock added successfully",
      data: item,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const removeStock = async (req, res) => {
  try {
    const { companyId, itemId, quantity } = req.body;
    if (!companyId || !itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "companyId, itemId and quantity are required",
      });
    }

    const item = await stockService.removeStock({
      companyId,
      itemId,
      quantity,
    });
    res.json({
      success: true,
      message: "Stock removed successfully",
      data: item,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { addStock, removeStock };
