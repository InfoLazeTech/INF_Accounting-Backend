# Frontend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📋 **BILL MANAGEMENT API**

### **1. Create Bill**
**POST** `/bill`

**Request Body:**
```json
{
  "companyId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "vendorId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "vendorName": "ABC Suppliers",
  "billDate": "2024-01-15T10:30:00.000Z",
  "dueDate": "2024-02-15T10:30:00.000Z",
  "referenceNumber": "PO-001",
  "description": "Office supplies purchase",
  "items": [
    {
      "itemId": "64f8a1b2c3d4e5f6a7b8c9d3",
      "itemName": "Laptop Computer",
      "hsnCode": "8471",
      "sku": "LAP-001",
      "description": "Dell Laptop",
      "quantity": 5,
      "unitPrice": 50000,
      "discount": 0,
      "taxRate": 18,
      "lineTotal": 250000
    }
  ],
  "totals": {
    "subtotal": 250000,
    "totalDiscount": 0,
    "sgst": 22500,
    "cgst": 22500,
    "igst": 0,
    "totalTax": 45000,
    "shippingCharges": 0,
    "otherCharges": 0,
    "grandTotal": 295000
  },
  "paymentTerms": {
    "dueDate": "2024-02-15T10:30:00.000Z",
    "paymentMethod": "bank_transfer",
    "paymentTerms": "Net 30",
  },
  "customerNotes": "Urgent delivery required"
  "terms&conditions":"abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bill created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "billNumber": "BIL-00001",
    "companyId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "vendorId": "64f8a1b2c3d4e5f6a7b8c9d2",
    "vendorName": "ABC Suppliers",
    "billDate": "2024-01-15T10:30:00.000Z",
    "dueDate": "2024-02-15T10:30:00.000Z",
    "status": "draft",
    "paymentStatus": "unpaid",
    "paidAmount": 0,
    "remainingAmount": 295000,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### **2. Get All Bills**
**GET** `/bill?companyId=64f8a1b2c3d4e5f6a7b8c9d1&page=1&limit=10&search=laptop&status=draft&vendorId=64f8a1b2c3d4e5f6a7b8c9d2&startDate=2024-01-01&endDate=2024-12-31`

**Query Parameters:**
- `companyId` (required): Company ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term for bill number, vendor name, reference, description
- `status` (optional): Filter by status (draft, pending, approved, paid, cancelled, overdue)
- `vendorId` (optional): Filter by vendor
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:**
```json
{
  "success": true,
  "message": "Bills fetched successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "billNumber": "BIL-00001",
      "vendorName": "ABC Suppliers",
      "billDate": "2024-01-15T10:30:00.000Z",
      "dueDate": "2024-02-15T10:30:00.000Z",
      "status": "draft",
      "paymentStatus": "unpaid",
      "totals": {
        "grandTotal": 295000
      },
      "vendorId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "ABC Suppliers",
        "contactPerson": "John Doe"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "search": "laptop"
}
```

### **3. Get Bill by ID**
**GET** `/bill/64f8a1b2c3d4e5f6a7b8c9d4?companyId=64f8a1b2c3d4e5f6a7b8c9d1`

**Response:**
```json
{
  "success": true,
  "message": "Bill fetched successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "billNumber": "BIL-00001",
    "companyId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "vendorId": "64f8a1b2c3d4e5f6a7b8c9d2",
    "vendorName": "ABC Suppliers",
    "billDate": "2024-01-15T10:30:00.000Z",
    "dueDate": "2024-02-15T10:30:00.000Z",
    "referenceNumber": "PO-001",
    "description": "Office supplies purchase",
    "items": [
      {
        "itemId": "64f8a1b2c3d4e5f6a7b8c9d3",
        "itemName": "Laptop Computer",
        "hsnCode": "8471",
        "sku": "LAP-001",
        "quantity": 5,
        "unitPrice": 50000,
        "discount": 0,
        "taxRate": 18,
        "lineTotal": 250000
      }
    ],
    "totals": {
      "subtotal": 250000,
      "totalDiscount": 0,
      "sgst": 22500,
      "cgst": 22500,
      "igst": 0,
      "totalTax": 45000,
      "shippingCharges": 0,
      "otherCharges": 0,
      "grandTotal": 295000
    },
    "paymentTerms": {
      "dueDate": "2024-02-15T10:30:00.000Z",
      "paymentMethod": "bank_transfer",
      "paymentTerms": "Net 30"
    },
    "status": "draft",
    "paymentStatus": "unpaid",
    "paidAmount": 0,
    "remainingAmount": 295000,
    "notes": "Urgent delivery required",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### **4. Update Bill**
**PUT** `/bill/64f8a1b2c3d4e5f6a7b8c9d4`

**Request Body:** (Same structure as create, but only include fields to update)

**Response:**
```json
{
  "success": true,
  "message": "Bill updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "billNumber": "BIL-00001",
    "status": "pending",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

### **5. Delete Bill**
**DELETE** `/bill/64f8a1b2c3d4e5f6a7b8c9d4`

**Response:**
```json
{
  "success": true,
  "message": "Bill deleted successfully",
  "data": null
}
```

### **6. Get Bills by Status**
**GET** `/bill/status/list?companyId=64f8a1b2c3d4e5f6a7b8c9d1&status=draft`

**Response:**
```json
{
  "success": true,
  "message": "Bills fetched successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "billNumber": "BIL-00001",
      "vendorName": "ABC Suppliers",
      "status": "draft",
      "totals": {
        "grandTotal": 295000
      }
    }
  ]
}
```

### **7. Get Overdue Bills**
**GET** `/bill/overdue/list?companyId=64f8a1b2c3d4e5f6a7b8c9d1`

**Response:**
```json
{
  "success": true,
  "message": "Overdue bills fetched successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "billNumber": "BIL-00001",
      "vendorName": "ABC Suppliers",
      "dueDate": "2024-01-10T10:30:00.000Z",
      "daysOverdue": 5,
      "remainingAmount": 295000
    }
  ]
}
```

### **8. Get Bills by Vendor**
**GET** `/bill/vendor/list?companyId=64f8a1b2c3d4e5f6a7b8c9d1&vendorId=64f8a1b2c3d4e5f6a7b8c9d2`

**Response:**
```json
{
  "success": true,
  "message": "Bills fetched successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "billNumber": "BIL-00001",
      "vendorName": "ABC Suppliers",
      "billDate": "2024-01-15T10:30:00.000Z",
      "totals": {
        "grandTotal": 295000
      }
    }
  ]
}
```

### **9. Update Bill Status**
**PATCH** `/bill/64f8a1b2c3d4e5f6a7b8c9d4/status`

**Request Body:**
```json
{
  "status": "approved"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bill status updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "status": "approved",
    "approvedBy": "64f8a1b2c3d4e5f6a7b8c9d5",
    "approvedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### **10. Record Payment**
**PATCH** `/bill/64f8a1b2c3d4e5f6a7b8c9d4/payment`

**Request Body:**
```json
{
  "paymentAmount": 100000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "paidAmount": 100000,
    "remainingAmount": 195000,
    "paymentStatus": "partial"
  }
}
```

### **11. Get Bill Summary**
**GET** `/bill/summary/stats?companyId=64f8a1b2c3d4e5f6a7b8c9d1&startDate=2024-01-01&endDate=2024-12-31`

**Response:**
```json
{
  "success": true,
  "message": "Bill summary fetched successfully",
  "data": [
    {
      "_id": null,
      "totalBills": 25,
      "totalAmount": 1500000,
      "paidAmount": 800000,
      "pendingAmount": 700000,
      "averageBillAmount": 60000
    }
  ]
}
```

### **12. Get Bills by Date Range**
**GET** `/bill/date-range/list?companyId=64f8a1b2c3d4e5f6a7b8c9d1&startDate=2024-01-01&endDate=2024-01-31`

**Response:**
```json
{
  "success": true,
  "message": "Bills fetched successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "billNumber": "BIL-00001",
      "vendorName": "ABC Suppliers",
      "billDate": "2024-01-15T10:30:00.000Z",
      "totals": {
        "grandTotal": 295000
      }
    }
  ]
}
```

---

## 📄 **INVOICE MANAGEMENT API**

### **1. Create Invoice**
**POST** `/invoice`

**Request Body:**
```json
{
  "companyId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "customerId": "64f8a1b2c3d4e5f6a7b8c9d2",
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
  "invoiceDate": "2024-01-15T10:30:00.000Z",
  "dueDate": "2024-02-15T10:30:00.000Z",
  "referenceNumber": "SO-001",
  "description": "Software license sale",
  "items": [
    {
      "itemId": "64f8a1b2c3d4e5f6a7b8c9d3",
      "itemName": "Software License",
      "hsnCode": "9983",
      "sku": "SW-001",
      "description": "Annual Software License",
      "quantity": 10,
      "unitPrice": 50000,
      "discount": 0,
      "taxRate": 18,
      "lineTotal": 500000
    }
  ],
  "totals": {
    "subtotal": 500000,
    "totalDiscount": 0,
    "sgst": 45000,
    "cgst": 45000,
    "igst": 0,
    "totalTax": 90000,
    "shippingCharges": 0,
    "otherCharges": 0,
    "grandTotal": 590000
  },
  "paymentTerms": {
    "dueDate": "2024-02-15T10:30:00.000Z",
    "paymentMethod": "bank_transfer",
    "paymentTerms": "Net 30",
    "notes": "Payment within 30 days"
  },
  "status": "draft",
  "deliveryDate": "2024-01-20T10:30:00.000Z",
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

**Response:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "invoiceNumber": "INV-00001",
    "companyId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "customerId": "64f8a1b2c3d4e5f6a7b8c9d2",
    "customerName": "XYZ Corporation",
    "invoiceDate": "2024-01-15T10:30:00.000Z",
    "dueDate": "2024-02-15T10:30:00.000Z",
    "status": "draft",
    "paymentStatus": "unpaid",
    "receivedAmount": 0,
    "remainingAmount": 590000,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### **2. Get All Invoices**
**GET** `/invoice?companyId=64f8a1b2c3d4e5f6a7b8c9d1&page=1&limit=10&search=software&status=draft&customerId=64f8a1b2c3d4e5f6a7b8c9d2&startDate=2024-01-01&endDate=2024-12-31`

**Query Parameters:**
- `companyId` (required): Company ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term for invoice number, customer name, reference, description
- `status` (optional): Filter by status (draft, sent, viewed, paid, overdue, cancelled, refunded)
- `customerId` (optional): Filter by customer
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:** (Similar structure to bills)

### **3. Get Invoice by ID**
**GET** `/invoice/64f8a1b2c3d4e5f6a7b8c9d4?companyId=64f8a1b2c3d4e5f6a7b8c9d1`

**Response:** (Similar structure to bill by ID)

### **4. Update Invoice**
**PUT** `/invoice/64f8a1b2c3d4e5f6a7b8c9d4`

**Request Body:** (Same structure as create, but only include fields to update)

### **5. Delete Invoice**
**DELETE** `/invoice/64f8a1b2c3d4e5f6a7b8c9d4`

### **6. Get Invoices by Status**
**GET** `/invoice/status/list?companyId=64f8a1b2c3d4e5f6a7b8c9d1&status=draft`

### **7. Get Overdue Invoices**
**GET** `/invoice/overdue/list?companyId=64f8a1b2c3d4e5f6a7b8c9d1`

### **8. Get Invoices by Customer**
**GET** `/invoice/customer/list?companyId=64f8a1b2c3d4e5f6a7b8c9d1&customerId=64f8a1b2c3d4e5f6a7b8c9d2`

### **9. Update Invoice Status**
**PATCH** `/invoice/64f8a1b2c3d4e5f6a7b8c9d4/status`

**Request Body:**
```json
{
  "status": "sent"
}
```

### **10. Record Payment**
**PATCH** `/invoice/64f8a1b2c3d4e5f6a7b8c9d4/payment`

**Request Body:**
```json
{
  "paymentAmount": 200000
}
```

### **11. Get Revenue Summary**
**GET** `/invoice/summary/revenue?companyId=64f8a1b2c3d4e5f6a7b8c9d1&startDate=2024-01-01&endDate=2024-12-31`

**Response:**
```json
{
  "success": true,
  "message": "Revenue summary fetched successfully",
  "data": [
    {
      "_id": null,
      "totalInvoices": 30,
      "totalAmount": 2000000,
      "receivedAmount": 1500000,
      "pendingAmount": 500000,
      "averageInvoiceAmount": 66666.67
    }
  ]
}
```

### **12. Get Invoices by Date Range**
**GET** `/invoice/date-range/list?companyId=64f8a1b2c3d4e5f6a7b8c9d1&startDate=2024-01-01&endDate=2024-01-31`

### **13. Get Top Customers by Revenue**
**GET** `/invoice/analytics/top-customers?companyId=64f8a1b2c3d4e5f6a7b8c9d1&limit=10`

**Response:**
```json
{
  "success": true,
  "message": "Top customers fetched successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "customerName": "XYZ Corporation",
      "totalRevenue": 500000,
      "invoiceCount": 5,
      "averageInvoiceValue": 100000
    }
  ]
}
```

### **14. Get Monthly Revenue Trend**
**GET** `/invoice/analytics/revenue-trend?companyId=64f8a1b2c3d4e5f6a7b8c9d1&months=12`

**Response:**
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
      "totalRevenue": 500000,
      "invoiceCount": 10
    }
  ]
}
```

