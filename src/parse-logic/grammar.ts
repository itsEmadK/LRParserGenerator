import HashSet, { type ReadonlyHashSet } from './hashset.js';
import Production from './production.js';

export class NumberedProduction extends Production {
  readonly productionNumber: number;
  constructor(productionNumber: number, production: Production) {
    super(production.lhs, [...production.rhs]);
    this.productionNumber = productionNumber;
  }
}

export default class Grammar {
  readonly startSymbol: string;
  private _productions: HashSet<NumberedProduction>;
  private _terminals: Set<string> = new Set();
  private _nonTerminals: Set<string> = new Set();
  private index = 1;

  constructor(rules: Iterable<Production>, startSymbol: string) {
    this.startSymbol = startSymbol;
    this._productions = new HashSet(
      [...rules].map((rule) => new NumberedProduction(this.index++, rule))
    );
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

  isTerminal(symbol: string): boolean {
    return this._terminals.has(symbol);
  }

  isNonTerminal(symbol: string): boolean {
    return this._nonTerminals.has(symbol);
  }

  getProductionsForNonTerminal(
    nt: string
  ): ReadonlyHashSet<NumberedProduction> {
    const filteredProds = [...this._productions].filter(
      (prod) => prod.lhs === nt
    );
    return new HashSet(filteredProds);
  }

  get productions(): ReadonlyHashSet<NumberedProduction> {
    return this._productions;
  }

  get terminals(): ReadonlySet<string> {
    return this._terminals;
  }

  get nonTerminals(): ReadonlySet<string> {
    return this._nonTerminals;
  }
}
