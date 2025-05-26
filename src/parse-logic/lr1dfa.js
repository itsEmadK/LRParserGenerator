import HashSet from './hashset.js';
import Grammar from './grammar.js';
import LRState from './lrstate.js';
import Production from './prod.js';
import LRItem from './lritem.js';

export default class LR1DFA {
  /**
   * @type {Grammar}
   */
  grammar;

  /**
   * @type {HashSet<LRState>}
   */
  #states = new HashSet();

  /**
   * @type {LRState}
   */
  #startState;

  /**
   *
   * @param {Grammar} grammar
   */
  constructor(grammar) {
    this.grammar = grammar;
    this.#calculateStates();
  }

  #calculateStates() {
    const { startSymbol } = this.grammar;
    let augmentedLHS = 'S';
    while (this.grammar.nonTerminals.has(augmentedLHS)) {
      augmentedLHS += "'";
    }
    const augmentedRule = new Production(augmentedLHS, [startSymbol, '$']);
    const baseItem = new LRItem(augmentedRule, 0, []);
    const startState = new LRState([baseItem], this.grammar);
    this.#startState = startState;
    const q = [];
    q.push(this.#startState);
    while (q.length > 0) {
      const currentState = q.shift();
      const currentActs = currentState.actions;
      currentActs.forEach((act) => {
        if (act.type === 'G') {
          const newState = currentState.goto([...act.inputs.values()][0]);
          if (!this.#states.has(newState)) {
            q.push(newState);
          }
        } else if (act.type === 'S') {
          const newState = currentState.shift([...act.inputs.values()][0]);
          if (!this.#states.has(newState)) {
            q.push(newState);
          }
        }
      });
      this.#states.add(currentState);
    }
  }

  /**
   *
   * @param {number} number
   * @returns {LRState}
   */
  getStateByNumber(number) {
    return this.#states.values()[number].clone();
  }

  /**
   *
   * @param {LRState} state
   * @returns {number}
   */
  getStateNumber(state) {
    return this.#states
      .values()
      .findIndex((s) => s.hash() === state.hash());
  }

  /**
   * @type {LRState}
   */
  get startState() {
    return this.#startState.clone();
  }

  get states() {
    return new HashSet(this.#states.values().map((s) => s.clone()));
  }
}
