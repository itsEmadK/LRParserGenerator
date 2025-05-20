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
        this.#calculateLookahead();
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

    #calculateLookahead() {
        const calcCount = () => {
            let count = 0;
            this.#derivedItems.forEach((item) => {
                count += item.lookahead.size;
            });
            return count;
        };
        while (true) {
            const oldCount = calcCount();

            this.#derivedItems.forEach((dit) => {
                this.closure.forEach((it) => {
                    if (it.getNextSymbol() === dit.rule.lhs) {
                        const rest = it.rule.rhs.slice(it.dotPosition + 1);
                        const restFirstSet = this.#grammar.getFirst(rest);
                        dit.addToLookahead([...restFirstSet]);
                        const isRestNullable = this.#grammar.isNullable(rest);
                        if (isRestNullable) {
                            dit.addToLookahead([...it.lookahead]);
                        }
                    }
                });
            });

            const newCount = calcCount();
            if (oldCount === newCount) {
                break;
            }
        }
    }

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

    toString() {
        let output = '=============================\n';

        output += 'Base Items:\n';
        this.#baseItems.forEach((item) => {
            output += '\t';
            output += item.toString();
            output += '\n';
        });
        output += '_____________________________\n';

        output += 'Derived Items:\n';
        this.#derivedItems.forEach((item) => {
            output += '\t';
            output += item.toString();
            output += '\n';
        });

        output += '=============================\n';
        return output;
    }

    // goto(){}
    // shift(){}
}
