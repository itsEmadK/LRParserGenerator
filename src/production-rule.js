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
        /**
         *
         * @param {ProductionRule} other
         * @param {boolean} matchNumber
         * @returns {boolean}
         */
        equals(other, matchNumber) {
            return (
                this.LHS === other.LHS &&
                this.RHS.join('') === other.RHS.join('') &&
                (matchNumber ? this.number === other.number : true)
            );
        },
    };
}
