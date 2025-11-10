# Bank Management & Financial Tracking - Implementation Plan

## Overview
This document outlines the architecture and implementation plan for adding bank management, automatic balance tracking, expense management, and bank-to-bank transfers to the accounting system.

---

## 1. BANK MANAGEMENT

### 1.1 Bank Model (`models/bank.model.js`)
Each company can have multiple bank accounts.

**Fields:**
- `bankId` (String, auto-generated): BNK-00001
- `companyId` (ObjectId, ref: Company): Required
- `bankName` (String): e.g., "HDFC Bank", "State Bank of India"
- `accountName` (String): Account holder name
- `accountNumber` (String): Bank account number
- `ifscCode` (String): IFSC code
- `branchName` (String): Branch name
- `accountType` (Enum): ["savings", "current", "fixed_deposit", "recurring_deposit"]
- `openingBalance` (Number): Opening balance when bank is added
- `currentBalance` (Number): Current balance (auto-updated)
- `currency` (String): Default "INR"
- `isActive` (Boolean): Default true
- `notes` (String): Additional notes
- `createdBy`, `updatedBy` (ObjectId, ref: User)
- `isDeleted` (Boolean): Soft delete
- `timestamps`: createdAt, updatedAt

**Indexes:**
- `{ companyId: 1, bankId: 1 }` (unique)
- `{ companyId: 1, isActive: 1 }`

---

## 2. BANK TRANSACTION MODEL (`models/bankTransaction.model.js`)

Every payment/expense/transfer creates a bank transaction record for audit trail.

**Fields:**
- `transactionId` (String): BNT-00001
- `companyId` (ObjectId, ref: Company)
- `bankId` (ObjectId, ref: Bank): Which bank account
- `transactionType` (Enum): 
  - "payment_received" (from customer)
  - "payment_made" (to vendor)
  - "expense" (general expense)
  - "bank_transfer" (bank-to-bank)
  - "deposit" (manual deposit)
  - "withdrawal" (manual withdrawal)
  - "adjustment" (balance correction)
- `transactionDate` (Date): Transaction date
- `amount` (Number): Transaction amount
- `balanceAfter` (Number): Bank balance after this transaction
- `referenceType` (String): "Payment", "Invoice", "Bill", "Expense", "BankTransfer", null
- `referenceId` (ObjectId): ID of related document
- `referenceNumber` (String): e.g., Payment ID, Invoice Number
- `description` (String): Transaction description
- `notes` (String): Additional notes
- `status` (Enum): ["pending", "completed", "failed", "cancelled"]
- `createdBy`, `updatedBy` (ObjectId, ref: User)
- `isDeleted` (Boolean)
- `timestamps`

**Indexes:**
- `{ companyId: 1, bankId: 1, transactionDate: -1 }`
- `{ companyId: 1, transactionType: 1 }`
- `{ companyId: 1, referenceType: 1, referenceId: 1 }`

---

## 3. EXPENSE MANAGEMENT

### 3.1 Expense Model (`models/expense.model.js`)

**Fields:**
- `expenseId` (String): EXP-00001
- `companyId` (ObjectId, ref: Company)
- `expenseCategory` (String): e.g., "Office Supplies", "Travel", "Utilities", "Salaries"
- `expenseDate` (Date): Expense date
- `amount` (Number): Expense amount
- `paymentMode` (Enum): ["cash", "bank", "other"]
- `bankId` (ObjectId, ref: Bank): If paid via bank
- `vendorId` (ObjectId, ref: CustomerVendor): Optional, if expense is to a vendor
- `description` (String): What was the expense for
- `receiptNumber` (String): Receipt/invoice number from vendor
- `attachments` (Array): Receipt images/files
- `status` (Enum): ["pending", "approved", "rejected", "paid"]
- `approvedBy` (ObjectId, ref: User)
- `approvedAt` (Date)
- `createdBy`, `updatedBy` (ObjectId, ref: User)
- `isDeleted` (Boolean)
- `timestamps`

