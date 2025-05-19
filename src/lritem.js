import './types.js';

/**
 *
 * @param {ProductionRule} rule
 * @param {number} dotPosition
 * @param {Set<string>} lookAhead
 * @returns {LRItem}
 */
export default function createLRItem(rule, dotPosition, lookAhead) {
    return {
        rule: rule.clone(),
        dotPosition,
        lookAhead: new Set(...lookAhead),
        toString(includeLookahead) {
            const dottedRHS = [...this.rule.RHS];
            dottedRHS.splice(this.dotPosition, 0, '.');
            const lookAheadString = `{${this.lookAhead.join()}}`;
            return `${this.rule.LHS} -> ${dottedRHS.join('')} ${includeLookahead ? lookAheadString : ''}`;
        },
        equals(other) {
            return other.toString() === this.toString();
        },
        clone(){
            return createLRItem(this.rule, this.dotPosition, this.lookAhead)
        }
    };
}
