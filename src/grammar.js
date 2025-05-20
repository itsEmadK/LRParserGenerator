import HashSet from './hashset.js';
import Production from './prod.js';

export default class Grammar {
    /**
     * @type {HashSet<{num:number,rule:Production,hash:()=>string}>}
     */
    #rules = new HashSet();

    /**
     * @type {Set<string>}
     */
    #terminals = new Set();

    /**
     * @type {Set<string>}
     */
    #nonTerminals = new Set();

    /**
     * @type {Map<string,Set<String>>}
     */
    #firstSets = new Map();

    /**
     * @type {Set<string>}
     *  */
    #nullables = new Set();

    /**
     *
     * @param {Production[]} rules
     * @param {string[]} [nonTerminals=[]]
     * @param {string[]} [terminals=[]]
     */
    constructor(rules, terminals = [], nonTerminals = []) {
        rules.forEach((rule, index) =>
            this.#rules.add({
                num: index + 1,
                rule: rule.clone(),
                hash: () => `${index + 1}${rule.hash()}`,
            }),
        );
        if (terminals) {
            terminals.forEach((t) => this.#terminals.add(t));
        }
        if (nonTerminals) {
            nonTerminals.forEach((nt) => this.#nonTerminals.add(nt));
        }
        this.#calculateNonTerminals();
        this.#calculateTerminals();
        this.#calculateFirstSets();
        this.#calculateNullables();
    }

    #calculateFirstSets() {
        const calcCount = () => {
            let count = 0;
            this.#firstSets.forEach((first, symbol) => {
                count += first.size;
            });
            return count;
        };
        this.#nonTerminals.forEach((nt) => this.#firstSets.set(nt, new Set()));
        while (true) {
            const oldCount = calcCount();
            this.#rules.forEach(({ rule }) => {
                for (let i = 0; i < rule.rhs.length; i++) {
                    const symbol = rule.rhs[i];
                    if (this.#terminals.has(symbol)) {
                        this.#firstSets.get(rule.lhs).add(symbol);
                        break;
                    }
                    const otherFirstSet = this.#firstSets.get(symbol);
                    otherFirstSet.forEach((terminal) =>
                        this.#firstSets.get(rule.lhs).add(terminal),
                    );
                    if (!this.#nullables.has(symbol)) {
                        break;
                    }
                }
            });

            const newCount = calcCount();
            if (oldCount === newCount) {
                break;
            }
        }
    }

    #calculateNullables() {
        while (true) {
            const oldCount = this.#nullables.size;

            this.#rules.forEach(({ rule }) => {
                const isLambdaProd = rule.rhs.length === 0;
                const isRHSNullable = rule.rhs.every((symbol) =>
                    this.#nullables.has(symbol),
                );
                if (isLambdaProd || isRHSNullable) {
                    this.#nullables.add(rule.lhs);
                }
            });

            const newCount = this.#nullables.size;
            if (oldCount === newCount) {
                break;
            }
        }
    }

    #calculateNonTerminals() {
        this.#rules.forEach(({ rule }) => this.#nonTerminals.add(rule.lhs));
    }

    #calculateTerminals() {
        this.#calculateNonTerminals();
        this.#rules.forEach(({ rule }) => {
            rule.rhs.forEach((symbol) => {
                if (!this.#nonTerminals.has(symbol)) {
                    this.#terminals.add(symbol);
                }
            });
        });
    }

    /**
     *
     * @param {string[]} expr
     * @returns {Set<string>}
     */
    getFirst(expr) {
        let output = new Set();
        for (let i = 0; i < expr.length; i++) {
            const symbol = expr[i];
            output = new Set([...output, ...this.#firstSets.get(symbol)]);
            if (this.#nullables.has(symbol)) {
                break;
            }
        }
        return output;
    }

    /**
     *
     * @param {string[]} expr
     * @returns {boolean}
     */
    isNullable(expr) {
        return expr.every((symbol) => this.#nullables.has(symbol));
    }

    getRulesForLHS(lhs) {
        return this.#rules.values().filter(({ rule }) => rule.lhs === lhs);
    }

    /**
     * @type {HashSet<{num:number,rule:Production,hash:()=>string}>}
     */
    get rules() {
        return this.#rules.values().map(({ num, rule }) => ({
            num,
            rule: rule.clone(),
            hash: () => `${num + 1}${rule.hash()}`,
        }));
    }

    /**
     * @type {Map<string,Set<string>>}
     */
    get firstSets() {
        const output = new Map();
        this.#firstSets.forEach((first, lhs) => {
            output.set(lhs, new Set(first));
        });
        return output;
    }

    /**
     * @type {Set<string>}
     */
    get nullables() {
        const output = new Set();
        this.#nullables.forEach((nt) => output.add(nt));
        return output;
    }

    toString() {
        let output = '=======================================\n';
        output += 'Production Rules:\n';
        this.#rules.forEach(({ rule }) => {
            output += '\t';
            output += rule.toString();
            output += '\n';
        });
        output += '=======================================\n';

        const terminalsStr = [...this.#terminals.values()].join();
        output += `Terminals: ${terminalsStr}\n`;
        output += '=======================================\n';

        const nonTerminalsStr = [...this.#nonTerminals.values()].join();
        output += `Non-Terminals: ${nonTerminalsStr}\n`;
        output += '=======================================\n';

        output += 'First sets: \n';
        this.#firstSets.forEach((first, lhs) => {
            output += '\t';
            const firstStr = [...first.values()].join();
            output += `${lhs}: ${firstStr}`;
            output += '\n';
        });
        output += '=======================================\n';

        const nullablesStr = [...this.#nullables.values()].join();
        output += `Nullables: ${nullablesStr}\n`;
        output += '=======================================\n';

        return output;
    }

    get terminals() {
        return new Set([...this.#terminals]);
    }

    get nonTerminals() {
        return new Set([...this.#nonTerminals]);
    }
}
