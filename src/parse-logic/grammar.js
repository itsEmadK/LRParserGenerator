import HashSet from './hashset.js';
import Production from './prod.js';

export default class Grammar {
    /**
     * @type {HashSet<Production>}
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
     * @type {Map<string,Set<String>>}
     */
    #followSets = new Map();

    /**
     * @type {Set<string>}
     *  */
    #nullables = new Set();

    /**
     * @type {string}
     */
    #startSymbol;

    /**
     *
     * @param {Production[]} rules
     * @param {string} startSymbol
     */
    constructor(rules, startSymbol) {
        if (startSymbol) {
            this.#startSymbol = startSymbol;
        } else {
            this.#startSymbol = rules[0].lhs;
        }

        rules.forEach((rule) => this.#rules.add(rule.clone()));

        this.#calculateNonTerminals();
        this.#calculateTerminals();
        this.#calculateNullables();
        this.#calculateFirstSets();
        this.#calculateFollowSets();
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
            this.#rules.forEach((rule) => {
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

    #calculateFollowSets() {
        const calcCount = () => {
            let count = 0;
            this.#followSets.forEach((first, symbol) => {
                count += first.size;
            });
            return count;
        };
        this.#nonTerminals.forEach((nt) => this.#followSets.set(nt, new Set()));
        this.#followSets.set(this.#startSymbol, new Set(['$']));

        while (true) {
            const oldCount = calcCount();

            this.#rules.forEach(({ lhs }) => {
                this.#rules.forEach((rule) => {
                    for (let i = 0; i < rule.rhs.length; i++) {
                        const symbol = rule.rhs[i];
                        if (symbol === lhs) {
                            const rest = rule.rhs.slice(i + 1);
                            const restFirstSet = this.getFirst(rest);
                            restFirstSet.forEach((sym) => {
                                this.#followSets.get(lhs).add(sym);
                            });
                            if (this.isNullable(rest)) {
                                const ruleLHSFollowSet = this.#followSets.get(
                                    rule.lhs,
                                );
                                ruleLHSFollowSet.forEach((sym) => {
                                    this.#followSets.get(lhs).add(sym);
                                });
                            }
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

    #calculateNullables() {
        while (true) {
            const oldCount = this.#nullables.size;

            this.#rules.forEach((rule) => {
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
        this.#rules.forEach((rule) => this.#nonTerminals.add(rule.lhs));
    }

    #calculateTerminals() {
        this.#calculateNonTerminals();
        this.#rules.forEach((rule) => {
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
            if (this.#firstSets.get(symbol)) {
                output = new Set([...output, ...this.#firstSets.get(symbol)]);
            } else {
                output = new Set([...output]);
            }
            if (this.#nullables.has(symbol)) {
                break;
            }
            if (this.#terminals.has(symbol)) {
                output.add(symbol);
                break;
            }
            if (symbol === '$') {
                output.add('$');
                break;
            }
        }
        return output;
    }

    /**
     *
     * @param {string[]} expr
     * @returns {Set<string>}
     */
    getFollow(expr) {
        let output = new Set();
        const rev = expr.slice().reverse();
        for (let i = 0; i < rev.length; i++) {
            const symbol = rev[i];
            const follow = this.#followSets.get(symbol);
            if (follow) {
                follow.forEach((sym) => {
                    output.add(sym);
                });
                const isNullable = this.isNullable([symbol]);
                if (!isNullable) {
                    break;
                }
            } else {
                return new Set();
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

    /**
     *
     * @param {string} lhs
     * @returns {HashSet<Production>}
     */
    getRulesForLHS(lhs) {
        return new HashSet(
            this.#rules
                .values()
                .filter((rule) => rule.lhs === lhs)
                .map((rule) => rule.clone()),
        );
    }

    /**
     * @type {HashSet<rule:Production>}
     */
    get rules() {
        return new HashSet(this.#rules.values().map((rule) => rule.clone()));
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
     * @type {Map<string,Set<string>>}
     */
    get followSets() {
        const output = new Map();
        this.#followSets.forEach((follow, lhs) => {
            output.set(lhs, new Set(follow));
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
        this.#rules.forEach((rule, index) => {
            output += `\t${index}: `;
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

        output += 'Follow sets: \n';
        this.#followSets.forEach((follow, lhs) => {
            output += '\t';
            const followStr = [...follow.values()].join();
            output += `${lhs}: ${followStr}`;
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

    get startSymbol() {
        return this.#startSymbol;
    }

    /**
     *
     * @param {Production} rule
     * @returns {number}
     */
    findRuleNumber(rule) {
        return this.#rules.values().findIndex((r) => r.hash() === rule.hash());
    }

    /**
     *
     * @param {number} number
     * @returns {Production}
     */
    findRuleByNumber(number) {
        return this.#rules.values()[number];
    }
}