**Indexes:**
- `{ companyId: 1, expenseId: 1 }` (unique)
- `{ companyId: 1, expenseDate: -1 }`
- `{ companyId: 1, expenseCategory: 1 }`
- `{ companyId: 1, bankId: 1 }`

---

## 4. BANK-TO-BANK TRANSFERS

### 4.1 Bank Transfer Model (`models/bankTransfer.model.js`)

**Fields:**
- `transferId` (String): BTR-00001
- `companyId` (ObjectId, ref: Company)
- `fromBankId` (ObjectId, ref: Bank): Source bank
- `toBankId` (ObjectId, ref: Bank): Destination bank
- `transferDate` (Date): Transfer date
- `amount` (Number): Transfer amount
- `charges` (Number): Transfer charges (if any)
- `netAmount` (Number): Amount after charges
- `referenceNumber` (String): Transaction reference number
- `description` (String): Transfer description/purpose
- `status` (Enum): ["pending", "completed", "failed", "cancelled"]
- `createdBy`, `updatedBy` (ObjectId, ref: User)
- `isDeleted` (Boolean)
- `timestamps`

**Indexes:**
- `{ companyId: 1, transferId: 1 }` (unique)
- `{ companyId: 1, fromBankId: 1, transferDate: -1 }`
- `{ companyId: 1, toBankId: 1, transferDate: -1 }`

---

## 5. AUTOMATIC BANK BALANCE MANAGEMENT

### 5.1 Payment Service Updates

**When Payment Received (from customer):**
1. Create payment record
2. If `paymentMode === "bank"`:
   - Find bank by `bankId` (from payment data)
   - Update bank balance: `currentBalance += netAmount`
   - Create bank transaction record:
     - `transactionType: "payment_received"`
     - `balanceAfter: newBankBalance`
     - `referenceType: "Payment"`
     - `referenceId: payment._id`

**When Payment Made (to vendor):**
1. Create payment record
2. If `paymentMode === "bank"`:
   - Find bank by `bankId`
   - Check if sufficient balance: `currentBalance >= netAmount`
   - Update bank balance: `currentBalance -= netAmount`
   - Create bank transaction record:
     - `transactionType: "payment_made"`
     - `balanceAfter: newBankBalance`

### 5.2 Expense Service Integration

**When Expense is Created/Approved:**
1. If `paymentMode === "bank"`:
   - Find bank by `bankId`
   - Check sufficient balance
   - Update bank balance: `currentBalance -= amount`
   - Create bank transaction record:
     - `transactionType: "expense"`
     - `referenceType: "Expense"`
     - `referenceId: expense._id`

### 5.3 Bank Transfer Service

**When Transfer is Created:**
1. Validate both banks exist and belong to same company
2. Check sufficient balance in `fromBankId`
3. Update `fromBankId` balance: `currentBalance -= netAmount`
4. Update `toBankId` balance: `currentBalance += amount` (charges not added to destination)
5. Create TWO bank transaction records:
   - **From Bank:**
     - `transactionType: "bank_transfer"`
     - `amount: -netAmount` (negative)
     - `balanceAfter: newFromBankBalance`
   - **To Bank:**
     - `transactionType: "bank_transfer"`
     - `amount: +amount` (positive)
     - `balanceAfter: newToBankBalance`
   - Both reference same `transferId`

---

## 6. IMPLEMENTATION STRUCTURE

### 6.1 New Files to Create

```
models/
  - bank.model.js
  - bankTransaction.model.js
  - expense.model.js
  - bankTransfer.model.js

services/
  - bank.service.js
  - bankTransaction.service.js
  - expense.service.js
  - bankTransfer.service.js

controllers/
  - bank.controller.js
  - bankTransaction.controller.js
  - expense.controller.js
  - bankTransfer.controller.js

routes/
  - bank.route.js
  - bankTransaction.route.js
  - expense.route.js
  - bankTransfer.route.js

validations/
  - bank.validation.js
  - bankTransaction.validation.js
  - expense.validation.js
  - bankTransfer.validation.js
```

