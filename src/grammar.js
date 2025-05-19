/* eslint-disable no-underscore-dangle */
import './types.js';

/**
 *
 * @param {ProductionRule[]} rules list of all production rules.
 * @param {Set<string>} terminals list of terminals; if not passed, it will be extracted from the RHS of rules; everything that is in the RHS and is not in non-terminals, is considered a terminal.
 * @param {Set<string>} nonTerminals list of non-terminals; if not passed, it will be extracted from the LHS of rules.
 * @returns {Grammar}
 */
export default function createGrammar(
    rules,
    terminals = new Set(),
    nonTerminals = new Set(),
) {
    const _nonTerminals = new Set(nonTerminals);
    if (_nonTerminals.size === 0) {
        rules.forEach((rule) => {
            _nonTerminals.add(rule.LHS);
        });
    }
    const _terminals = new Set(terminals);
    if (_terminals.size === 0) {
        rules.forEach((rule) => {
            rule.RHS.forEach((symbol) => {
                if (!_nonTerminals.has(symbol)) {
                    _terminals.add(symbol);
                }
            });
        });
    }

    /**
     * @returns {Set<string>}
     */
    function calculateNullables() {
        const nullables = new Set();
        let oldCount = 0;
        while (true) {
            oldCount = nullables.size;
            rules.forEach((rule) => {
                const isNullable =
                    rule.RHS.every((symbol) => nullables.has(symbol)) ||
                    rule.RHS.length === 0;
                if (isNullable) {
                    nullables.add(rule.LHS);
                }
            });
            const newCount = nullables.size;
            if (newCount === oldCount) {
                break;
            }
        }
        return nullables;
    }
    const nullables = calculateNullables();

    /**
     *
     * @param {string[]} exp
     */
    function isNullable(exp) {
        return exp.every((symbol) => nullables.has(symbol));
    }

    return {
        rules: rules.slice(),
        terminals: _terminals,
        nonTerminals: _nonTerminals,
        nullables,
        isNullable,
    };
}
