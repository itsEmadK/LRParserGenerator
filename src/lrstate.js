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
            const itemsStr = [...this.baseItems, ...this.nonBaseItems].map(
                (item) => `${item.toString(includeLookahead)}\n`,
            );
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
    };
}
