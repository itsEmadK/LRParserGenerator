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
     * @returns {Map<string,Set<string>>}
     */
    function calculateFirstSets() {
        const firstSets = new Map();
        rules.forEach((rule) => {
            firstSets.set(rule.LHS, new Set());
        });

        function calculateFirstCount() {
            let count = 0;
            for (const [key, value] of firstSets) {
                count += value.size;
            }
            return count;
        }
        let oldCount = 0;
        while (true) {
            oldCount = calculateFirstCount();
            rules.forEach((rule) => {
                for (let i = 0; i < rule.RHS.length; i++) {
                    const symbol = rule.RHS[i];
                    if (_terminals.has(symbol)) {
                        const oldSet = new Set(firstSets.get(rule.LHS));
                        oldSet.add(symbol);
                        firstSets.set(rule.LHS, oldSet);
                        break;
                    } else {
                        const oldSet = new Set(firstSets.get(rule.LHS));
                        const newSet = new Set([
                            ...oldSet,
                            ...firstSets.get(symbol),
                        ]);
                        firstSets.set(rule.LHS, newSet);
                        if (!isNullable([symbol])) {
                            break;
                        }
                    }
                }
            });
            const newCount = calculateFirstCount();
            if (newCount === oldCount) {
                break;
            }
        }
        return firstSets;
    }
    const firstSets = calculateFirstSets();

    /**
     *
     * @param {string[]} exp
     */
    function isNullable(exp) {
        return exp.every((symbol) => nullables.has(symbol));
    }

    /**
     *
     * @param {string[]} exp
     */
    function getFirstSet(exp) {
        let first = new Set();
        for (let i = 0; i < exp.length; i++) {
            const symbol = exp[i];
            if (_terminals.has(symbol) || symbol === '$') {
                first = new Set([...first, symbol]);
                break;
            } else {
                first = new Set([...first, ...firstSets.get(symbol)]);
                if (!isNullable([symbol])) {
                    break;
                }
            }
        }
        return first;
    }

    return {
        rules: rules.slice(),
        terminals: _terminals,
        nonTerminals: _nonTerminals,
        nullables,
        firstSets,
        isNullable,
        getFirstSet,
    };
}
