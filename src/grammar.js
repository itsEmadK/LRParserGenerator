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
    return {
        rules: rules.slice(),
        terminals: _terminals,
        nonTerminals: _nonTerminals,
    };
}