### 6.2 Files to Modify

**services/payment.service.js:**
- Update `createPayment()` to handle bank balance updates
- Update `updatePayment()` to handle bank balance reversals/updates
- Update `deletePayment()` to reverse bank balance if deleted

**services/bill.service.js:**
- No changes needed (bills don't directly affect bank balance, payments do)

**services/invoice.service.js:**
- No changes needed (invoices don't directly affect bank balance, payments do)

**services/counter.service.js:**
- Add modules: `BANK`, `BANK_TRANSACTION`, `EXPENSE`, `BANK_TRANSFER`

---

## 7. BUSINESS LOGIC FLOW

### 7.1 Payment Received Flow
```
1. User creates payment (paymentType: "paymentReceived", paymentMode: "bank", bankId: "xxx")
2. Payment service creates payment record
3. IF paymentMode === "bank":
   - Bank service updates balance: currentBalance += netAmount
   - Bank transaction service creates transaction record
4. Return success
```

### 7.2 Payment Made Flow
```
1. User creates payment (paymentType: "paymentMade", paymentMode: "bank", bankId: "xxx")
2. Payment service validates bank balance >= netAmount
3. IF sufficient balance:
   - Bank service updates balance: currentBalance -= netAmount
   - Bank transaction service creates transaction record
4. Return success
```

### 7.3 Expense Flow
```
1. User creates expense (paymentMode: "bank", bankId: "xxx")
2. Expense service creates expense record (status: "pending")
3. User approves expense
4. IF paymentMode === "bank":
   - Bank service validates and updates balance: currentBalance -= amount
   - Bank transaction service creates transaction record
5. Update expense status to "paid"
```

### 7.4 Bank Transfer Flow
```
1. User creates transfer (fromBankId: "xxx", toBankId: "yyy", amount: 10000)
2. Bank transfer service validates:
   - Both banks belong to same company
   - From bank has sufficient balance
3. Update fromBank balance: currentBalance -= (amount + charges)
4. Update toBank balance: currentBalance += amount
5. Create two bank transaction records (one per bank)
6. Create bank transfer record
```

---

## 8. API ENDPOINTS

### 8.1 Bank APIs
- `POST /api/banks` - Create bank
- `GET /api/banks` - Get all banks (with filters)
- `GET /api/banks/:id` - Get bank by ID
- `PUT /api/banks/:id` - Update bank
- `DELETE /api/banks/:id` - Delete bank (soft)
- `GET /api/banks/:id/balance` - Get current balance
- `GET /api/banks/:id/transactions` - Get bank transactions

### 8.2 Expense APIs
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all expenses (with filters)
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `POST /api/expenses/:id/approve` - Approve expense
- `GET /api/expenses/summary` - Get expense summary

### 8.3 Bank Transfer APIs
- `POST /api/bank-transfers` - Create transfer
- `GET /api/bank-transfers` - Get all transfers
- `GET /api/bank-transfers/:id` - Get transfer by ID
- `PUT /api/bank-transfers/:id` - Update transfer
- `DELETE /api/bank-transfers/:id` - Cancel transfer

### 8.4 Bank Transaction APIs (Read-only)
- `GET /api/bank-transactions` - Get all transactions
- `GET /api/bank-transactions/:id` - Get transaction by ID
- `GET /api/bank-transactions/bank/:bankId` - Get transactions for a bank

---

## 9. VALIDATION RULES

### 9.1 Bank Validation
- `bankName`: Required, string
- `accountNumber`: Required, string, unique per company
- `ifscCode`: Required, string, format validation
- `openingBalance`: Number, default 0
- `accountType`: Required, enum

### 9.2 Expense Validation
- `expenseCategory`: Required, string
- `amount`: Required, number, min: 0.01
- `expenseDate`: Required, date
- `paymentMode`: Required, enum
- `bankId`: Required if `paymentMode === "bank"`

### 9.3 Bank Transfer Validation
- `fromBankId`: Required, must exist, must belong to company
- `toBankId`: Required, must exist, must belong to company, must be different from fromBankId
- `amount`: Required, number, min: 0.01
- `fromBankId` must have sufficient balance

---

## 10. ERROR HANDLING

### 10.1 Insufficient Balance
- Return error: "Insufficient balance in bank account"
- Include current balance in response

### 10.2 Invalid Bank
- Return error: "Bank account not found or inactive"

### 10.3 Transaction Failure
- Use MongoDB transactions to ensure atomicity
- If bank balance update fails, rollback payment/expense creation

---

## 11. DATABASE TRANSACTIONS

**Critical Operations (use MongoDB sessions):**
1. Payment creation with bank balance update
2. Expense approval with bank balance update
3. Bank transfer (both banks must update atomically)
4. Payment deletion/update (reverse bank balance)

---

## 12. TESTING CHECKLIST

- [ ] Create bank account
- [ ] Create payment received (bank mode) - balance increases
- [ ] Create payment made (bank mode) - balance decreases
- [ ] Create payment made with insufficient balance - should fail
- [ ] Create expense (bank mode) - balance decreases
- [ ] Create bank transfer - both balances update correctly
- [ ] Delete payment - balance reverses
- [ ] Update payment amount - balance adjusts correctly
- [ ] Get bank transactions - should show all related transactions
- [ ] Get bank balance history

---

## 13. MIGRATION CONSIDERATIONS

### 13.1 Existing Payments
- For existing payments with `paymentMode === "bank"`:
  - Create bank accounts if not exists
  - Create bank transactions retroactively
  - Calculate and set initial bank balances

### 13.2 Default Cash Account
- Consider creating a default "Cash" account for cash transactions
- OR handle cash separately (no bank balance tracking needed)

---

## 14. FUTURE ENHANCEMENTS

1. **Bank Reconciliation:**
   - Match bank transactions with bank statements
   - Mark transactions as reconciled

2. **Multi-Currency Support:**
   - Support multiple currencies per bank
   - Currency conversion rates

3. **Bank Statements Import:**
   - CSV/Excel import
   - Automatic transaction matching

4. **Recurring Expenses:**
   - Schedule recurring expenses
   - Auto-create expense records

5. **Budget Management:**
   - Set budgets per expense category
   - Track against budgets

---

## 15. IMPLEMENTATION PRIORITY

**Phase 1 (Core):**
1. Bank model and CRUD
2. Update payment service for bank balance tracking
3. Bank transaction model and creation

**Phase 2 (Expenses):**
4. Expense model and CRUD
5. Expense approval workflow
6. Expense integration with bank balance

**Phase 3 (Transfers):**
7. Bank transfer model
8. Bank transfer service with dual bank updates

**Phase 4 (Reports & Analytics):**
9. Bank balance reports
10. Transaction history
11. Expense reports by category

---

## 16. EXAMPLE DATA STRUCTURES

### Payment with Bank
```json
{
  "paymentType": "paymentReceived",
  "paymentMode": "bank",
  "bankId": "507f1f77bcf86cd799439011",
  "partyId": "507f191e810c19729de860ea",
  "amount": 10000,
  "charges": 0,
  "paymentDate": "2024-01-15",
  "notes": "Payment for invoice INV-00001"
}
```

### Expense
```json
{
  "expenseCategory": "Office Supplies",
  "expenseDate": "2024-01-15",
  "amount": 5000,
  "paymentMode": "bank",
  "bankId": "507f1f77bcf86cd799439011",
  "description": "Printer paper and stationery",
  "receiptNumber": "RCP-12345"
}
```

### Bank Transfer
```json
{
  "fromBankId": "507f1f77bcf86cd799439011",
  "toBankId": "507f1f77bcf86cd799439012",
  "amount": 25000,
  "charges": 10,
  "transferDate": "2024-01-15",
  "description": "Transfer to operating account"
}
```

---

This plan provides a comprehensive roadmap for implementing bank management, automatic balance tracking, expense management, and bank transfers in your accounting system.

