const mongoose = require("mongoose");
const Invoice = require("../models/invoice.model");
const Bill = require("../models/bill.model");
const Payment = require("../models/payment.model");
const CustomerVendor = require("../models/customer.model");

// Generate Sales Report (on-the-fly from invoices and paymentReceived) - Customer Wise
const generateSalesReport = async (companyId, filters = {}) => {
  try {
    const { startDate, endDate, customerId, status } = filters;
    
    // Build invoice query
    let invoiceQuery = { 
      companyId: new mongoose.Types.ObjectId(companyId),
      isDeleted: false,
      customerId: new mongoose.Types.ObjectId(customerId)
    };
    
    if (startDate && endDate) {
      invoiceQuery.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) {
      invoiceQuery.status = status;
    }

    // Get invoices (no items)
    const invoices = await Invoice.find(invoiceQuery)
      .populate("customerId", "name contactPerson companyName email phone")
      .select('-items')
      .sort({ invoiceDate: -1 });

    // Get payments received for the same customer and period
    let paymentQuery = { 
      companyId: new mongoose.Types.ObjectId(companyId),
      paymentType: "paymentReceived",
      isDeleted: false,
      partyId: new mongoose.Types.ObjectId(customerId)
    };
    
    if (startDate && endDate) {
      paymentQuery.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const paymentsReceived = await Payment.find(paymentQuery)
      .populate("partyId", "name contactPerson companyName")
      .sort({ paymentDate: -1 });

    // Format invoices - simple structure
    const invoicesData = invoices.map(invoice => ({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      totalAmount: invoice.totals?.grandTotal || 0
    }));

    // Format payments - simple structure
    const paymentsData = paymentsReceived.map(payment => ({
      paymentId: payment._id,
      paymentNumber: payment.paymentId,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      paymentMode: payment.paymentMode,
      referenceNumber: payment.referenceNumber
    }));

    // Calculate summary for this customer
    const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + (invoice.totals?.grandTotal || 0), 0);
    const totalPaymentAmount = paymentsReceived.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return {
      customerId: invoices[0]?.customerId?._id || paymentsReceived[0]?.partyId?._id,
      customerName: invoices[0]?.customerName || paymentsReceived[0]?.partyId?.name || "Unknown",
      invoices: invoicesData,
      payments: paymentsData,
      summary: {
        invoiceCount: invoices.length,
        invoiceTotal: totalInvoiceAmount,
        paymentCount: paymentsReceived.length,
        paymentTotal: totalPaymentAmount,
        due: totalInvoiceAmount - totalPaymentAmount
      },
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
      isDeleted: false,
      vendorId: new mongoose.Types.ObjectId(vendorId)
    };
    
    if (startDate && endDate) {
      billQuery.billDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) {
      billQuery.status = status;
    }

    // Get bills (no items)
    const bills = await Bill.find(billQuery)
      .populate("vendorId", "name contactPerson companyName email phone")
      .select('-items')
      .sort({ billDate: -1 });

    // Get payments made for the same vendor and period
    let paymentQuery = { 
      companyId: new mongoose.Types.ObjectId(companyId),
      paymentType: "paymentMade",
      isDeleted: false,
      partyId: new mongoose.Types.ObjectId(vendorId)
    };
    
    if (startDate && endDate) {
      paymentQuery.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const paymentsMade = await Payment.find(paymentQuery)
      .populate("partyId", "name contactPerson companyName")
      .sort({ paymentDate: -1 });

    // Format bills - simple structure
    const billsData = bills.map(bill => ({
      billId: bill._id,
      billNumber: bill.billNumber,
      billDate: bill.billDate,
      dueDate: bill.dueDate,
      totalAmount: bill.totals?.grandTotal || 0
    }));

    // Format payments - simple structure
    const paymentsData = paymentsMade.map(payment => ({
      paymentId: payment._id,
      paymentNumber: payment.paymentId,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      paymentMode: payment.paymentMode,
      referenceNumber: payment.referenceNumber
    }));

    // Calculate summary for this vendor
    const totalBillAmount = bills.reduce((sum, bill) => sum + (bill.totals?.grandTotal || 0), 0);
    const totalPaymentAmount = paymentsMade.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return {
      vendorId: bills[0]?.vendorId?._id || paymentsMade[0]?.partyId?._id,
      vendorName: bills[0]?.vendorName || paymentsMade[0]?.partyId?.name || "Unknown",
      bills: billsData,
      payments: paymentsData,
      summary: {
        billCount: bills.length,
        billTotal: totalBillAmount,
        paymentCount: paymentsMade.length,
        paymentTotal: totalPaymentAmount,
        due: totalBillAmount - totalPaymentAmount
      },
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
    const { startDate, endDate, customerId, status, search, page = 1, limit = 10 } = filters;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
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

    // Get invoices with customer details
    const invoices = await Invoice.find(invoiceQuery)
      .populate("customerId", "name companyName")
      .select('customerId customerName totals');
    
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

    const payments = await Payment.find(paymentQuery)
      .populate("partyId", "name companyName")
      .select('partyId amount');

    // Group invoices by customer
    const customerInvoiceMap = new Map();
    invoices.forEach(invoice => {
      const custId = invoice.customerId?._id?.toString() || 'unknown';
      const customerName = invoice.customerName || invoice.customerId?.name || invoice.customerId?.companyName || "Unknown";
      
      if (!customerInvoiceMap.has(custId)) {
        customerInvoiceMap.set(custId, {
          customerId: invoice.customerId?._id,
          customerName: customerName,
          invoiceCount: 0,
          invoiceTotal: 0
        });
      }
      
      const customerData = customerInvoiceMap.get(custId);
      customerData.invoiceCount += 1;
      customerData.invoiceTotal += invoice.totals?.grandTotal || 0;
    });

    // Group payments by customer
    const customerPaymentMap = new Map();
    payments.forEach(payment => {
      const custId = payment.partyId?._id?.toString() || 'unknown';
      const customerName = payment.partyId?.name || payment.partyId?.companyName || "Unknown";
      
      if (!customerPaymentMap.has(custId)) {
        customerPaymentMap.set(custId, {
          customerId: payment.partyId?._id,
          customerName: customerName,
          paymentCount: 0,
          paymentTotal: 0
        });
      }
      
      const customerData = customerPaymentMap.get(custId);
      customerData.paymentCount += 1;
      customerData.paymentTotal += payment.amount || 0;
    });

    // Combine customer data
    const customerSummary = [];
    const allCustomerIds = new Set([...customerInvoiceMap.keys(), ...customerPaymentMap.keys()]);
    
    allCustomerIds.forEach(custId => {
      const invoiceData = customerInvoiceMap.get(custId) || {
        customerId: null,
        customerName: "Unknown",
        invoiceCount: 0,
        invoiceTotal: 0
      };
      
      const paymentData = customerPaymentMap.get(custId) || {
        customerId: null,
        customerName: "Unknown",
        paymentCount: 0,
        paymentTotal: 0
      };
      
      customerSummary.push({
        customerId: invoiceData.customerId || paymentData.customerId,
        customerName: invoiceData.customerName || paymentData.customerName,
        invoiceCount: invoiceData.invoiceCount,
        invoiceTotal: invoiceData.invoiceTotal,
        paymentCount: paymentData.paymentCount,
        paymentTotal: paymentData.paymentTotal,
        due: invoiceData.invoiceTotal - paymentData.paymentTotal
      });
    });

     // 🔍 Apply search filter by customerName (case-insensitive)
    let filteredSummary = customerSummary;
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filteredSummary = customerSummary.filter(c =>
        searchRegex.test(c.customerName)
      );
    }

    // // Calculate totals (before pagination for accurate totals)
    // const totalInvoiceCount = invoices.length;
    // const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + (invoice.totals?.grandTotal || 0), 0);
    // const totalPaymentCount = payments.length;
    // const totalPaymentAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

     // Calculate totals (based on filtered data, not full)
    const totalInvoiceCount = filteredSummary.reduce(
      (sum, c) => sum + c.invoiceCount,
      0
    );
    const totalInvoiceAmount = filteredSummary.reduce(
      (sum, c) => sum + c.invoiceTotal,
      0
    );
    const totalPaymentCount = filteredSummary.reduce(
      (sum, c) => sum + c.paymentCount,
      0
    );
    const totalPaymentAmount = filteredSummary.reduce(
      (sum, c) => sum + c.paymentTotal,
      0
    );

    // Calculate pagination
    const totalCustomers = filteredSummary.length;
    const skip = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(totalCustomers / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Apply pagination to customerSummary
    const paginatedCustomerSummary = filteredSummary.slice(skip, skip + limitNum);

    return {
      customerSummary: paginatedCustomerSummary,
      total: {
        invoiceCount: totalInvoiceCount,
        invoiceTotal: totalInvoiceAmount,
        paymentCount: totalPaymentCount,
        paymentTotal: totalPaymentAmount,
        due: totalInvoiceAmount - totalPaymentAmount
      },
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount: totalCustomers,
        limit: limitNum,
        hasNextPage,
        hasPrevPage
      },
      generatedAt: new Date()
    };

  } catch (error) {
    throw error;
  }
};

// Get Purchase Summary (Quick stats without full details)
const getPurchaseSummary = async (companyId, filters = {}) => {
  try {
    const { startDate, endDate, vendorId, status, search, page = 1, limit = 10 } = filters;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
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

    // Get bills with vendor details
    const bills = await Bill.find(billQuery)
      .populate("vendorId", "name companyName")
      .select('vendorId vendorName totals');
    
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

    const payments = await Payment.find(paymentQuery)
      .populate("partyId", "name companyName")
      .select('partyId amount');

    // Group bills by vendor
    const vendorBillMap = new Map();
    bills.forEach(bill => {
      const vendorIdStr = bill.vendorId?._id?.toString() || 'unknown';
      const vendorName = bill.vendorName || bill.vendorId?.name || bill.vendorId?.companyName || "Unknown";
      
      if (!vendorBillMap.has(vendorIdStr)) {
        vendorBillMap.set(vendorIdStr, {
          vendorId: bill.vendorId?._id,
          vendorName: vendorName,
          billCount: 0,
          billTotal: 0
        });
      }
      
      const vendorData = vendorBillMap.get(vendorIdStr);
      vendorData.billCount += 1;
      vendorData.billTotal += bill.totals?.grandTotal || 0;
    });

    // Group payments by vendor
    const vendorPaymentMap = new Map();
    payments.forEach(payment => {
      const vendorIdStr = payment.partyId?._id?.toString() || 'unknown';
      const vendorName = payment.partyId?.name || payment.partyId?.companyName || "Unknown";
      
      if (!vendorPaymentMap.has(vendorIdStr)) {
        vendorPaymentMap.set(vendorIdStr, {
          vendorId: payment.partyId?._id,
          vendorName: vendorName,
          paymentCount: 0,
          paymentTotal: 0
        });
      }
      
      const vendorData = vendorPaymentMap.get(vendorIdStr);
      vendorData.paymentCount += 1;
      vendorData.paymentTotal += payment.amount || 0;
    });

    // Combine vendor data
    const vendorSummary = [];
    const allVendorIds = new Set([...vendorBillMap.keys(), ...vendorPaymentMap.keys()]);
    
    allVendorIds.forEach(vendorIdStr => {
      const billData = vendorBillMap.get(vendorIdStr) || {
        vendorId: null,
        vendorName: "Unknown",
        billCount: 0,
        billTotal: 0
      };
      
      const paymentData = vendorPaymentMap.get(vendorIdStr) || {
        vendorId: null,
        vendorName: "Unknown",
        paymentCount: 0,
        paymentTotal: 0
      };
      
      vendorSummary.push({
        vendorId: billData.vendorId || paymentData.vendorId,
        vendorName: billData.vendorName || paymentData.vendorName,
        billCount: billData.billCount,
        billTotal: billData.billTotal,
        paymentCount: paymentData.paymentCount,
        paymentTotal: paymentData.paymentTotal,
        due: billData.billTotal - paymentData.paymentTotal
      });
    });

     let filteredSummary = vendorSummary;
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filteredSummary = vendorSummary.filter(v =>
        searchRegex.test(v.vendorName)
      );
    }

    // Calculate totals based on filtered data
    const totalBillCount = filteredSummary.reduce((sum, v) => sum + v.billCount, 0);
    const totalBillAmount = filteredSummary.reduce((sum, v) => sum + v.billTotal, 0);
    const totalPaymentCount = filteredSummary.reduce((sum, v) => sum + v.paymentCount, 0);
    const totalPaymentAmount = filteredSummary.reduce((sum, v) => sum + v.paymentTotal, 0);

    // // Calculate totals (before pagination for accurate totals)
    // const totalBillCount = bills.length;
    // const totalBillAmount = bills.reduce((sum, bill) => sum + (bill.totals?.grandTotal || 0), 0);
    // const totalPaymentCount = payments.length;
    // const totalPaymentAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Calculate pagination
    const totalVendors = filteredSummary.length;
    const skip = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(totalVendors / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Apply pagination to vendorSummary
    const paginatedVendorSummary = filteredSummary.slice(skip, skip + limitNum);

    return {
      vendorSummary: paginatedVendorSummary,
      total: {
        billCount: totalBillCount,
        billTotal: totalBillAmount,
        paymentCount: totalPaymentCount,
        paymentTotal: totalPaymentAmount,
        due: totalBillAmount - totalPaymentAmount
      },
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount: totalVendors,
        limit: limitNum,
        hasNextPage,
        hasPrevPage
      },
      generatedAt: new Date()
    };

  } catch (error) {
    throw error;
  }
};

