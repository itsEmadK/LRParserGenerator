import HashSet from './hashset';
import Production from './prod';

export default class LRItem {
    /**
     * @type {Production}
     */
    #rule;

    /**
     * @type {number}
     */
    #dotPosition = 0;

    /**
     * @type {Set<string>}
     */
    #lookahead = new Set();

    /**
     *
     * @param {Production} rule
     * @param {number} dotPosition
     * @param {string[]} lookahead
     */
    constructor(rule, dotPosition, lookahead) {
        this.#rule = rule.clone();
        this.#dotPosition = dotPosition;
        if (lookahead) {
            this.#lookahead = new Set([...lookahead]);
        }
    }

    /**
     * @type {Production}
     */
    get rule() {
        return this.#rule.clone();
    }

    /**
     * @type {number}
     */
    get dotPosition() {
        return this.#dotPosition;
    }

    /**
     * @type {Set<string>}
     */
    get lookahead() {
        return new Set([...this.#lookahead]);
    }
}
