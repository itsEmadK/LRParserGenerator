import HashSet from './hashset.js';
import LRItem from './lritem.js';

export default class LRAction {
  /**
   * @type {string}
   */
  #type;

  /**
   * @type {HashSet<LRItem>}
   */
  #originatingItems;

  /**
   *
   * @param {string} type
   * @param {LRItem[]} originatingItems
   */
  constructor(type, originatingItems) {
    this.#type = type;
    this.#originatingItems = new HashSet([
      ...originatingItems.map((item) => item.clone()),
    ]);
  }

  get type() {
    return this.#type;
  }

  /**
   * @returns {HashSet<LRItem>}
   */
  get originatingItems() {
    return new HashSet([
      ...this.#originatingItems.values().map((item) => item.clone()),
    ]);
  }

  /**
   * @type {Set<string>}
   */
  get inputs() {
    const symbols = new Set();
    if (this.#type === 'S' || this.#type === 'G') {
      this.#originatingItems.forEach((item) => {
        symbols.add(item.getNextSymbol());
      });
    } else if (this.#type === 'A') {
      symbols.add('$');
    } else {
      const item = this.#originatingItems.values()[0];
      [...item.lookahead.values()].forEach((symbol) => {
        symbols.add(symbol);
      });
    }
    return symbols;
  }

  /**
   * @returns {string}
   */
  hash() {
    let hash = this.#type.charCodeAt(0);
    this.#originatingItems.forEach((item) => {
      hash += item.hash();
    });
    return hash;
  }

  /**
   *
   * @returns {LRAction}
   */
  clone() {
    return new LRAction(this.#type, [...this.#originatingItems.values()]);
  }

  toString() {
    let output = `Type: ${this.#type}, Inputs:{${[...this.inputs.values()]}}\n`;
    output += `Originating Items: ${[...this.#originatingItems.values()]}\n`;
    return output;
  }

  /**
   *
   * @param {LRItem} item
   */
  addOriginatingItem(item) {
    this.#originatingItems.add(item.clone());
  }
}
