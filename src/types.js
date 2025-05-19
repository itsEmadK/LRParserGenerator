/**
 * @typedef ProductionRule
 * @property {number} number
 * @property {string} LHS
 * @property {string[]} RHS
 * @property {()=>string} toString returns an string representation of the rule in the following format: {LHS ->number RHS}. example: A ->2 BCD
 * @property {()=>ProductionRule} clone returns a deep copy of the ProductionRule object
 * @property {(other:ProductionRule)=>boolean} equals returns true if the string representation of the rules are the same, false otherwise.
 */

/**
 * @typedef Grammar
 * @property {ProductionRule[]} rules
 * @property {Set<string>} terminals
 * @property {Set<string>} nonTerminals
 * @property {Map<string,Set<string>>} firstSets
 * @property {(exp:string[])=>Set<string>} getFirstSet
 * @property {Set<string>} nullables
 * @property {(exp:string[])=>boolean} isNullable
 */

/**
 * @typedef LRItem
 * @property {ProductionRule} rule
 * @property {number} dotPosition index of the symbol after the dot in the RHS.
 * @property {Set<string>} lookAhead
 * @property {(includeLookahead:boolean)=>string} toString returns a string representation of the item in the format {A -> B.CD ,{a,b,c}} if includeLookahead is true; other wise the format is {A -> B.CD}
 * @property {(other:LRItem)=>boolean} equals returns true if the toString call of the two items are the same, false otherwise.
 * @property {()=>LRItem} clone returns a deep copy of the item.
 */
