# Simple Stock Management System

## Overview
A simplified stock management system that automatically updates the `availableStock` field when bills and invoices are created or edited.

## 🎯 **How It Works**

### **Bill Creation**
- When a bill is created, stock is **increased** for all items
- `availableStock += item.quantity` for each item

### **Invoice Creation**
- When an invoice is created, stock is **decreased** for all items
- `availableStock -= item.quantity` for each item

### **Edit Scenarios**

#### **Bill Edit**
1. **Reverse Phase**: Remove stock from old items
2. **Apply Phase**: Add stock for new items

#### **Invoice Edit**
1. **Reverse Phase**: Add back stock from old items
2. **Apply Phase**: Remove stock for new items

## 📁 **Files Modified**

### **Stock Service** (`services/stock.service.js`)
```javascript
// Simple operations
addStock({ companyId, itemId, quantity })     // Increases stock
removeStock({ companyId, itemId, quantity })  // Decreases stock

// Bill/Invoice integration
updateStockForBill(billData)                 // Adds stock for all bill items
updateStockForInvoice(invoiceData)           // Removes stock for all invoice items

// Edit handling
handleBillEdit(oldItems, newItems, companyId)     // Handles bill edits
handleInvoiceEdit(oldItems, newItems, companyId)  // Handles invoice edits
```

### **Bill Service** (`services/bill.service.js`)
- Automatically calls `updateStockForBill()` when bill is created
- Automatically calls `handleBillEdit()` when bill is updated

### **Invoice Service** (`services/invoice.service.js`)
- Automatically calls `updateStockForInvoice()` when invoice is created
- Automatically calls `handleInvoiceEdit()` when invoice is updated

## 🚀 **API Endpoints**

### **Stock Management**
- `POST /stock/add` - Manually add stock
- `POST /stock/remove` - Manually remove stock
- `GET /stock/low-stock` - Get items below reorder level
- `GET /stock/summary` - Get stock summary for company

## 🔧 **Usage Examples**

### **Automatic Stock Updates**
```javascript
// When you create a bill
const bill = {
  companyId: "64f8a1b2c3d4e5f6a7b8c9d1",
  items: [
    { itemId: "64f8a1b2c3d4e5f6a7b8c9d2", quantity: 10 },
    { itemId: "64f8a1b2c3d4e5f6a7b8c9d3", quantity: 5 }
  ]
};
// Stock will automatically increase by 10 and 5 respectively

// When you create an invoice
const invoice = {
  companyId: "64f8a1b2c3d4e5f6a7b8c9d1",
  items: [
    { itemId: "64f8a1b2c3d4e5f6a7b8c9d2", quantity: 3 },
    { itemId: "64f8a1b2c3d4e5f6a7b8c9d3", quantity: 2 }
  ]
};
// Stock will automatically decrease by 3 and 2 respectively
```

### **Edit Scenarios**
```javascript
// When you edit a bill
// Old items: [{ itemId: "item1", quantity: 10 }]
// New items: [{ itemId: "item1", quantity: 15 }]
// Result: Stock increases by 5 (15 - 10)

// When you edit an invoice
// Old items: [{ itemId: "item1", quantity: 5 }]
// New items: [{ itemId: "item1", quantity: 3 }]
// Result: Stock increases by 2 (5 - 3)
```

## 🛡️ **Safety Features**

### **Transaction Safety**
- All stock operations use MongoDB transactions
- Rollback on failure ensures data consistency

### **Stock Validation**
- Prevents negative stock for sales
- Validates sufficient stock before sales

### **Error Handling**
- Graceful error handling with logging
- Stock operations don't fail bill/invoice creation

## 📊 **Stock Summary**

The system provides basic stock reporting:
- Total items in company
- Total stock value
- Number of low stock items

## 🎯 **Benefits**

1. **Simple**: Just updates `availableStock` field
2. **Automatic**: No manual intervention needed
3. **Safe**: Transaction-based operations
4. **Efficient**: Minimal database operations
5. **Reliable**: Handles edit scenarios properly

## 🔧 **Configuration**

### **Item Setup**
```javascript
const item = {
  name: "Laptop Computer",
  sku: "LAP-001",
  availableStock: 10,        // Current stock
  reorderLevel: 5,          // Alert when stock <= 5
  purchasePrice: 50000,     // For value calculations
  isActive: true
};
```

## 🚨 **Error Handling**

### **Common Scenarios**
1. **Insufficient Stock**: Prevents sales when stock is insufficient
2. **Item Not Found**: Validates item existence
3. **Transaction Failures**: Automatic rollback on errors

### **Error Messages**
- "Item not found for this company"
- "Not enough stock available"
- "Stock update failed for bill/invoice"

## 📈 **Monitoring**

### **Low Stock Alerts**
- Automatic identification of items below reorder level
- Configurable reorder levels per item

### **Stock Summary**
- Total stock value calculation
- Low stock item count
- Company-wide stock overview

---

**Note**: This simplified system focuses on just updating the `availableStock` field without complex tracking, making it perfect for basic inventory management needs.
