# Postman API Testing Guide - Step by Step

## 🚀 **Setup Instructions**

### **1. Environment Setup**
Create a new environment in Postman with these variables:
```
BASE_URL: http://localhost:3000/api
TOKEN: (will be set after login)
COMPANY_ID: 64f8a1b2c3d4e5f6a7b8c9d1
VENDOR_ID: 64f8a1b2c3d4e5f6a7b8c9d2
CUSTOMER_ID: 64f8a1b2c3d4e5f6a7b8c9d3
ITEM_ID: 64f8a1b2c3d4e5f6a7b8c9d4
```

### **2. Collection Setup**
Create a new collection called "INF Accounting API" and organize requests into folders:
- 🔐 Authentication
- 📋 Bills
- 📄 Invoices  
- 📦 Stock
- 📊 Analytics

---

## 🔐 **STEP 1: AUTHENTICATION**

### **1.1 Register User**
**POST** `{{BASE_URL}}/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@infaccounting.com",
  "password": "Admin@123",
  "name": "Admin User",
  "phone": "+91-9876543210",
  "companyName": "INF Accounting Solutions",
  "gstNo": "27ABCDE1234F1Z5",
  "panNo": "ABCDE1234F"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "email": "admin@infaccounting.com",
      "name": "Admin User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ Save the token to {{TOKEN}} variable**

### **1.2 Login User**
**POST** `{{BASE_URL}}/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@infaccounting.com",
  "password": "Admin@123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "email": "admin@infaccounting.com",
      "name": "Admin User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ Update {{TOKEN}} variable with new token**

---

## 📋 **STEP 2: BILL MANAGEMENT**

