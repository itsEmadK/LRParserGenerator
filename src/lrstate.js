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
     * @type {{type:string,inputs:string[]}[]}
     */
    #actions = [];

    /**
     *
     * @param {LRItem[]} baseItems
     */
    constructor(baseItems, grammar) {
        this.#grammar = grammar;
        baseItems.forEach((item) => {
            this.#baseItems.add(item.clone());
        });
        this.#calculateClosure();
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

    get closure() {
        return new HashSet([
            ...this.#baseItems.values().map((item) => item.clone()),
            ...this.#derivedItems.values().map((item) => item.clone()),
        ]);
    }

    #calculateClosure() {
        while (true) {
            const oldCount = this.#derivedItems.size;

            this.closure.forEach((item) => {
                const symbol = item.getNextSymbol();
                if (symbol) {
                    if (this.#grammar.nonTerminals.has(symbol)) {
                        const lhsRules = this.#grammar.getRulesForLHS(symbol);
                        lhsRules.forEach((rule) => {
                            const newItem = new LRItem(rule, 0, []);
                            this.#derivedItems.add(newItem);
                        });
                    }
                }
            });

            const newCount = this.#derivedItems.size;
            if (oldCount === newCount) {
                break;
            }
        }
    }

    #calculateLookahead() {}

    #calculateActions() {}

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
