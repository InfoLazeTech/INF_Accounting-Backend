const mongoose = require("mongoose");
const Invoice = require("../models/invoice.model");
const Bill = require("../models/bill.model");
const Payment = require("../models/payment.model");

// Generate Sales Report (on-the-fly from invoices and paymentReceived) - Customer Wise
const generateSalesReport = async (companyId, filters = {}) => {
  try {
    const { startDate, endDate, customerId, status } = filters;
    
    // Build invoice query
    let invoiceQuery = { 
      companyId: new mongoose.Types.ObjectId(companyId),
      isDeleted: false 
    };
    
    if (startDate && endDate) {
      invoiceQuery.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (customerId) {
      invoiceQuery.customerId = new mongoose.Types.ObjectId(customerId);
    }
    
    if (status) {
      invoiceQuery.status = status;
    }

    // Get invoices with customer details (no items)
    const invoices = await Invoice.find(invoiceQuery)
      .populate("customerId", "name contactPerson companyName email phone")
      .select('-items') // Exclude items
      .sort({ invoiceDate: -1 });

    // Get payments received for the same period/parties
    let paymentQuery = { 
      companyId: new mongoose.Types.ObjectId(companyId),
      paymentType: "paymentReceived",
      isDeleted: false 
    };
    
    if (startDate && endDate) {
      paymentQuery.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (customerId) {
      paymentQuery.partyId = new mongoose.Types.ObjectId(customerId);
    }

    const paymentsReceived = await Payment.find(paymentQuery)
      .populate("partyId", "name contactPerson companyName")
      .sort({ paymentDate: -1 });

    // Group invoices by customer
    const customerInvoiceMap = new Map();
    invoices.forEach(invoice => {
      const customerId = invoice.customerId?._id?.toString() || 'unknown';
      if (!customerInvoiceMap.has(customerId)) {
        customerInvoiceMap.set(customerId, {
          customerId: invoice.customerId?._id,
          customerName: invoice.customerName,
          customerDetails: invoice.customerId ? {
            name: invoice.customerId.name,
            contactPerson: invoice.customerId.contactPerson,
            companyName: invoice.customerId.companyName,
            email: invoice.customerId.email,
            phone: invoice.customerId.phone
          } : null,
          invoices: [],
          totalInvoiceAmount: 0,
          totalPaidAmount: 0,
          totalRemainingAmount: 0
        });
      }
      
      const customerData = customerInvoiceMap.get(customerId);
      customerData.invoices.push({
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totals?.grandTotal || 0,
        paidAmount: invoice.paidAmount || 0,
        remainingAmount: invoice.remainingAmount || 0,
        status: invoice.status,
        paymentStatus: invoice.paidAmount > 0 ? (invoice.paidAmount >= invoice.totals?.grandTotal ? "paid" : "partial") : "pending"
      });
      
      customerData.totalInvoiceAmount += invoice.totals?.grandTotal || 0;
      customerData.totalPaidAmount += invoice.paidAmount || 0;
      customerData.totalRemainingAmount += invoice.remainingAmount || 0;
    });

    // Group payments by customer
    const customerPaymentMap = new Map();
    paymentsReceived.forEach(payment => {
      const customerId = payment.partyId?._id?.toString() || 'unknown';
      if (!customerPaymentMap.has(customerId)) {
        customerPaymentMap.set(customerId, {
          customerId: payment.partyId?._id,
          customerName: payment.partyId?.name || "Unknown",
          payments: [],
          totalPaymentAmount: 0
        });
      }
      
      const customerData = customerPaymentMap.get(customerId);
      customerData.payments.push({
        paymentId: payment._id,
        paymentNumber: payment.paymentId,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        referenceNumber: payment.referenceNumber,
        status: payment.status
      });
      
      customerData.totalPaymentAmount += payment.amount || 0;
    });

    // Combine customer data
    const customerWiseData = [];
    const allCustomerIds = new Set([...customerInvoiceMap.keys(), ...customerPaymentMap.keys()]);
    
    allCustomerIds.forEach(customerId => {
      const invoiceData = customerInvoiceMap.get(customerId) || {
        customerId: null,
        customerName: "Unknown",
        customerDetails: null,
        invoices: [],
        totalInvoiceAmount: 0,
        totalPaidAmount: 0,
        totalRemainingAmount: 0
      };
      
      const paymentData = customerPaymentMap.get(customerId) || {
        customerId: null,
        customerName: "Unknown",
        payments: [],
        totalPaymentAmount: 0
      };
      
      customerWiseData.push({
        customerId: invoiceData.customerId || paymentData.customerId,
        customerName: invoiceData.customerName || paymentData.customerName,
        customerDetails: invoiceData.customerDetails,
        invoices: invoiceData.invoices,
        payments: paymentData.payments,
        summary: {
          totalInvoiceAmount: invoiceData.totalInvoiceAmount,
          totalPaidAmount: invoiceData.totalPaidAmount,
          totalRemainingAmount: invoiceData.totalRemainingAmount,
          totalPaymentAmount: paymentData.totalPaymentAmount,
          netAmountDue: invoiceData.totalInvoiceAmount - paymentData.totalPaymentAmount
        }
      });
    });

    // Calculate overall summary
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.totals?.grandTotal || 0), 0);
    const totalPaid = invoices.reduce((sum, invoice) => sum + (invoice.paidAmount || 0), 0);
    const totalPending = totalAmount - totalPaid;
    const totalPaymentsReceived = paymentsReceived.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const netAmount = totalAmount - totalPaymentsReceived;

    return {
      summary: {
        totalCustomers: customerWiseData.length,
        totalInvoices,
        totalAmount,
        totalPaid,
        totalPending,
        totalPaymentsReceived,
        netAmount,
        averageInvoiceAmount: totalInvoices > 0 ? totalAmount / totalInvoices : 0
      },
      customers: customerWiseData,
      filters: {
        startDate,
        endDate,
        customerId,
        status
      },
      generatedAt: new Date()
    };

  } catch (error) {
    throw error;
  }
};

