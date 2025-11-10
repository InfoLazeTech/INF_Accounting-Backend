# Tally-Inspired Accounting System - Bank & Financial Management Plan

## 🎯 Overview
This plan adapts Tally's ledger-based accounting approach to your system. In Tally, everything is organized around **Ledgers** and **Vouchers**. This design brings that familiarity while keeping your existing structure.

---

## 📚 TALLY CONCEPTS MAPPED TO YOUR SYSTEM

### Tally Vouchers → Your System
| Tally Voucher | Your System | Description |
|---------------|-------------|-------------|
| **Sales Voucher** | Invoice | Sales to customers (already exists) |
| **Purchase Voucher** | Bill | Purchases from vendors (already exists) |
| **Receipt Voucher** | Payment (paymentReceived) | Money received (Cash/Bank increases) |
| **Payment Voucher** | Payment (paymentMade) | Money paid out (Cash/Bank decreases) |
| **Contra Voucher** | Bank Transfer | Bank-to-Bank or Cash-to-Bank transfers |
| **Journal Voucher** | Expense Entry | Expense entries (non-inventory expenses) |

### Tally Ledgers → Your System
| Tally Ledger Type | Your System | Example |
|-------------------|-------------|---------|
| **Bank Accounts** | Bank Model | HDFC Bank, SBI Current Account |
| **Cash-in-Hand** | Bank Model (type: cash) | Cash Account |
| **Expenses** | Expense Model | Office Rent, Travel Expenses |
| **Sundry Debtors** | CustomerVendor (isCustomer: true) | Customer ledgers |
| **Sundry Creditors** | CustomerVendor (isVendor: true) | Vendor ledgers |

---

## 🏦 1. BANK LEDGERS (Bank Accounts)

### 1.1 Bank Model (`models/bank.model.js`)
Think of this as creating **Bank Ledgers** in Tally.

