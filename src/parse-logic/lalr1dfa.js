import LR1DFA from './lr1dfa.js';
import LRState from './lrstate.js';
import HashSet from './hashset.js';
import Grammar from './grammar.js';

export default class LALR1DFA extends LR1DFA {
  /**
   * @type {HashSet<LRState>}
   */
  #mergedStates = new HashSet();

  /**
   *
   * @param {Grammar} grammar
   */
  constructor(grammar) {
    super(grammar);
    this.#mergeStates();
  }

  #mergeStates() {
    const commonPools = [];
    const visited = new Set();
    const originalStates = super.states;
    originalStates.forEach((outerS, outerIndex) => {
      if (visited.has(outerIndex)) {
        return;
      }
      const currentPool = new Set([outerIndex]);
      visited.add(outerIndex);
      originalStates.forEach((innerS, innerIndex) => {
        if (visited.has(innerIndex)) {
          return;
        }

        if (
          outerS.hashWithoutLookahead() === innerS.hashWithoutLookahead()
        ) {
          currentPool.add(innerIndex);
          visited.add(innerIndex);
        }
      });
      commonPools.push(currentPool);
    });

    commonPools.forEach((pool) => {
      const initialNumber = [...pool.values()][0];
      const initialState = super.getStateByNumber(initialNumber);
      const allStates = [...pool.values()].map((num) =>
        super.getStateByNumber(num)
      );
      const newState = initialState.merge(allStates);
      this.#mergedStates.add(newState);
    });
  }

  getStateByNumber(number) {
    return this.#mergedStates.values()[number].clone();
  }

  /**
   *
   * @param {LRState} state
   * @returns {number}
   */
  getStateNumber(state) {
    return this.#mergedStates
      .values()
      .findIndex(
        (s) => s.hashWithoutLookahead() === state.hashWithoutLookahead()
      );
  }

  /**
   * @returns {HashSet<LRState>}
   */
  get states() {
    return new HashSet(
      this.#mergedStates.values().map((state) => state.clone())
    );
  }

  get startState() {
    return this.#mergedStates.values()[0].clone();
  }
}
