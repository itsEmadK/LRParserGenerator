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
    };
}