// Get Total Customers Count
const getTotalCustomer = async (companyId) => {
  try {
    const count = await CustomerVendor.countDocuments({
      companyId: new mongoose.Types.ObjectId(companyId),
      "type.isCustomer": true,
      status: "Active"
    });
    return count;
  } catch (error) {
    throw error;
  }
};

// Get Total Vendors Count
const getTotalVendor = async (companyId) => {
  try {
    const count = await CustomerVendor.countDocuments({
      companyId: new mongoose.Types.ObjectId(companyId),
      "type.isVendor": true,
      status: "Active"
    });
    return count;
  } catch (error) {
    throw error;
  }
};

// Get Total Sales Amount
const getTotalSales = async (companyId, filters = {}) => {
  try {
    const { startDate, endDate } = filters;
    
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

    const result = await Invoice.aggregate([
      { $match: invoiceQuery },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totals.grandTotal" },
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      totalAmount: result[0]?.totalAmount || 0,
      count: result[0]?.count || 0
    };
  } catch (error) {
    throw error;
  }
};

// Get Total Purchase Amount
const getTotalPurchase = async (companyId, filters = {}) => {
  try {
    const { startDate, endDate } = filters;
    
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

    const result = await Bill.aggregate([
      { $match: billQuery },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totals.grandTotal" },
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      totalAmount: result[0]?.totalAmount || 0,
      count: result[0]?.count || 0
    };
  } catch (error) {
    throw error;
  }
};

// Get Dashboard Reporting (Combined function)
const getDashboardReporting = async (companyId, filters = {}) => {
  try {
    const { startDate, endDate } = filters;

    // Execute all service functions in parallel for better performance
    const [totalCustomer, totalVendor, totalSales, totalPurchase] = await Promise.all([
      getTotalCustomer(companyId),
      getTotalVendor(companyId),
      getTotalSales(companyId, { startDate, endDate }),
      getTotalPurchase(companyId, { startDate, endDate })
    ]);

    return {
      totalCustomer,
      totalVendor,
      totalSales: totalSales.totalAmount,
      totalSalesCount: totalSales.count,
      totalPurchase: totalPurchase.totalAmount,
      totalPurchaseCount: totalPurchase.count,
      filters: {
        startDate,
        endDate
      },
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
  getPurchaseSummary,
  getTotalCustomer,
  getTotalVendor,
  getTotalSales,
  getTotalPurchase,
  getDashboardReporting
};