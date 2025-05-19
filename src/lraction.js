import './types.js';
import { LRItemsSortFunction } from './lrstate.js';

/**
 *
 * @param {string} type
 * @param {Set<string>} input
 * @param {LRItem[]} targetStateBaseItems
 * @returns {LRAction}
 */
export default function createLRAction(type, input, targetStateBaseItems) {
    return {
        type,
        input: new Set([...input]),
        targetStateBaseItems: targetStateBaseItems
            ? [...targetStateBaseItems].map((item) => item.clone())
            : [],
        toString(includeInputSymbols) {
            const inputSymbolsStr = `{${[...this.input].join()}}`;
            return `Action: \n ${this.type}\n Target State Base Items: \n ${this.targetStateBaseItems.map((item) => item.toString(true)).join('\n ')} Inputs: \n ${includeInputSymbols ? inputSymbolsStr : ''}`;
        },
        clone() {
            return createLRAction(
                this.type,
                new Set([...this.input]),
                [...this.targetStateBaseItems].map((item) => item.clone()),
            );
        },
        /**
         *
         * @param {LRAction} other
         * @param {boolean} matchTargetState
         * @returns {boolean}
         */
        equals(other, matchTargetState) {
            const otherBaseItemsSorted = [...other.targetStateBaseItems].sort(
                LRItemsSortFunction,
            );
            const thisBaseItemsSorted = [...this.targetStateBaseItems].sort(
                LRItemsSortFunction,
            );
            return [...other.input].every(
                (sym) =>
                    [...this.input].includes(sym) &&
                    other.type === this.type &&
                    (matchTargetState
                        ? otherBaseItemsSorted.every((item, index) =>
                              item.equals(thisBaseItemsSorted[index]),
                          )
                        : true),
            );
        },
    };
}
