import './types.js';

/**
 *
 * @param {number} number
 * @param {string} LHS
 * @param {string[]} RHS
 * @returns {ProductionRule}
 */
export default function createProductionRule(number, LHS, RHS) {
    return {
        number,
        LHS,
        RHS: RHS.slice(),
        toString() {
            return `${this.LHS} ->${this.number} ${this.RHS.join('')}`;
        },
        clone() {
            return createProductionRule(this.number, this.LHS, this.RHS);
        },
        equals(other) {
            return this.toString() === other.toString();
        },
    };
}
