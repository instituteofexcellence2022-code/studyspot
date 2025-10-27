/**
 * Query Builder Utility
 * 
 * Eliminates code duplication by providing a reusable builder pattern
 * for constructing SQL WHERE clauses with parameterized queries.
 */

class QueryBuilder {
  constructor(baseTable, tenantId) {
    this.whereConditions = [];
    this.queryParams = [tenantId];
    this.paramCount = 1;
    this.baseTable = baseTable;
  }

  /**
   * Add an equality condition
   * @param {string} field - Database field name
   * @param {any} value - Value to match
   * @returns {QueryBuilder} - Returns this for method chaining
   */
  whereEquals(field, value) {
    if (value !== undefined && value !== null) {
      this.whereConditions.push(`${this.baseTable}.${field} = $${++this.paramCount}`);
      this.queryParams.push(value);
    }
    return this;
  }

  /**
   * Add an IN condition for arrays
   * @param {string} field - Database field name
   * @param {Array} values - Array of values to match
   * @returns {QueryBuilder} - Returns this for method chaining
   */
  whereIn(field, values) {
    if (Array.isArray(values) && values.length > 0) {
      this.whereConditions.push(`${this.baseTable}.${field} = ANY($${++this.paramCount})`);
      this.queryParams.push(values);
    }
    return this;
  }

  /**
   * Add a LIKE condition for pattern matching
   * @param {string} field - Database field name
   * @param {string} value - Pattern to match
   * @returns {QueryBuilder} - Returns this for method chaining
   */
  whereLike(field, value) {
    if (value) {
      this.whereConditions.push(`${this.baseTable}.${field} ILIKE $${++this.paramCount}`);
      this.queryParams.push(`%${value}%`);
    }
    return this;
  }

  /**
   * Add a range condition
   * @param {string} field - Database field name
   * @param {any} from - Starting value
   * @param {any} to - Ending value
   * @returns {QueryBuilder} - Returns this for method chaining
   */
  whereBetween(field, from, to) {
    if (from !== undefined && from !== null) {
      this.whereConditions.push(`${this.baseTable}.${field} >= $${++this.paramCount}`);
      this.queryParams.push(from);
    }
    if (to !== undefined && to !== null) {
      this.whereConditions.push(`${this.baseTable}.${field} <= $${++this.paramCount}`);
      this.queryParams.push(to);
    }
    return this;
  }

  /**
   * Add a custom condition
   * @param {string} condition - SQL condition
   * @param {Array} params - Parameters for the condition
   * @returns {QueryBuilder} - Returns this for method chaining
   */
  whereCustom(condition, params = []) {
    if (condition) {
      const processedCondition = params.reduce((acc, param, index) => {
        return acc.replace('?', `$${++this.paramCount}`);
      }, condition);
      this.whereConditions.push(processedCondition);
      this.queryParams.push(...params);
    }
    return this;
  }

  /**
   * Build the final WHERE clause and parameters
   * @returns {Object} - Object containing whereClause and params
   */
  build() {
    return {
      whereClause: this.whereConditions.length > 0 ? this.whereConditions.join(' AND ') : '1=1',
      params: this.queryParams
    };
  }
}
module.exports = QueryBuilder;