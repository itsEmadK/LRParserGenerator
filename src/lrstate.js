import createLRAction from './lraction.js';
import createLRItem from './lritem.js';
import './types.js';

/**
 *
 * @param {LRItem[]} baseItems
 * @param {LRItem[]} nonBaseItems
 * @param {LRAction[]} actions
 * @returns {LRState}
 */
export default function createLRState(baseItems, nonBaseItems, actions) {
    return {
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
        equals(other, matchLookahead) {
            return (
                this.toString(matchLookahead, false) ===
                other.toString(matchLookahead, false)
            );
        },
        clone() {
            return createLRState(
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