// Generate Purchase Report (on-the-fly from bills and paymentMade) - Vendor Wise
const generatePurchaseReport = async (companyId, filters = {}) => {
  try {
    const { startDate, endDate, vendorId, status } = filters;
    
    // Build bill query
    let billQuery = { 
      companyId: new mongoose.Types.ObjectId(companyId),
      isDeleted: false 
    };
    
    if (startDate && endDate) {
      billQuery.billDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (vendorId) {
      billQuery.vendorId = new mongoose.Types.ObjectId(vendorId);
    }
    
    if (status) {
      billQuery.status = status;
    }

    // Get bills with vendor details (no items)
    const bills = await Bill.find(billQuery)
      .populate("vendorId", "name contactPerson companyName email phone")
      .select('-items') // Exclude items
      .sort({ billDate: -1 });

    // Get payments made for the same period/parties
    let paymentQuery = { 
      companyId: new mongoose.Types.ObjectId(companyId),
      paymentType: "paymentMade",
      isDeleted: false 
    };
    
    if (startDate && endDate) {
      paymentQuery.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (vendorId) {
      paymentQuery.partyId = new mongoose.Types.ObjectId(vendorId);
    }

    const paymentsMade = await Payment.find(paymentQuery)
      .populate("partyId", "name contactPerson companyName")
      .sort({ paymentDate: -1 });

    // Group bills by vendor
    const vendorBillMap = new Map();
    bills.forEach(bill => {
      const vendorId = bill.vendorId?._id?.toString() || 'unknown';
      if (!vendorBillMap.has(vendorId)) {
        vendorBillMap.set(vendorId, {
          vendorId: bill.vendorId?._id,
          vendorName: bill.vendorName,
          vendorDetails: bill.vendorId ? {
            name: bill.vendorId.name,
            contactPerson: bill.vendorId.contactPerson,
            companyName: bill.vendorId.companyName,
            email: bill.vendorId.email,
            phone: bill.vendorId.phone
          } : null,
          bills: [],
          totalBillAmount: 0,
          totalPaidAmount: 0,
          totalRemainingAmount: 0
        });
      }
      
      const vendorData = vendorBillMap.get(vendorId);
      vendorData.bills.push({
        billId: bill._id,
        billNumber: bill.billNumber,
        billDate: bill.billDate,
        dueDate: bill.dueDate,
        totalAmount: bill.totals?.grandTotal || 0,
        paidAmount: bill.paidAmount || 0,
        remainingAmount: bill.remainingAmount || 0,
        status: bill.status,
        paymentStatus: bill.paidAmount > 0 ? (bill.paidAmount >= bill.totals?.grandTotal ? "paid" : "partial") : "pending"
      });
      
      vendorData.totalBillAmount += bill.totals?.grandTotal || 0;
      vendorData.totalPaidAmount += bill.paidAmount || 0;
      vendorData.totalRemainingAmount += bill.remainingAmount || 0;
    });

    // Group payments by vendor
    const vendorPaymentMap = new Map();
    paymentsMade.forEach(payment => {
      const vendorId = payment.partyId?._id?.toString() || 'unknown';
      if (!vendorPaymentMap.has(vendorId)) {
        vendorPaymentMap.set(vendorId, {
          vendorId: payment.partyId?._id,
          vendorName: payment.partyId?.name || "Unknown",
          payments: [],
          totalPaymentAmount: 0
        });
      }
      
      const vendorData = vendorPaymentMap.get(vendorId);
      vendorData.payments.push({
        paymentId: payment._id,
        paymentNumber: payment.paymentId,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        referenceNumber: payment.referenceNumber,
        status: payment.status
      });
      
      vendorData.totalPaymentAmount += payment.amount || 0;
    });

    // Combine vendor data
    const vendorWiseData = [];
    const allVendorIds = new Set([...vendorBillMap.keys(), ...vendorPaymentMap.keys()]);
    
    allVendorIds.forEach(vendorId => {
      const billData = vendorBillMap.get(vendorId) || {
        vendorId: null,
        vendorName: "Unknown",
        vendorDetails: null,
        bills: [],
        totalBillAmount: 0,
        totalPaidAmount: 0,
        totalRemainingAmount: 0
      };
      
      const paymentData = vendorPaymentMap.get(vendorId) || {
        vendorId: null,
        vendorName: "Unknown",
        payments: [],
        totalPaymentAmount: 0
      };
      
      vendorWiseData.push({
        vendorId: billData.vendorId || paymentData.vendorId,
        vendorName: billData.vendorName || paymentData.vendorName,
        vendorDetails: billData.vendorDetails,
        bills: billData.bills,
        payments: paymentData.payments,
        summary: {
          totalBillAmount: billData.totalBillAmount,
          totalPaidAmount: billData.totalPaidAmount,
          totalRemainingAmount: billData.totalRemainingAmount,
          totalPaymentAmount: paymentData.totalPaymentAmount,
          netAmountDue: billData.totalBillAmount - paymentData.totalPaymentAmount
        }
      });
    });

    // Calculate overall summary
    const totalBills = bills.length;
    const totalAmount = bills.reduce((sum, bill) => sum + (bill.totals?.grandTotal || 0), 0);
    const totalPaid = bills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
    const totalPending = totalAmount - totalPaid;
    const totalPaymentsMade = paymentsMade.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const netAmount = totalAmount - totalPaymentsMade;

    return {
      summary: {
        totalVendors: vendorWiseData.length,
        totalBills,
        totalAmount,
        totalPaid,
        totalPending,
        totalPaymentsMade,
        netAmount,
        averageBillAmount: totalBills > 0 ? totalAmount / totalBills : 0
      },
      vendors: vendorWiseData,
      filters: {
        startDate,
        endDate,
        vendorId,
        status
      },
      generatedAt: new Date()
    };

  } catch (error) {
    throw error;
  }
};

// Get Sales Summary (Quick stats without full details)
const getSalesSummary = async (companyId, filters = {}) => {
  try {
    const { startDate, endDate, customerId, status } = filters;
    
    // Build invoice query
    let invoiceQuery = { 
      companyId: new mongoose.Types.ObjectId(companyId),
      isDeleted: false 
    };
    
    if (startDate && endDate) {
      invoiceQuery.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (customerId) {
      invoiceQuery.customerId = new mongoose.Types.ObjectId(customerId);
    }
    
    if (status) {
      invoiceQuery.status = status;
    }

    // Get basic invoice stats
    const invoices = await Invoice.find(invoiceQuery).select('totals paidAmount status');
    
    // Get payment received stats
    let paymentQuery = { 
      companyId: new mongoose.Types.ObjectId(companyId),
      paymentType: "paymentReceived",
      isDeleted: false 
    };
    
    if (startDate && endDate) {
      paymentQuery.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (customerId) {
      paymentQuery.partyId = new mongoose.Types.ObjectId(customerId);
    }

    const payments = await Payment.find(paymentQuery).select('amount');

    // Calculate summary
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.totals?.grandTotal || 0), 0);
    const totalPaid = invoices.reduce((sum, invoice) => sum + (invoice.paidAmount || 0), 0);
    const totalPending = totalAmount - totalPaid;
    const totalPaymentsReceived = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return {
      totalInvoices,
      totalAmount,
      totalPaid,
      totalPending,
      totalPaymentsReceived,
      netAmount: totalAmount - totalPaid,
      averageInvoiceAmount: totalInvoices > 0 ? totalAmount / totalInvoices : 0,
      generatedAt: new Date()
    };

  } catch (error) {
    throw error;
  }
};

// Get Purchase Summary (Quick stats without full details)
const getPurchaseSummary = async (companyId, filters = {}) => {
  try {
    const { startDate, endDate, vendorId, status } = filters;
    
    // Build bill query
    let billQuery = { 
      companyId: new mongoose.Types.ObjectId(companyId),
      isDeleted: false 
    };
    
    if (startDate && endDate) {
      billQuery.billDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (vendorId) {
      billQuery.vendorId = new mongoose.Types.ObjectId(vendorId);
    }
    
    if (status) {
      billQuery.status = status;
    }

    // Get basic bill stats
    const bills = await Bill.find(billQuery).select('totals paidAmount status');
    
    // Get payment made stats
    let paymentQuery = { 
      companyId: new mongoose.Types.ObjectId(companyId),
      paymentType: "paymentMade",
      isDeleted: false 
    };
    
    if (startDate && endDate) {
      paymentQuery.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (vendorId) {
      paymentQuery.partyId = new mongoose.Types.ObjectId(vendorId);
    }

    const payments = await Payment.find(paymentQuery).select('amount');

    // Calculate summary
    const totalBills = bills.length;
    const totalAmount = bills.reduce((sum, bill) => sum + (bill.totals?.grandTotal || 0), 0);
    const totalPaid = bills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
    const totalPending = totalAmount - totalPaid;
    const totalPaymentsMade = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return {
      totalBills,
      totalAmount,
      totalPaid,
      totalPending,
      totalPaymentsMade,
      netAmount: totalAmount - totalPaid,
      averageBillAmount: totalBills > 0 ? totalAmount / totalBills : 0,
      generatedAt: new Date()
    };

  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateSalesReport,
  generatePurchaseReport,
  getSalesSummary,
  getPurchaseSummary
};