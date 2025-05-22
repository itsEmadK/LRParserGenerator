import HashSet from './hashset.js';
import LALR1DFA from './lalr1dfa.js';
import LRState from './lrstate.js';

export default class LR0DFA extends LALR1DFA {
    /**
     * @type {HashSet<LRState>}
     */
    #states = new HashSet();

    /**
     *
     * @param {Grammar} grammar
     */
    constructor(grammar) {
        super(grammar);
        this.#calculateStates();
    }

    #calculateStates() {
        this.#states = super.states.values().map((state) => state.toLR0State());
    }

    /**
     * @type {HashSet<LRState>}
     */
    get states() {
        return new HashSet(this.#states.values().map((state) => state.clone()));
    }

    get startState() {
        return this.#states.values()[0].clone();
    }
}