### **2.1 Create Bill**
**POST** `{{BASE_URL}}/bill`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN}}
```

**Body (raw JSON):**
```json
{
  "companyId": "{{COMPANY_ID}}",
  "vendorId": "{{VENDOR_ID}}",
  "vendorName": "ABC Suppliers Ltd",
  "billDate": "2024-01-15T10:30:00.000Z",
  "dueDate": "2024-02-15T10:30:00.000Z",
  "referenceNumber": "PO-2024-001",
  "description": "Office equipment purchase",
  "items": [
    {
      "itemId": "{{ITEM_ID}}",
      "itemName": "Dell Laptop",
      "hsnCode": "8471",
      "sku": "LAP-DELL-001",
      "description": "Dell Inspiron 15 3000",
      "quantity": 5,
      "unitPrice": 45000,
      "discount": 0,
      "taxRate": 18,
      "lineTotal": 225000
    },
    {
      "itemId": "64f8a1b2c3d4e5f6a7b8c9d5",
      "itemName": "Wireless Mouse",
      "hsnCode": "8471",
      "sku": "MSE-WIRE-001",
      "description": "Logitech Wireless Mouse",
      "quantity": 10,
      "unitPrice": 1200,
      "discount": 0,
      "taxRate": 18,
      "lineTotal": 12000
    }
  ],
  "totals": {
    "subtotal": 237000,
    "totalDiscount": 0,
    "sgst": 21330,
    "cgst": 21330,
    "igst": 0,
    "totalTax": 42660,
    "shippingCharges": 2000,
    "otherCharges": 0,
    "grandTotal": 281660
  },
  "paymentTerms": {
    "dueDate": "2024-02-15T10:30:00.000Z",
    "paymentMethod": "bank_transfer",
    "paymentTerms": "Net 30",
    "notes": "Payment within 30 days"
  },
  "status": "draft",
  "customerNotes": "Urgent delivery required",
  "termsAndConditions": "Standard terms and conditions apply"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bill created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
    "billNumber": "BIL-00001",
    "companyId": "{{COMPANY_ID}}",
    "vendorId": "{{VENDOR_ID}}",
    "vendorName": "ABC Suppliers Ltd",
    "billDate": "2024-01-15T10:30:00.000Z",
    "dueDate": "2024-02-15T10:30:00.000Z",
    "status": "draft",
    "paymentStatus": "unpaid",
    "paidAmount": 0,
    "remainingAmount": 281660,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**⚠️ Save the bill ID for future requests**

### **2.2 Get All Bills**
**GET** `{{BASE_URL}}/bill?companyId={{COMPANY_ID}}&page=1&limit=10`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bills fetched successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
      "billNumber": "BIL-00001",
      "vendorName": "ABC Suppliers Ltd",
      "billDate": "2024-01-15T10:30:00.000Z",
      "dueDate": "2024-02-15T10:30:00.000Z",
      "status": "draft",
      "paymentStatus": "unpaid",
      "totals": {
        "grandTotal": 281660
      },
      "vendorId": {
        "_id": "{{VENDOR_ID}}",
        "name": "ABC Suppliers Ltd",
        "contactPerson": "John Doe"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 1,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### **2.3 Get Bill by ID**
**GET** `{{BASE_URL}}/bill/64f8a1b2c3d4e5f6a7b8c9d6?companyId={{COMPANY_ID}}`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bill fetched successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
    "billNumber": "BIL-00001",
    "companyId": "{{COMPANY_ID}}",
    "vendorId": "{{VENDOR_ID}}",
    "vendorName": "ABC Suppliers Ltd",
    "billDate": "2024-01-15T10:30:00.000Z",
    "dueDate": "2024-02-15T10:30:00.000Z",
    "referenceNumber": "PO-2024-001",
    "description": "Office equipment purchase",
    "items": [
      {
        "itemId": "{{ITEM_ID}}",
        "itemName": "Dell Laptop",
        "hsnCode": "8471",
        "sku": "LAP-DELL-001",
        "quantity": 5,
        "unitPrice": 45000,
        "discount": 0,
        "taxRate": 18,
        "lineTotal": 225000
      }
    ],
    "totals": {
      "subtotal": 237000,
      "totalDiscount": 0,
      "sgst": 21330,
      "cgst": 21330,
      "igst": 0,
      "totalTax": 42660,
      "shippingCharges": 2000,
      "otherCharges": 0,
      "grandTotal": 281660
    },
    "status": "draft",
    "paymentStatus": "unpaid",
    "paidAmount": 0,
    "remainingAmount": 281660,
    "customerNotes": "Urgent delivery required",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### **2.4 Update Bill Status**
**PATCH** `{{BASE_URL}}/bill/64f8a1b2c3d4e5f6a7b8c9d6/status`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN}}
```

**Body (raw JSON):**
```json
{
  "status": "approved"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bill status updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
    "status": "approved",
    "approvedBy": "{{USER_ID}}",
    "approvedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### **2.5 Record Payment**
**PATCH** `{{BASE_URL}}/bill/64f8a1b2c3d4e5f6a7b8c9d6/payment`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN}}
```

**Body (raw JSON):**
```json
{
  "paymentAmount": 100000
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
    "paidAmount": 100000,
    "remainingAmount": 181660,
    "paymentStatus": "partial"
  }
}
```

### **2.6 Get Bills by Status**
**GET** `{{BASE_URL}}/bill/status/list?companyId={{COMPANY_ID}}&status=approved`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bills fetched successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
      "billNumber": "BIL-00001",
      "vendorName": "ABC Suppliers Ltd",
      "status": "approved",
      "totals": {
        "grandTotal": 281660
      }
    }
  ]
}
```

### **2.7 Get Bill Summary**
**GET** `{{BASE_URL}}/bill/summary/stats?companyId={{COMPANY_ID}}&startDate=2024-01-01&endDate=2024-12-31`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bill summary fetched successfully",
  "data": [
    {
      "_id": null,
      "totalBills": 1,
      "totalAmount": 281660,
      "paidAmount": 100000,
      "pendingAmount": 181660,
      "averageBillAmount": 281660
    }
  ]
}
```

---

## 📄 **STEP 3: INVOICE MANAGEMENT**

### **3.1 Create Invoice**
**POST** `{{BASE_URL}}/invoice`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN}}
```

