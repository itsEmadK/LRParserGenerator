export default class Production {
  /**
   * @type {string}
   */
  #lhs;

  /**
   * @type {string[]}
   */
  #rhs;

  /**
   *
   * @param {string} lhs
   * @param {string[]} rhs
   */
  constructor(lhs, rhs) {
    this.#lhs = lhs;
    this.#rhs = rhs.slice();
  }

  /**
   * @type {string[]} immutable
   */
  get rhs() {
    return this.#rhs.slice();
  }

  /**
   * @type {string} immutable
   */
  get lhs() {
    return this.#lhs;
  }

  hash() {
    const str = `${this.#lhs}${this.#rhs.join('')}`;

    return str
      .split('')
      .map((char) => char.charCodeAt(0))
      .join('');
  }

  clone() {
    return new Production(this.#lhs, this.#rhs);
  }

  toString() {
    return `${this.#lhs} -> ${this.#rhs.join('')}`;
  }

  static fromString(ruleStr) {
    const arrowIndex = ruleStr.trim().split(' ').indexOf('->');
    const lhs = ruleStr.trim().split(' ').slice(0, arrowIndex)[0];
    const rhs = ruleStr
      .trim()
      .split(' ')
      .slice(arrowIndex + 1);
    return new Production(lhs, rhs);
  }
}
