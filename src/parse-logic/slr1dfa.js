import HashSet from './hashset.js';
import LALR1DFA from './lalr1dfa.js';
import LRState from './lrstate.js';

export default class SLR1DFA extends LALR1DFA {
  /**
   * @type {HashSet<LRState>}
   */
  #states = new HashSet();

  constructor(grammar) {
    super(grammar);
    this.#calculateLookahead();
  }

  #calculateLookahead() {
    this.#states = new HashSet(
      super.states.values().map((state) => state.toSLR1State())
    );
  }

  /**
   * @returns {HashSet<LRState>}
   */
  get states() {
    return new HashSet(
      this.#states.values().map((state) => state.clone())
    );
  }

  get startState() {
    return this.#states.values()[0].clone();
  }
}