**Body (raw JSON):**
```json
{
  "companyId": "{{COMPANY_ID}}",
  "customerId": "{{CUSTOMER_ID}}",
  "customerName": "XYZ Corporation",
  "customerContact": {
    "email": "contact@xyz.com",
    "phone": "+91-9876543210",
    "alternatePhone": "+91-9876543211"
  },
  "customerAddress": {
    "street": "123 Business Park",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "invoiceDate": "2024-01-20T10:30:00.000Z",
  "dueDate": "2024-02-20T10:30:00.000Z",
  "referenceNumber": "SO-2024-001",
  "description": "Software license sale",
  "items": [
    {
      "itemId": "{{ITEM_ID}}",
      "itemName": "Software License",
      "hsnCode": "9983",
      "sku": "SW-001",
      "description": "Annual Software License",
      "quantity": 3,
      "unitPrice": 50000,
      "discount": 5000,
      "taxRate": 18,
      "lineTotal": 135000
    }
  ],
  "totals": {
    "subtotal": 135000,
    "totalDiscount": 5000,
    "sgst": 11700,
    "cgst": 11700,
    "igst": 0,
    "totalTax": 23400,
    "shippingCharges": 0,
    "otherCharges": 0,
    "grandTotal": 158400
  },
  "paymentTerms": {
    "dueDate": "2024-02-20T10:30:00.000Z",
    "paymentMethod": "bank_transfer",
    "paymentTerms": "Net 30",
    "notes": "Payment within 30 days"
  },
  "status": "draft",
  "deliveryDate": "2024-01-25T10:30:00.000Z",
  "deliveryAddress": {
    "street": "123 Business Park",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "deliveryNotes": "Deliver to reception",
  "notes": "Urgent delivery required",
  "termsAndConditions": "Standard terms and conditions apply"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
    "invoiceNumber": "INV-00001",
    "companyId": "{{COMPANY_ID}}",
    "customerId": "{{CUSTOMER_ID}}",
    "customerName": "XYZ Corporation",
    "invoiceDate": "2024-01-20T10:30:00.000Z",
    "dueDate": "2024-02-20T10:30:00.000Z",
    "status": "draft",
    "paymentStatus": "unpaid",
    "receivedAmount": 0,
    "remainingAmount": 158400,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### **3.2 Get All Invoices**
**GET** `{{BASE_URL}}/invoice?companyId={{COMPANY_ID}}&page=1&limit=10`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Invoices fetched successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
      "invoiceNumber": "INV-00001",
      "customerName": "XYZ Corporation",
      "invoiceDate": "2024-01-20T10:30:00.000Z",
      "dueDate": "2024-02-20T10:30:00.000Z",
      "status": "draft",
      "paymentStatus": "unpaid",
      "totals": {
        "grandTotal": 158400
      },
      "customerId": {
        "_id": "{{CUSTOMER_ID}}",
        "name": "XYZ Corporation",
        "contactPerson": "Jane Smith"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 1,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### **3.3 Update Invoice Status**
**PATCH** `{{BASE_URL}}/invoice/64f8a1b2c3d4e5f6a7b8c9d7/status`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN}}
```

**Body (raw JSON):**
```json
{
  "status": "sent"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Invoice status updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
    "status": "sent",
    "sentBy": "{{USER_ID}}",
    "sentAt": "2024-01-20T12:00:00.000Z"
  }
}
```

### **3.4 Record Payment**
**PATCH** `{{BASE_URL}}/invoice/64f8a1b2c3d4e5f6a7b8c9d7/payment`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN}}
```

**Body (raw JSON):**
```json
{
  "paymentAmount": 158400
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
    "receivedAmount": 158400,
    "remainingAmount": 0,
    "paymentStatus": "paid"
  }
}
```

### **3.5 Get Revenue Summary**
**GET** `{{BASE_URL}}/invoice/summary/revenue?companyId={{COMPANY_ID}}&startDate=2024-01-01&endDate=2024-12-31`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Revenue summary fetched successfully",
  "data": [
    {
      "_id": null,
      "totalInvoices": 1,
      "totalAmount": 158400,
      "receivedAmount": 158400,
      "pendingAmount": 0,
      "averageInvoiceAmount": 158400
    }
  ]
}
```

---

## 📦 **STEP 4: STOCK MANAGEMENT**

