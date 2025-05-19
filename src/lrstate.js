/* eslint-disable no-lonely-if */
/* eslint-disable no-else-return */
import createLRAction from './lraction.js';
import createLRItem from './lritem.js';
import './types.js';

const LRactionsSortFunction = (a, b) => {
    if (a.type < b.type) {
        return -1;
    } else if (a.type > b.type) {
        return 1;
    } else {
        if ([...a.input].sort().join('') < [...b.input].sort().join()) {
            return -1;
        } else if ([...a.input].sort().join('') > [...b.input].sort().join()) {
            return 1;
        } else {
            return 0;
        }
    }
};
const LRItemsSortFunction = (a, b) => {
    if (a.rule.LHS < b.rule.LHS) {
        return -1;
    } else if (a.rule.LHS > b.rule.LHS) {
        return 1;
    } else {
        if (a.rule.RHS.join('') < b.rule.RHS.join('')) {
            return -1;
        } else if (a.rule.RHS.join('') > b.rule.RHS.join('')) {
            return 1;
        } else {
            if (a.dotPosition < b.dotPosition) {
                return -1;
            } else if (a.dotPosition > b.dotPosition) {
                return 1;
            } else {
                const aLookaheadSorted = [...a.lookAhead].sort().join('');
                const bLookaheadSorted = [...b.lookAhead].sort().join('');
                if (aLookaheadSorted < bLookaheadSorted) {
                    return -1;
                } else if (aLookaheadSorted > bLookaheadSorted) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    }
};

/**
 *
 * @param {number} number
 * @param {LRItem[]} baseItems
 * @param {LRItem[]} nonBaseItems
 * @param {LRAction[]} actions
 * @returns {LRState}
 */
export default function createLRState(
    number,
    baseItems,
    nonBaseItems,
    actions,
) {
    return {
        number,
        baseItems: baseItems.slice().map((item) => item.clone()),
        nonBaseItems: nonBaseItems.slice().map((item) => item.clone()),
        actions: actions.slice().map((action) => action.clone()),
        toString(includeLookahead, includeActions) {
            let output = '';
            const itemsStr = [...this.baseItems, ...this.nonBaseItems]
                .map((item) => `${item.toString(includeLookahead)}\n`)
                .join('');
            output += itemsStr;
            if (includeActions) {
                output += 'Actions:\n';
                let actionsStr = this.actions.map((action) =>
                    action.toString(false),
                );
                output += actionsStr;
            }
            return output;
        },
        /**
         *
         * @param {LRState} other
         * @param {number} matchNumber
         * @param {boolean} matchNonBaseItems
         * @param {boolean} matchLookahead
         * @param {boolean} matchActions
         * @returns {boolean}
         */
        equals(
            other,
            matchNumber,
            matchNonBaseItems,
            matchLookahead,
            matchActions,
        ) {
            const otherBaseItemsSorted = [...other.baseItems].sort(
                LRItemsSortFunction,
            );
            const thisBaseItemsSorted = [...this.baseItems].sort(
                LRItemsSortFunction,
            );
            const baseItemsMatch = otherBaseItemsSorted.every((item, index) =>
                item.equals(thisBaseItemsSorted[index], matchLookahead),
            );

            const otherNonBaseItemsSorted = [...other.nonBaseItems].sort(
                LRItemsSortFunction,
            );
            const thisNonBaseItemsSorted = [...this.nonBaseItems].sort(
                LRItemsSortFunction,
            );
            const nonBaseItemsMatch = otherNonBaseItemsSorted.every(
                (item, index) =>
                    item.equals(thisNonBaseItemsSorted[index], matchLookahead),
            );

            const thisActionsSorted = [...this.actions].sort(
                LRactionsSortFunction,
            );
            const otherActionsSorted = [...other.actions].sort(
                LRactionsSortFunction,
            );
            const actionsMatch = thisActionsSorted.every(
                (act, index) => act === otherActionsSorted[index],
            );

            return (
                baseItemsMatch &&
                (matchNumber ? this.number === other.number : true) &&
                (matchNonBaseItems ? nonBaseItemsMatch : true) &&
                (matchActions ? actionsMatch : true)
            );
        },
        clone() {
            return createLRState(
                this.number,
                this.baseItems,
                this.nonBaseItems,
                this.actions,
            );
        },

        /**
         * @param {LRItem} item
         * @returns {number} index of the found item, if no such item was present, null.
         */
        indexOfItem(item) {
            const allItems = [...this.baseItems, ...this.nonBaseItems];
            for (let i = 0; i < allItems.length; i++) {
                const current = allItems[i];
                if (item.equals(current)) {
                    return i;
                }
            }
            return -1;
        },

        /**
         *
         * @param {LRAction} action
         * @returns {number}
         */
        indexOfAction(action) {
            for (let i = 0; i < this.actions.length; i++) {
                const current = this.actions[i];
                if (action.toString(true) === current.toString(true)) {
                    return i;
                }
            }
            return -1;
        },

        /**
         *
         * @param {Grammar} grammar
         * @returns {LRItem} //item with updated lookahead
         */
        calculateStateLookahead(grammar) {
            const newState = this.clone();
            function calculateItemLookaheadCount() {
                let count = 0;
                [...newState.baseItems, ...newState.nonBaseItems].forEach(
                    (item) => {
                        count += item.lookAhead.size;
                    },
                );
                return count;
            }
            while (true) {
                const oldCount = calculateItemLookaheadCount();

                [...newState.nonBaseItems].forEach((nbItem, nbIndex) => {
                    [...newState.baseItems, ...newState.nonBaseItems].forEach(
                        (item, itemIndex) => {
                            if (
                                item.rule.RHS.indexOf(nbItem.rule.LHS) ===
                                item.dotPosition
                            ) {
                                const rest = item.rule.RHS.slice(
                                    item.dotPosition + 1,
                                );
                                const restFirstSet = grammar.getFirstSet(rest);
                                let lookahead = new Set([...restFirstSet]);
                                if (grammar.isNullable(rest)) {
                                    lookahead = new Set([
                                        ...lookahead,
                                        ...item.lookAhead,
                                    ]);
                                }

                                newState.nonBaseItems[nbIndex].lookAhead =
                                    new Set([
                                        ...newState.nonBaseItems[nbIndex]
                                            .lookAhead,
                                        ...lookahead,
                                    ]);
                            }
                        },
                    );
                });

                const newCount = calculateItemLookaheadCount();
                if (oldCount === newCount) {
                    break;
                }
            }
            return newState;
        },

        /**
         *
         * @param {Grammar} grammar
         * @returns {LRState} updated state with calculated closure
         */
        calculateClosure(grammar) {
            const newState = this.clone();
            function calculateStateItemCount() {
                return newState.nonBaseItems.length;
            }
            while (true) {
                const oldCount = calculateStateItemCount();
                [...newState.baseItems, ...newState.nonBaseItems].forEach(
                    (item) => {
                        const symbol = item.rule.RHS[item.dotPosition];
                        if (grammar.nonTerminals.has(symbol)) {
                            const correspondingRules = grammar.rules.filter(
                                (rule) => rule.LHS === symbol,
                            );
                            correspondingRules.forEach((rule) => {
                                const newItem = createLRItem(rule, 0, []);
                                if (newState.indexOfItem(newItem) === -1) {
                                    newState.nonBaseItems.push(newItem);
                                }
                            });
                        }
                    },
                );
                const newCount = calculateStateItemCount();
                if (newCount === oldCount) {
                    break;
                }
            }
            return newState;
        },
    };
}
