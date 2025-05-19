/**
 * @typedef ProductionRule
 * @property {number} number
 * @property {string} LHS
 * @property {string[]} RHS
 * @property {()=>string} toString returns an string representation of the rule in the following format: {LHS ->number RHS}. example: A ->2 BCD
 * @property {()=>ProductionRule} clone returns a deep copy of the ProductionRule object
 * @property {(other:ProductionRule)=>boolean} equals returns true if the string representation of the rules are the same, false otherwise.
 */
