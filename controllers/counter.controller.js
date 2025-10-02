const httpStatus = require('http-status');
const { successResponse, errorResponse } = require("../utils/response");
const CounterService = require("../services/counter.service");

const getCompanyCounters = async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }

    const counters = await CounterService.getCompanyCounters(companyId);
    return successResponse(res, counters, "Counters fetched successfully", httpStatus.OK);
  } catch (error) {
    const message = error.message || "Failed to fetch counters";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

const getCompanyStats = async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }

    const stats = await CounterService.getCompanyStats(companyId);
    return successResponse(res, stats, "Counter statistics fetched successfully", httpStatus.OK);
  } catch (error) {
    const message = error.message || "Failed to fetch counter statistics";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

const resetSequence = async (req, res) => {
  try {
    const { companyId, moduleKey, newSeq } = req.body;
    
    if (!companyId || !moduleKey) {
      return errorResponse(res, "Company ID and module key are required", 400);
    }

    const result = await CounterService.resetSequence(companyId, moduleKey, newSeq || 0);
    
    if (result) {
      return successResponse(res, { moduleKey, newSequence: newSeq || 0 }, "Sequence reset successfully", httpStatus.OK);
    } else {
      return errorResponse(res, "Failed to reset sequence", 400);
    }
  } catch (error) {
    const message = error.message || "Failed to reset sequence";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

const bulkResetSequences = async (req, res) => {
  try {
    const { companyId, moduleSequences } = req.body;
    
    if (!companyId || !moduleSequences) {
      return errorResponse(res, "Company ID and module sequences are required", 400);
    }

    const results = await CounterService.bulkResetSequences(companyId, moduleSequences);
    return successResponse(res, results, "Bulk reset completed", httpStatus.OK);
  } catch (error) {
    const message = error.message || "Failed to bulk reset sequences";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

const getCurrentSequence = async (req, res) => {
  try {
    const { companyId, moduleKey } = req.query;
    
    if (!companyId || !moduleKey) {
      return errorResponse(res, "Company ID and module key are required", 400);
    }

    const currentSeq = await CounterService.getCurrentSequence(companyId, moduleKey);
    return successResponse(res, { moduleKey, currentSequence: currentSeq }, "Current sequence fetched successfully", httpStatus.OK);
  } catch (error) {
    const message = error.message || "Failed to get current sequence";
    const statusCode = error.statusCode || 400;
    
    return errorResponse(res, message, statusCode);
  }
};

module.exports = {
  getCompanyCounters,
  getCompanyStats,
  resetSequence,
  bulkResetSequences,
  getCurrentSequence
};
