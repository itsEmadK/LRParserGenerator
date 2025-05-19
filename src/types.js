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

/**
 * @typedef LRAction
 * @property {string} type one of {A, G, S, R}
 * @property {string[]} input the symbols triggering the action
 * @property {LRState} targetState the symbols triggering the action
 * @property {int} targetStateNumber the symbols triggering the action
 * @property {(includeInputSymbols)=>string} toString returns a string representation of the action in the format: {{type}{targetStateNumber}, {input}} if the includeLookahead is true. example: S3, {a}. if the includeLookahead is false, the format will be: {{type}{targetStateNumber}}
 * @property {(other, matchInputSymbols)=>boolean} equals returns true if the toString results of the objects are the same, false otherwise.
 * @property {(matchInputSymbols)=>boolean} clone returns a deep copy of the object.
 *
 */

/**
 * @typedef LRState
 * @property {number} number
 * @property {LRItem[]} baseItems
 * @property {LRItem[]} nonBaseItems
 * @property {LRAction[]} actions
 * @property {(rules:ProductionRule[])=>LRState} calculateClosure
 * @property {()=>LRState} clone
 * @property {(includeLookahead)=>string} toString
 * @property {(other,matchLookahead)=>boolean} equals
 */