### **4.1 Add Stock**
**POST** `{{BASE_URL}}/stock/add`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN}}
```

**Body (raw JSON):**
```json
{
  "companyId": "{{COMPANY_ID}}",
  "itemId": "{{ITEM_ID}}",
  "quantity": 10
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Stock added successfully",
  "data": {
    "_id": "{{ITEM_ID}}",
    "name": "Dell Laptop",
    "availableStock": 15,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### **4.2 Remove Stock**
**POST** `{{BASE_URL}}/stock/remove`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN}}
```

**Body (raw JSON):**
```json
{
  "companyId": "{{COMPANY_ID}}",
  "itemId": "{{ITEM_ID}}",
  "quantity": 3
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Stock removed successfully",
  "data": {
    "_id": "{{ITEM_ID}}",
    "name": "Dell Laptop",
    "availableStock": 12,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### **4.3 Get Low Stock Items**
**GET** `{{BASE_URL}}/stock/low-stock?companyId={{COMPANY_ID}}`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Low stock items fetched successfully",
  "data": [
    {
      "_id": "{{ITEM_ID}}",
      "name": "Dell Laptop",
      "sku": "LAP-DELL-001",
      "availableStock": 2,
      "reorderLevel": 5,
      "category": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
        "name": "Electronics"
      }
    }
  ]
}
```

### **4.4 Get Stock Summary**
**GET** `{{BASE_URL}}/stock/summary?companyId={{COMPANY_ID}}`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Stock summary fetched successfully",
  "data": [
    {
      "_id": null,
      "totalItems": 1,
      "totalStockValue": 540000,
      "lowStockItems": 1
    }
  ]
}
```

---

## 📊 **STEP 5: ANALYTICS & REPORTING**

### **5.1 Get Top Customers by Revenue**
**GET** `{{BASE_URL}}/invoice/analytics/top-customers?companyId={{COMPANY_ID}}&limit=10`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Top customers fetched successfully",
  "data": [
    {
      "_id": "{{CUSTOMER_ID}}",
      "customerName": "XYZ Corporation",
      "totalRevenue": 158400,
      "invoiceCount": 1,
      "averageInvoiceValue": 158400
    }
  ]
}
```

### **5.2 Get Monthly Revenue Trend**
**GET** `{{BASE_URL}}/invoice/analytics/revenue-trend?companyId={{COMPANY_ID}}&months=12`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Monthly revenue trend fetched successfully",
  "data": [
    {
      "_id": {
        "year": 2024,
        "month": 1
      },
      "totalRevenue": 158400,
      "invoiceCount": 1
    }
  ]
}
```

---

## 🔍 **STEP 6: SEARCH & FILTERING**

### **6.1 Search Bills**
**GET** `{{BASE_URL}}/bill?companyId={{COMPANY_ID}}&search=laptop&page=1&limit=10`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bills fetched successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
      "billNumber": "BIL-00001",
      "vendorName": "ABC Suppliers Ltd",
      "billDate": "2024-01-15T10:30:00.000Z",
      "status": "approved",
      "totals": {
        "grandTotal": 281660
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 1,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "search": "laptop"
}
```

### **6.2 Filter Bills by Date Range**
**GET** `{{BASE_URL}}/bill?companyId={{COMPANY_ID}}&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=10`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bills fetched successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
      "billNumber": "BIL-00001",
      "vendorName": "ABC Suppliers Ltd",
      "billDate": "2024-01-15T10:30:00.000Z",
      "status": "approved",
      "totals": {
        "grandTotal": 281660
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 1,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

## 🚨 **ERROR TESTING**

### **7.1 Test Invalid Token**
**GET** `{{BASE_URL}}/bill?companyId={{COMPANY_ID}}`

**Headers:**
```
Authorization: Bearer invalid_token
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid token"
}
```

### **7.2 Test Missing Company ID**
**GET** `{{BASE_URL}}/bill`

**Headers:**
```
Authorization: Bearer {{TOKEN}}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "companyId",
      "message": "Company ID is required"
    }
  ]
}
```

### **7.3 Test Insufficient Stock**
**POST** `{{BASE_URL}}/stock/remove`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN}}
```

**Body (raw JSON):**
```json
{
  "companyId": "{{COMPANY_ID}}",
  "itemId": "{{ITEM_ID}}",
  "quantity": 1000
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Insufficient stock. Available: 12, Required: 1000",
  "error": "Stock validation failed"
}
```

---

## 📝 **POSTMAN COLLECTION EXPORT**

