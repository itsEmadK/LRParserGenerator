import HashSet from './hashset.js';
import Production from './prod.js';

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

    hash() {
        const dotPositionStr = this.#dotPosition.toString().charCodeAt(0);
        const lookaheadStr = [...this.#lookahead.values()]
            .join('')
            .split('')
            .map((symbol) => symbol.charCodeAt(0))
            .join('');
        return `${this.#rule.hash()}${dotPositionStr}${lookaheadStr}`;
    }

    hashWithoutLookahead() {
        const dotPositionStr = this.#dotPosition.toString().charCodeAt(0);
        return `${this.#rule.hash()}${dotPositionStr}`;
    }

    toString() {
        let output = '================================\n';

        output += `${this.#rule.lhs} ⟶ `;
        const dottedRHS = this.#rule.rhs;
        dottedRHS.splice(this.#dotPosition, 0, '•');
        output += dottedRHS.join('');
        if (this.#lookahead.size !== 0) {
            output += ` ,{${[...this.#lookahead.values()].join()}} `;
        }
        output += '\n';

        output += '================================\n';
        return output;
    }
}
