import HashSet, { ReadonlyHashSet } from './hashset.js';
import Production from './production.js';

export default class CfgGrammar {
  declare private _productions: HashSet<Production>;
  declare private _startSymbol: string;
  private _terminals: Set<string> = new Set();
  private _nonTerminals: Set<string> = new Set();

  constructor(rules: HashSet<Production>, startSymbol: string) {
    this._productions = rules;
    this._startSymbol = startSymbol;
    this.updateNonTerminals();
    this.updateTerminals();
  }

  private updateTerminals() {
    const nt = new Set<string>();
    this._productions.forEach((prod) => {
      nt.add(prod.lhs);
    });

    this._productions.forEach((prod) => {
      prod.rhs.forEach((sym) => {
        if (!nt.has(sym)) {
          this._terminals.add(sym);
        }
      });
    });
  }

  private updateNonTerminals() {
    this._productions.forEach((prod) => {
      this._nonTerminals.add(prod.lhs);
    });
  }

  get productions(): ReadonlyHashSet<Production> {
    return this._productions;
  }

  get terminals(): ReadonlySet<string> {
    return this._terminals;
  }

  get nonTerminals(): ReadonlySet<string> {
    return this._nonTerminals;
  }
}