### **Collection Structure:**
```
INF Accounting API
├── 🔐 Authentication
│   ├── Register User
│   └── Login User
├── 📋 Bills
│   ├── Create Bill
│   ├── Get All Bills
│   ├── Get Bill by ID
│   ├── Update Bill
│   ├── Delete Bill
│   ├── Update Bill Status
│   ├── Record Payment
│   ├── Get Bills by Status
│   ├── Get Overdue Bills
│   ├── Get Bills by Vendor
│   ├── Get Bill Summary
│   └── Get Bills by Date Range
├── 📄 Invoices
│   ├── Create Invoice
│   ├── Get All Invoices
│   ├── Get Invoice by ID
│   ├── Update Invoice
│   ├── Delete Invoice
│   ├── Update Invoice Status
│   ├── Record Payment
│   ├── Get Invoices by Status
│   ├── Get Overdue Invoices
│   ├── Get Invoices by Customer
│   ├── Get Revenue Summary
│   ├── Get Invoices by Date Range
│   ├── Get Top Customers
│   └── Get Monthly Revenue Trend
├── 📦 Stock
│   ├── Add Stock
│   ├── Remove Stock
│   ├── Get Low Stock Items
│   └── Get Stock Summary
└── 🔍 Search & Filter
    ├── Search Bills
    ├── Filter Bills by Date
    ├── Search Invoices
    └── Filter Invoices by Date
```

---

## 🚀 **QUICK TESTING CHECKLIST**

### **✅ Authentication Tests:**
- [ ] Register new user
- [ ] Login with credentials
- [ ] Test invalid credentials
- [ ] Test expired token

### **✅ Bill Management Tests:**
- [ ] Create bill with multiple items
- [ ] Get all bills with pagination
- [ ] Get bill by ID
- [ ] Update bill status
- [ ] Record payment
- [ ] Search bills
- [ ] Filter bills by date range

### **✅ Invoice Management Tests:**
- [ ] Create invoice with customer details
- [ ] Get all invoices with pagination
- [ ] Update invoice status
- [ ] Record full payment
- [ ] Get revenue summary
- [ ] Get top customers

### **✅ Stock Management Tests:**
- [ ] Add stock manually
- [ ] Remove stock manually
- [ ] Test insufficient stock error
- [ ] Get low stock items
- [ ] Get stock summary

### **✅ Error Handling Tests:**
- [ ] Test invalid token
- [ ] Test missing required fields
- [ ] Test validation errors
- [ ] Test insufficient stock

---

## 📋 **DUMMY DATA SETS**

### **Sample Companies:**
```json
{
  "companyId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "companyName": "INF Accounting Solutions",
  "gstNo": "27ABCDE1234F1Z5",
  "panNo": "ABCDE1234F"
}
```

### **Sample Vendors:**
```json
{
  "vendorId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "name": "ABC Suppliers Ltd",
  "contactPerson": "John Doe",
  "email": "john@abcsuppliers.com",
  "phone": "+91-9876543210"
}
```

### **Sample Customers:**
```json
{
  "customerId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "name": "XYZ Corporation",
  "contactPerson": "Jane Smith",
  "email": "jane@xyz.com",
  "phone": "+91-9876543211"
}
```

### **Sample Items:**
```json
{
  "itemId": "64f8a1b2c3d4e5f6a7b8c9d4",
  "name": "Dell Laptop",
  "sku": "LAP-DELL-001",
  "hsnCode": "8471",
  "category": "Electronics",
  "availableStock": 12,
  "reorderLevel": 5
}
```

---

## 🎯 **TESTING SCENARIOS**

### **Scenario 1: Complete Bill Workflow**
1. Create bill with multiple items
2. Update bill status to approved
3. Record partial payment
4. Record remaining payment
5. Verify stock increased

### **Scenario 2: Complete Invoice Workflow**
1. Create invoice with customer details
2. Update invoice status to sent
3. Record full payment
4. Verify stock decreased

### **Scenario 3: Stock Management**
1. Add stock manually
2. Create bill (should increase stock)
3. Create invoice (should decrease stock)
4. Check low stock items
5. Get stock summary

### **Scenario 4: Error Handling**
1. Test with invalid token
2. Test with missing fields
3. Test with insufficient stock
4. Test with invalid IDs

This comprehensive guide provides step-by-step testing instructions with real dummy data for your frontend developer to test all API endpoints!