---

## 📦 **STOCK MANAGEMENT API**

### **1. Add Stock**
**POST** `/stock/add`

**Request Body:**
```json
{
  "companyId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "itemId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "quantity": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock added successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "name": "Laptop Computer",
    "availableStock": 15,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### **2. Remove Stock**
**POST** `/stock/remove`

**Request Body:**
```json
{
  "companyId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "itemId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock removed successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "name": "Laptop Computer",
    "availableStock": 10,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### **3. Get Low Stock Items**
**GET** `/stock/low-stock?companyId=64f8a1b2c3d4e5f6a7b8c9d1`

**Response:**
```json
{
  "success": true,
  "message": "Low stock items fetched successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "name": "Laptop Computer",
      "sku": "LAP-001",
      "availableStock": 2,
      "reorderLevel": 5,
      "category": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
        "name": "Electronics"
      }
    }
  ]
}
```

### **4. Get Stock Summary**
**GET** `/stock/summary?companyId=64f8a1b2c3d4e5f6a7b8c9d1`

**Response:**
```json
{
  "success": true,
  "message": "Stock summary fetched successfully",
  "data": [
    {
      "_id": null,
      "totalItems": 50,
      "totalStockValue": 2500000,
      "lowStockItems": 5
    }
  ]
}
```

---

## 🔧 **COMMON RESPONSE FORMATS**

### **Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": { ... } // Only for paginated responses
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### **Validation Error Response:**
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

---

## 📊 **BILL STATUS ENUMS**

### **Bill Status:**
- `draft` - Initial draft state
- `pending` - Submitted for approval
- `approved` - Approved by manager
- `paid` - Payment completed
- `cancelled` - Bill cancelled
- `overdue` - Past due date

### **Payment Status:**
- `unpaid` - No payment received
- `partial` - Partial payment received
- `paid` - Full payment received

---

## 📄 **INVOICE STATUS ENUMS**

### **Invoice Status:**
- `draft` - Initial draft state
- `sent` - Sent to customer
- `viewed` - Customer viewed
- `paid` - Payment completed
- `overdue` - Past due date
- `cancelled` - Invoice cancelled
- `refunded` - Payment refunded

### **Payment Status:**
- `unpaid` - No payment received
- `partial` - Partial payment received
- `paid` - Full payment received

---

## 🚨 **ERROR CODES**

### **Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized (Invalid Token)
- `403` - Forbidden (Insufficient Permissions)
- `404` - Not Found
- `500` - Internal Server Error

### **Common Error Messages:**
- `"Company ID is required"`
- `"Item not found for this company"`
- `"Insufficient stock. Available: X, Required: Y"`
- `"Bill not found"`
- `"Invoice not found"`
- `"Not enough stock available"`

---

## 🔐 **AUTHENTICATION**

### **Login Endpoint:**
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Register Endpoint:**
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+91-9876543210",
  "companyName": "My Company",
  "gstNo": "27ABCDE1234F1Z5",
  "panNo": "ABCDE1234F"
}
```

---

## 📝 **NOTES FOR FRONTEND DEVELOPER**

1. **Authentication**: All endpoints require JWT token in Authorization header
2. **Pagination**: Use `page` and `limit` parameters for paginated responses
3. **Search**: Use `search` parameter for text-based filtering
4. **Date Filters**: Use `startDate` and `endDate` for date range filtering
5. **Stock Updates**: Bill creation increases stock, invoice creation decreases stock
6. **Status Management**: Use appropriate status enums for bill/invoice status
7. **Error Handling**: Always check `success` field in response
8. **Validation**: Client-side validation should match server-side validation rules
9. **File Uploads**: Attachments are handled separately (not included in this API)
10. **Real-time Updates**: Consider implementing WebSocket for real-time stock updates

---

## 🚀 **QUICK START**

1. **Login** to get JWT token
2. **Create Company** (if not exists)
3. **Create Items** for inventory
4. **Create Bills** for purchases (increases stock)
5. **Create Invoices** for sales (decreases stock)
6. **Monitor Stock** using stock endpoints
7. **Track Payments** using payment endpoints
8. **Generate Reports** using summary endpoints

This API provides complete bill and invoice management with automatic stock tracking!
