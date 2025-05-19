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
        LHS: LHS.slice(),
        RHS: RHS.slice(),
        toString() {
            return `${LHS} ->${number} ${RHS.join('')}`;
        },
    };
}