**Fields:**
- `bankId` (String): BNK-00001 (like Tally's ledger name)
- `companyId` (ObjectId): Company reference
- `ledgerName` (String): Display name (e.g., "HDFC Bank - Current")
- `bankName` (String): Bank institution name
- `accountName` (String): Account holder name
- `accountNumber` (String): Account number
- `ifscCode` (String): IFSC code
- `branchName` (String): Branch name
- `accountType` (Enum): ["savings", "current", "fixed_deposit", "cash", "other"]
  - **Note:** `cash` type for cash account (like Tally's Cash-in-Hand)
- `openingBalance` (Number): Opening balance (as of a specific date)
- `openingBalanceDate` (Date): Date of opening balance
- `currentBalance` (Number): **Auto-calculated** (like Tally's ledger balance)
- `currency` (String): Default "INR"
- `ledgerGroup` (Enum): ["bank_accounts", "cash_in_hand"] (like Tally's groups)
- `isActive` (Boolean): Default true
- `notes` (String): Additional notes
- `createdBy`, `updatedBy` (ObjectId)
- `isDeleted` (Boolean)
- `timestamps`

**Key Features:**
- Like Tally, balance is **always auto-calculated** from transactions
- Opening balance is set once, then system calculates current balance
- Cash account is just a bank with `accountType: "cash"`

---

## 📝 2. VOUCHER ENTRIES (Transaction Records)

### 2.1 Bank Transaction Model (`models/bankTransaction.model.js`)
This is like Tally's **Voucher Entry** - every transaction creates a record.

**Fields:**
- `voucherId` (String): BNT-00001 (like Tally's voucher number)
- `companyId` (ObjectId)
- `voucherType` (Enum): 
  - **"receipt"** - Receipt Voucher (money in)
  - **"payment"** - Payment Voucher (money out)
  - **"contra"** - Contra Voucher (bank transfers)
  - **"expense"** - Expense Entry (Journal)
  - **"adjustment"** - Balance adjustment
- `voucherDate` (Date): Transaction date
- `ledgerId` (ObjectId, ref: Bank): Which bank/cash ledger
- `amount` (Number): Transaction amount
- `type` (Enum): ["debit", "credit"] - Like Tally's debit/credit
  - **Debit** = Money coming in (increases balance)
  - **Credit** = Money going out (decreases balance)
- `balanceAfter` (Number): Balance after this transaction
- `referenceType` (String): "Payment", "Invoice", "Bill", "Expense", "BankTransfer"
- `referenceId` (ObjectId): Related document ID
- `referenceNumber` (String): Related document number (e.g., INV-00001)
- `partyId` (ObjectId, ref: CustomerVendor): Customer/Vendor (if applicable)
- `narration` (String): Description/remarks (like Tally's narration)
- `status` (Enum): ["completed", "pending", "cancelled"]
- `createdBy`, `updatedBy` (ObjectId)
- `isDeleted` (Boolean)
- `timestamps`

**Key Concept:**
- Every financial transaction creates a voucher entry
- Like Tally, vouchers show debit/credit and running balance
- Balance is calculated on-the-fly from all vouchers

---

## 💰 3. EXPENSE MANAGEMENT (Journal/Expense Vouchers)

### 3.1 Expense Model (`models/expense.model.js`)
Think of this as **Journal/Expense Vouchers** in Tally.

**Fields:**
- `expenseId` (String): EXP-00001
- `voucherNumber` (String): Auto-generated (like Tally voucher number)
- `companyId` (ObjectId)
- `expenseDate` (Date): Voucher date
- `expenseCategory` (String): Expense group name
  - Examples: "Office Expenses", "Travel Expenses", "Utilities", "Salaries"
  - Like Tally's expense groups
- `amount` (Number): Expense amount
- `paymentMode` (Enum): ["cash", "bank", "cheque", "other"]
- `ledgerId` (ObjectId, ref: Bank): Which bank/cash account
- `vendorId` (ObjectId, ref: CustomerVendor): Optional (if paid to vendor)
- `description` (String): Narration
- `receiptNumber` (String): Receipt/bill number
- `attachments` (Array): Receipt files
- `status` (Enum): ["pending", "approved", "paid", "cancelled"]
- `approvedBy` (ObjectId)
- `approvedAt` (Date)
- `createdBy`, `updatedBy` (ObjectId)
- `isDeleted` (Boolean)
- `timestamps`

**Tally Mapping:**
- This is like creating a **Journal Voucher** in Tally
- Expense Category = Expense Ledger Group
- Automatically creates bank transaction (voucher entry)

---

## 🔄 4. CONTRA VOUCHERS (Bank Transfers)

### 4.1 Bank Transfer Model (`models/bankTransfer.model.js`)
This is exactly like Tally's **Contra Voucher** - bank-to-bank or cash-to-bank transfers.

**Fields:**
- `transferId` (String): BTR-00001
- `voucherNumber` (String): CTR-00001 (Contra Voucher number)
- `companyId` (ObjectId)
- `transferDate` (Date): Voucher date
- `fromLedgerId` (ObjectId, ref: Bank): Source bank/cash ledger
- `toLedgerId` (ObjectId, ref: Bank): Destination bank/cash ledger
- `amount` (Number): Transfer amount
- `charges` (Number): Transfer charges
- `netAmount` (Number): Amount after charges
- `referenceNumber` (String): Transaction reference
- `narration` (String): Description
- `status` (Enum): ["completed", "pending", "failed", "cancelled"]
- `createdBy`, `updatedBy` (ObjectId)
- `isDeleted` (Boolean)
- `timestamps`

**Tally Mapping:**
- Exactly like **Contra Voucher** in Tally
- Debits one ledger, Credits another
- Creates two voucher entries (one per ledger)

---

## ⚙️ 5. AUTOMATIC BALANCE MANAGEMENT (Like Tally)

### 5.1 Core Principle
**In Tally, ledger balances are ALWAYS calculated from vouchers. We'll do the same.**

**Balance Calculation:**
```
Current Balance = Opening Balance + Sum of Debits - Sum of Credits
```

**Implementation:**
- Store `openingBalance` and `openingBalanceDate` in Bank model
- Calculate `currentBalance` on-the-fly from all transactions
- OR update `currentBalance` on each transaction (faster, but need to ensure consistency)

### 5.2 Receipt Voucher (Payment Received)
**Like Tally's Receipt Voucher:**
```
1. User creates payment (paymentType: "paymentReceived", paymentMode: "bank")
2. System creates:
   - Payment record
   - Bank Transaction (Voucher Entry):
     - ledgerId: bankId
     - type: "debit" (money in)
     - amount: netAmount
     - voucherType: "receipt"
3. Update bank.currentBalance += netAmount
```

### 5.3 Payment Voucher (Payment Made)
**Like Tally's Payment Voucher:**
```
1. User creates payment (paymentType: "paymentMade", paymentMode: "bank")
2. Validate: bank.currentBalance >= netAmount
3. System creates:
   - Payment record
   - Bank Transaction (Voucher Entry):
     - ledgerId: bankId
     - type: "credit" (money out)
     - amount: netAmount
     - voucherType: "payment"
4. Update bank.currentBalance -= netAmount
```

### 5.4 Expense Voucher (Journal Entry)
**Like Tally's Journal Voucher:**
```
1. User creates expense (paymentMode: "bank")
2. System creates:
   - Expense record
   - Bank Transaction (Voucher Entry):
     - ledgerId: bankId
     - type: "credit" (money out)
     - amount: amount
     - voucherType: "expense"
3. Update bank.currentBalance -= amount
```

### 5.5 Contra Voucher (Bank Transfer)
**Like Tally's Contra Voucher:**
```
1. User creates transfer (fromLedgerId, toLedgerId, amount)
2. Validate: fromLedger.currentBalance >= (amount + charges)
3. System creates:
   - Bank Transfer record
   - TWO Bank Transactions:
     
     FROM LEDGER:
     - ledgerId: fromLedgerId
     - type: "credit" (money out)
     - amount: netAmount (amount + charges)
     - voucherType: "contra"
     
     TO LEDGER:
     - ledgerId: toLedgerId
     - type: "debit" (money in)
     - amount: amount (charges not added to destination)
     - voucherType: "contra"
4. Update both ledger balances
```

---

## 📊 6. TALLY-LIKE REPORTS

### 6.1 Ledger Statement (Bank Statement)
**Like Tally's Ledger Statement:**
```
GET /api/banks/:id/statement?fromDate=2024-01-01&toDate=2024-01-31

Response:
{
  "ledger": {
    "bankId": "BNK-00001",
    "ledgerName": "HDFC Bank - Current",
    "openingBalance": 100000,
    "openingBalanceDate": "2024-01-01"
  },
  "transactions": [
    {
      "voucherDate": "2024-01-05",
      "voucherNumber": "BNT-00001",
      "voucherType": "receipt",
      "narration": "Payment from Customer ABC",
      "debit": 50000,
      "credit": 0,
      "balance": 150000
    },
    {
      "voucherDate": "2024-01-10",
      "voucherNumber": "BNT-00002",
      "voucherType": "payment",
      "narration": "Payment to Vendor XYZ",
      "debit": 0,
      "credit": 20000,
      "balance": 130000
    }
  ],
  "closingBalance": 130000
}
```

### 6.2 Cash/Bank Summary
**Like Tally's Cash/Bank Summary:**
```
GET /api/banks/summary?date=2024-01-31

Response:
{
  "cashAccounts": [
    {
      "bankId": "BNK-CASH-001",
      "ledgerName": "Cash",
      "currentBalance": 50000
    }
  ],
  "bankAccounts": [
    {
      "bankId": "BNK-00001",
      "ledgerName": "HDFC Bank",
      "currentBalance": 200000
    },
    {
      "bankId": "BNK-00002",
      "ledgerName": "SBI Current",
      "currentBalance": 150000
    }
  ],
  "totalCash": 50000,
  "totalBank": 350000,
  "total": 400000
}
```

### 6.3 Expense Summary by Category
**Like Tally's Expense Summary:**
```
GET /api/expenses/summary?fromDate=2024-01-01&toDate=2024-01-31

Response:
{
  "summary": [
    {
      "category": "Office Expenses",
      "totalAmount": 50000,
      "count": 15
    },
    {
      "category": "Travel Expenses",
      "totalAmount": 30000,
      "count": 8
    }
  ],
  "totalAmount": 80000,
  "totalCount": 23
}
```

---

## 🔧 7. IMPLEMENTATION STRUCTURE

### 7.1 New Models
```
models/
  - bank.model.js              (Bank Ledgers)
  - bankTransaction.model.js  (Voucher Entries)
  - expense.model.js           (Expense/Journal Vouchers)
  - bankTransfer.model.js     (Contra Vouchers)
```

### 7.2 New Services
```
services/
  - bank.service.js            (Bank Ledger management)
  - bankTransaction.service.js (Voucher entry management)
  - expense.service.js         (Expense voucher management)
  - bankTransfer.service.js    (Contra voucher management)
```

### 7.3 Files to Modify
- `services/payment.service.js` - Add voucher entry creation
- `services/counter.service.js` - Add new modules
- `models/payment.model.js` - Add `bankId` field if not exists

---

## 🎯 8. KEY DIFFERENCES FROM PREVIOUS PLAN

### 8.1 Tally-Inspired Terminology
- "Bank" → "Bank Ledger"
- "Transaction" → "Voucher Entry"
- "Bank Transfer" → "Contra Voucher"
- "Expense" → "Expense/Journal Voucher"
- "Description" → "Narration"

### 8.2 Cash Account Handling
- Cash is just a Bank with `accountType: "cash"`
- Same balance tracking mechanism
- Shows in "Cash-in-Hand" group

### 8.3 Balance Calculation
- Always calculated from voucher entries
- Opening balance is a one-time entry
- Current balance = Opening + Debits - Credits

### 8.4 Voucher Numbering
- Each transaction gets a unique voucher number
- Different prefixes: BNT (Bank Transaction), EXP (Expense), CTR (Contra)

---

## 📋 9. API ENDPOINTS (Tally-Inspired)

### 9.1 Bank Ledgers
- `POST /api/banks` - Create bank ledger
- `GET /api/banks` - List all bank ledgers
- `GET /api/banks/:id` - Get ledger details
- `GET /api/banks/:id/statement` - **Ledger Statement** (like Tally)
- `PUT /api/banks/:id` - Update ledger
- `PUT /api/banks/:id/opening-balance` - Set opening balance
- `DELETE /api/banks/:id` - Delete ledger

### 9.2 Expense Vouchers
- `POST /api/expenses` - Create expense voucher
- `GET /api/expenses` - List expense vouchers
- `GET /api/expenses/:id` - Get voucher details
- `PUT /api/expenses/:id` - Update voucher
- `POST /api/expenses/:id/approve` - Approve expense
- `DELETE /api/expenses/:id` - Cancel voucher

### 9.3 Contra Vouchers (Bank Transfers)
- `POST /api/contra` - Create contra voucher
- `GET /api/contra` - List contra vouchers
- `GET /api/contra/:id` - Get voucher details
- `PUT /api/contra/:id` - Update voucher
- `DELETE /api/contra/:id` - Cancel voucher

### 9.4 Reports
- `GET /api/reports/cash-bank-summary` - Cash/Bank summary
- `GET /api/reports/expense-summary` - Expense summary by category
- `GET /api/reports/ledger-statement/:ledgerId` - Ledger statement

---

## 🔄 10. WORKFLOW EXAMPLES

### Example 1: Receipt Voucher (Payment Received)
```
User Action: Receive payment of ₹50,000 from customer via HDFC Bank

System Flow:
1. Create Payment record (paymentType: "paymentReceived")
2. Create Bank Transaction (Voucher Entry):
   - Voucher Type: "receipt"
   - Ledger: HDFC Bank
   - Type: Debit
   - Amount: ₹50,000
   - Narration: "Payment received from Customer ABC for Invoice INV-00001"
3. Update HDFC Bank balance: 100,000 + 50,000 = 150,000
```

### Example 2: Payment Voucher (Payment Made)
```
User Action: Pay ₹25,000 to vendor via SBI Bank

System Flow:
1. Validate: SBI Bank balance >= ₹25,000
2. Create Payment record (paymentType: "paymentMade")
3. Create Bank Transaction (Voucher Entry):
   - Voucher Type: "payment"
   - Ledger: SBI Bank
   - Type: Credit
   - Amount: ₹25,000
   - Narration: "Payment to Vendor XYZ for Bill BIL-00001"
4. Update SBI Bank balance: 200,000 - 25,000 = 175,000
```

### Example 3: Contra Voucher (Bank Transfer)
```
User Action: Transfer ₹1,00,000 from HDFC to SBI (charges: ₹10)

System Flow:
1. Validate: HDFC balance >= ₹1,00,010
2. Create Bank Transfer record
3. Create TWO Voucher Entries:
   
   Entry 1 (HDFC Bank):
   - Voucher Type: "contra"
   - Ledger: HDFC Bank
   - Type: Credit
   - Amount: ₹1,00,010
   - Narration: "Transfer to SBI Bank"
   
   Entry 2 (SBI Bank):
   - Voucher Type: "contra"
   - Ledger: SBI Bank
   - Type: Debit
   - Amount: ₹1,00,000
   - Narration: "Transfer from HDFC Bank"
4. Update balances:
   - HDFC: 150,000 - 1,00,010 = 49,990
   - SBI: 175,000 + 1,00,000 = 2,75,000
```

### Example 4: Expense Voucher (Journal Entry)
```
User Action: Pay office rent ₹20,000 via HDFC Bank

System Flow:
1. Create Expense record
2. Create Bank Transaction (Voucher Entry):
   - Voucher Type: "expense"
   - Ledger: HDFC Bank
   - Type: Credit
   - Amount: ₹20,000
   - Narration: "Office rent for January 2024"
   - Category: "Office Expenses"
3. Update HDFC Bank balance: 49,990 - 20,000 = 29,990
```

---

## ✅ 11. ADVANTAGES OF THIS APPROACH

1. **Familiar to Tally Users**
   - Same concepts (Ledgers, Vouchers)
   - Same terminology (Debit/Credit, Narration)
   - Same workflow (Receipt, Payment, Contra, Journal)

2. **Automatic Balance Tracking**
   - Like Tally, balances update automatically
   - Full audit trail with voucher entries
   - Can calculate balance from vouchers anytime

3. **Flexible Cash Management**
   - Cash is just another ledger
   - Same tracking mechanism
   - Easy to add multiple cash accounts

4. **Complete Transaction History**
   - Every transaction creates a voucher entry
   - Can generate ledger statements anytime
   - Full audit trail

5. **Scalable**
   - Easy to add new ledger types
   - Easy to add new voucher types
   - Can extend to full double-entry accounting later

---

## 🚀 12. IMPLEMENTATION PRIORITY

### Phase 1: Core Ledgers & Vouchers
1. Bank model (Bank Ledgers)
2. Bank Transaction model (Voucher Entries)
3. Update Payment service to create vouchers
4. Balance calculation logic

### Phase 2: Contra Vouchers
5. Bank Transfer model
6. Contra voucher service
7. Dual ledger updates

### Phase 3: Expense Vouchers
8. Expense model
9. Expense service with voucher creation
10. Approval workflow

### Phase 4: Reports
11. Ledger statements
12. Cash/Bank summary
13. Expense reports

---

## 📝 13. EXAMPLE DATA STRUCTURES

### Create Bank Ledger
```json
{
  "ledgerName": "HDFC Bank - Current Account",
  "bankName": "HDFC Bank",
  "accountName": "ABC Company",
  "accountNumber": "1234567890",
  "ifscCode": "HDFC0001234",
  "branchName": "Mumbai Branch",
  "accountType": "current",
  "openingBalance": 100000,
  "openingBalanceDate": "2024-01-01",
  "ledgerGroup": "bank_accounts"
}
```

### Create Cash Ledger
```json
{
  "ledgerName": "Cash",
  "bankName": "Cash",
  "accountName": "ABC Company",
  "accountType": "cash",
  "openingBalance": 50000,
  "openingBalanceDate": "2024-01-01",
  "ledgerGroup": "cash_in_hand"
}
```

### Create Contra Voucher (Bank Transfer)
```json
{
  "fromLedgerId": "BNK-00001",
  "toLedgerId": "BNK-00002",
  "transferDate": "2024-01-15",
  "amount": 100000,
  "charges": 10,
  "narration": "Transfer to operating account"
}
```

### Create Expense Voucher
```json
{
  "expenseCategory": "Office Expenses",
  "expenseDate": "2024-01-15",
  "amount": 20000,
  "paymentMode": "bank",
  "ledgerId": "BNK-00001",
  "description": "Office rent for January 2024",
  "receiptNumber": "RENT-001"
}
```

---

This approach brings Tally's familiar ledger-based accounting to your system while maintaining your existing structure. Every transaction creates a voucher entry, and balances are automatically calculated - just like Tally!

