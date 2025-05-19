import './types.js';

/**
 *
 * @param {string} type
 * @param {Set<string>} input
 * @param {LRState} targetState
 * @returns {LRAction}
 */
export default function createLRAction(type, input, targetState) {
    return {
        type,
        input: new Set([...input]),
        targetState: targetState.clone(),
        toString(includeInputSymbols) {
            const inputSymbolsStr = `{${[...this.input].join()}}`;
            return `${this.type}${this.targetState.number} ${includeInputSymbols ? inputSymbolsStr : ''}`;
        },
        clone() {
            return createLRAction(
                this.type,
                new Set([...this.input]),
                this.targetState.clone(),
            );
        },
        /**
         *
         * @param {LRAction} other
         * @returns {boolean}
         */
        equals(other, matchTargetState) {
            return [...other.input].every(
                (sym) =>
                    [...this.input].includes(sym) &&
                    other.type === this.type &&
                    (matchTargetState
                        ? other.targetState.equals(this.targetState)
                        : true),
            );
        },
    };
}
