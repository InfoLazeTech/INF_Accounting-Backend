const Counter = require("../models/counter.model");

class CounterService {
  // Module configurations
  static MODULES = {
    CUSTOMER: { module: 'customer', prefix: 'CUS' },
    ITEM: { module: 'item', prefix: 'ITM' },
    INVOICE: { module: 'invoice', prefix: 'INV' },
    QUOTE: { module: 'quote', prefix: 'QUO' },
    PURCHASE_ORDER: { module: 'purchase_order', prefix: 'PO' },
    SALES_ORDER: { module: 'sales_order', prefix: 'SO' },
    PAYMENT: { module: 'payment', prefix: 'PAY' },
    RECEIPT: { module: 'receipt', prefix: 'REC' },
    BILL: { module: 'bill', prefix: 'BILL' },
    PRODUCTION_ORDER: {module: 'production_order', prefix: "Production_Order"}
  };

  /**
   * Generate next ID for a specific module and company
   * @param {string} companyId - Company ObjectId
   * @param {string} moduleKey - Module key from MODULES (e.g., 'CUSTOMER', 'ITEM')
   * @param {number} padding - Number of digits to pad (default: 5)
   * @returns {Promise<string>} Generated ID (e.g., 'CUS-00001')
   */
  static async generateNextId(companyId, moduleKey, padding = 5) {
    try {
      if (!this.MODULES[moduleKey]) {
        throw new Error(`Invalid module key: ${moduleKey}. Available modules: ${Object.keys(this.MODULES).join(', ')}`);
      }

      const { module, prefix } = this.MODULES[moduleKey];
      const sequence = await Counter.getNextSequence(companyId, module, prefix);
      
      return `${prefix}-${String(sequence).padStart(padding, '0')}`;
    } catch (error) {
      throw new Error(`Failed to generate ID for ${moduleKey}: ${error.message}`);
    }
  }

  /**
   * Get current sequence number without incrementing
   * @param {string} companyId - Company ObjectId
   * @param {string} moduleKey - Module key from MODULES
   * @returns {Promise<number>} Current sequence number
   */
  static async getCurrentSequence(companyId, moduleKey) {
    try {
      if (!this.MODULES[moduleKey]) {
        throw new Error(`Invalid module key: ${moduleKey}. Available modules: ${Object.keys(this.MODULES).join(', ')}`);
      }

      const { module } = this.MODULES[moduleKey];
      return await Counter.getCurrentSequence(companyId, module);
    } catch (error) {
      throw new Error(`Failed to get current sequence for ${moduleKey}: ${error.message}`);
    }
  }

  /**
   * Reset sequence for a specific module and company
   * @param {string} companyId - Company ObjectId
   * @param {string} moduleKey - Module key from MODULES
   * @param {number} newSeq - New sequence number (default: 0)
   * @returns {Promise<boolean>} Success status
   */
  static async resetSequence(companyId, moduleKey, newSeq = 0) {
    try {
      if (!this.MODULES[moduleKey]) {
        throw new Error(`Invalid module key: ${moduleKey}. Available modules: ${Object.keys(this.MODULES).join(', ')}`);
      }

      const { module } = this.MODULES[moduleKey];
      return await Counter.resetSequence(companyId, module, newSeq);
    } catch (error) {
      throw new Error(`Failed to reset sequence for ${moduleKey}: ${error.message}`);
    }
  }

  /**
   * Get all counters for a company
   * @param {string} companyId - Company ObjectId
   * @returns {Promise<Array>} Array of counter documents
   */
  static async getCompanyCounters(companyId) {
    try {
      return await Counter.find({ companyId }).sort({ module: 1 });
    } catch (error) {
      throw new Error(`Failed to get counters for company ${companyId}: ${error.message}`);
    }
  }

  /**
   * Get counter statistics for a company
   * @param {string} companyId - Company ObjectId
   * @returns {Promise<Object>} Counter statistics
   */
  static async getCompanyStats(companyId) {
    try {
      const counters = await this.getCompanyCounters(companyId);
      const stats = {};
      
      counters.forEach(counter => {
        stats[counter.module] = {
          currentSequence: counter.seq,
          prefix: counter.prefix,
          lastGenerated: counter.lastGenerated,
          createdAt: counter.createdAt,
          updatedAt: counter.updatedAt
        };
      });
      
      return stats;
    } catch (error) {
      throw new Error(`Failed to get stats for company ${companyId}: ${error.message}`);
    }
  }

  /**
   * Bulk reset sequences for multiple modules
   * @param {string} companyId - Company ObjectId
   * @param {Object} moduleSequences - Object with module keys and new sequences
   * @returns {Promise<Object>} Results of reset operations
   */
  static async bulkResetSequences(companyId, moduleSequences) {
    try {
      const results = {};
      
      for (const [moduleKey, newSeq] of Object.entries(moduleSequences)) {
        try {
          await this.resetSequence(companyId, moduleKey, newSeq);
          results[moduleKey] = { success: true, newSequence: newSeq };
        } catch (error) {
          results[moduleKey] = { success: false, error: error.message };
        }
      }
      
      return results;
    } catch (error) {
      throw new Error(`Failed to bulk reset sequences: ${error.message}`);
    }
  }
}

module.exports = CounterService;
