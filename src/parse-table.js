import LR1DFA from './lr1dfa.js';
import LRState from './lrstate.js';
import LRItem from './lritem.js';

export default class ParseTable {
    /**
     * @type {{stateNumber:number,{symbol:{action:string,destination:number}[]}[]}}
     */
    #table;

    /**
     * @type {LR1DFA}
     */
    #dfa;

    /**
     * @type {boolean}
     */
    #isLR1;

    /**
     *
     * @param {LR1DFA} dfa
     * @param {boolean} isLR1
     */
    constructor(dfa, isLR1) {
        this.#dfa = dfa;
        this.#isLR1 = isLR1;
        this.#generateParseTable();
    }

    #initEmptyParseTable() {
        const { states } = this.#dfa;
        this.#table = {};
        let stateNumber = 0;
        states.forEach((state) => {
            const num = `${stateNumber++}`;
            this.#table[num] = {};
            const allSymbols = [
                ...this.#dfa.grammar.nonTerminals,
                ...this.#dfa.grammar.terminals,
                '$',
            ];
            allSymbols.forEach((sym) => {
                this.#table[num][sym] = [];
            });
        });
    }

    #generateParseTable() {
        this.#initEmptyParseTable();
        const { states } = this.#dfa;
        let num = `0`;
        states.forEach((state) => {
            const { actions } = state;
            actions.forEach((action) => {
                const { type, inputs } = action;
                const targetStateBaseItems = action.originatingItems
                    .values()
                    .map(
                        (item) =>
                            new LRItem(
                                item.rule,
                                item.dotPosition + 1,
                                item.lookahead,
                            ),
                    );
                const targetState = new LRState(
                    targetStateBaseItems,
                    this.#dfa.grammar,
                );
                let targetStateNumber;
                if (type === 'R') {
                    const { rule } = action.originatingItems.values()[0];
                    const ruleNumber = this.#dfa.grammar.findRuleNumber(rule);
                    targetStateNumber = ruleNumber;
                } else {
                    targetStateNumber = states.values().findIndex((s) => {
                        let equals;
                        if (this.#isLR1) {
                            equals = targetState.hash() === s.hash();
                        } else {
                            equals =
                                targetState.hashWithoutLookahead() ===
                                s.hashWithoutLookahead();
                        }
                        return equals;
                    });
                }

                inputs.forEach((input) => {
                    this.#table[num][input].push({
                        action: type,
                        destination: targetStateNumber,
                    });
                });
            });

            num = `${+num + 1}`;
        });
    }

    /**
     *
     * @param {number} stateNumber
     * @param {string} symbol
     * @returns {{action:string,destination:number}[]}
     */
    getCell(stateNumber, symbol) {
        return this.#table[`${stateNumber}`][symbol];
    }

    /**
     *
     * @param {string} stateNumber
     * @returns {{{symbol:{action:string,destination:number}[]}[]}}
     */
    getRow(stateNumber) {
        return this.#table[`${stateNumber}`];
    }

    /**
     *
     * @param {string} stateNumber
     * @param {string} symbol
     * @returns {boolean}
     */
    isError(stateNumber, symbol) {
        return (
            !this.#table[`${stateNumber}`][symbol] ||
            this.#table[`${stateNumber}`][symbol].length === 0
        );
    }

    /**
     *
     * @param {string} stateNumber
     * @param {string} symbol
     * @returns {boolean}
     */
    hasConflict(stateNumber, symbol) {
        return (
            !this.#table[`${stateNumber}`][symbol] ||
            this.#table[`${stateNumber}`][symbol].length > 1
        );
    }

    toString() {
        let output = '';
        const allSymbols = [
            ...this.#dfa.grammar.terminals,
            '$',
            ...this.#dfa.grammar.nonTerminals,
        ];
        allSymbols.forEach((symbol) => {
            output += `\t${symbol}`;
        });

        const count = this.#dfa.states.size;
        output += `\n${'---------'.repeat(allSymbols.length)}\n`;
        for (let i = 0; i < count; i++) {
            output += `${i}\t`;
            // eslint-disable-next-line no-loop-func
            allSymbols.forEach((symbol) => {
                if (!this.isError(`${i}`, symbol)) {
                    const actionsStr = this.getCell(`${i}`, symbol)
                        .map(
                            (act) =>
                                `${act.action}${act.destination === -1 ? '' : act.destination},`,
                        )
                        .join('');
                    output += `${actionsStr}`;
                }
                output += '\t';
            });
            output += `\n${'---------'.repeat(allSymbols.length)}\n`;
        }

        return output;
    }
}
