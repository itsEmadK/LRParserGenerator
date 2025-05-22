import LR1DFA from './lr1dfa.js';
import LRState from './lrstate.js';
import HashSet from './hashset.js';
import Grammar from './grammar.js';

export default class LALR1DFA {
    /**
     * @type {HashSet<LRState>}
     */
    #states = new HashSet();

    /**
     * @type {Grammar}
     */
    grammar;

    /**
     *
     * @param {Grammar} grammar
     */
    constructor(grammar) {
        this.grammar = grammar;
        this.#calculateStates();
    }

    #calculateStates() {
        const lr1dfa = new LR1DFA(this.grammar);
        const { states } = lr1dfa;
        const commonPools = [];
        const visited = new Set();
        states.forEach((outerS, outerIndex) => {
            if (visited.has(outerIndex)) {
                return;
            }
            const currentPool = new Set([outerIndex]);
            visited.add(outerIndex);
            states.forEach((innerS, innerIndex) => {
                if (visited.has(innerIndex)) {
                    return;
                }

                if (
                    outerS.hashWithoutLookahead() ===
                    innerS.hashWithoutLookahead()
                ) {
                    currentPool.add(innerIndex);
                    visited.add(innerIndex);
                }
            });
            commonPools.push(currentPool);
        });

        commonPools.forEach((pool) => {
            const initialNumber = [...pool.values()][0];
            const initialState = lr1dfa.getStateByNumber(initialNumber);
            const allStates = [...pool.values()].map((num) =>
                lr1dfa.getStateByNumber(num),
            );
            const newState = initialState.merge(allStates);
            this.#states.add(newState);
        });
    }

    /**
     * @returns {HashSet<LRState>}
     */
    get states() {
        return new HashSet(this.#states.values().map((state) => state.clone()));
    }

    get startState() {
        return this.#states.values()[0].clone();
    }
}
