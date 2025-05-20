import HashSet from './hashset.js';
import LRItem from './lritem.js';
import Grammar from './grammar.js';

export default class LRState {
    /**
     * @type {Grammar}
     */
    #grammar;

    /**
     * @type {HashSet<LRItem>}
     */
    #baseItems = new HashSet();

    /**
     * @type {HashSet<LRItem>}
     */
    #derivedItems = new HashSet();

    /**
     *
     * @param {LRItem[]} baseItems
     */
    constructor(baseItems, grammar) {
        this.#grammar = grammar;
        baseItems.forEach((item) => {
            this.#baseItems.add(item.clone());
        });
    }

    /**
     * @type {HashSet<LRItem>}
     */
    get baseItems() {
        return new HashSet(
            this.#baseItems.values().map((item) => item.clone()),
        );
    }

    /**
     * @type {HashSet<LRItem>}
     */
    get derivedItems() {
        return new HashSet(
            this.#derivedItems.values().map((item) => item.clone()),
        );
    }

    hash() {
        let hash = '';
        this.#baseItems.forEach((item) => {
            hash += item.hash();
        });
        return hash;
    }

    hashWithoutLookahead() {
        let hash = '';
        this.#baseItems.forEach((item) => {
            hash += item.hashWithoutLookahead();
        });
        return hash;
    }

    clone() {
        return new LRState([
            ...this.#baseItems.values().map((item) => item.clone()),
        ]);
    }
}
