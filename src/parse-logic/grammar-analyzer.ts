import Grammar from './grammar.js';

export default class GrammarAnalyzer {
  declare grammar: Grammar;
  private _firstSets: Map<string, Set<string>> = new Map();
  private _followSets: Map<string, Set<string>> = new Map();
  private _nullables: Set<string> = new Set();
  declare private _endMarker: string;

  constructor(grammar: Grammar, endMarker: string = '$') {
    this.grammar = grammar;
    this._endMarker = endMarker;
    this.updateNullables();
    this.updateFirstSets();
    this.updateFollowSets();
  }

  updateFirstSets() {
    this._firstSets.clear();

    const calcSymbolCount = () => {
      let count = 0;
      this._firstSets.forEach((firstSet) => {
        count += firstSet.size;
      });
      return count;
    };

    while (true) {
      const oldCount = calcSymbolCount();

      const { productions } = this.grammar;
      productions.forEach((prod) => {
        const currentLhsFirstSet =
          this._firstSets.get(prod.lhs) || new Set<string>();

        for (let i = 0; i < prod.rhs.length; i++) {
          const symbol = prod.rhs[i];
          if (this.grammar.isTerminal(symbol)) {
            this._firstSets.set(
              prod.lhs,
              new Set([...currentLhsFirstSet, symbol])
            );
            break;
          } else {
            const currentSymbolFirstSet =
              this._firstSets.get(symbol) || new Set<string>();

            const newFirstSet = new Set([
              ...currentLhsFirstSet,
              ...currentSymbolFirstSet,
            ]);
            this._firstSets.set(prod.lhs, newFirstSet);
            if (!this.isNullable(symbol)) {
              break;
            }
          }
        }
      });

      const newCount = calcSymbolCount();
      if (oldCount === newCount) {
        //No changes have happened, we're done.
        break;
      }
    }
  }

  updateFollowSets() {
    this._followSets.clear();

    const calcSymbolCount = () => {
      let count = 0;
      this._followSets.forEach((followSet) => {
        count += followSet.size;
      });
      return count;
    };

    this._followSets.set(
      this.grammar.startSymbol,
      new Set([this._endMarker])
    );

    while (true) {
      const oldCount = calcSymbolCount();

      this.grammar.nonTerminals.forEach((nt) => {
        this.grammar.productions.forEach((prod) => {
          const lhsIndexInRhs = prod.rhs.findIndex(
            (symbol) => symbol === nt
          );
          const lhsExistsInRhs = lhsIndexInRhs !== -1;
          if (lhsExistsInRhs) {
            const lhsOldFollowSet = () =>
              this._followSets.get(nt) || new Set<string>();

            const rhsAfterLhs = prod.rhs.slice(lhsIndexInRhs + 1);
            const lhsIsLastInRhs = rhsAfterLhs.length === 0;

            const rhsAfterLhsFirstSet = this.getFirst(rhsAfterLhs);
            this._followSets.set(
              nt,
              new Set([...lhsOldFollowSet(), ...rhsAfterLhsFirstSet])
            );

            if (lhsIsLastInRhs || this.isNullable(rhsAfterLhs)) {
              const currentProductionLhsFollowSet =
                this._followSets.get(prod.lhs) || new Set<string>();
              this._followSets.set(
                nt,
                new Set([
                  ...lhsOldFollowSet(),
                  ...currentProductionLhsFollowSet,
                ])
              );
            }
          }
        });
      });

      const newCount = calcSymbolCount();
      if (oldCount === newCount) {
        break;
      }
    }
  }

  updateNullables() {
    this._nullables.clear();
    while (true) {
      const oldCount = this._nullables.size;

      const { productions } = this.grammar;
      productions.forEach((prod) => {
        if (prod.rhs.length === 0) {
          this._nullables.add(prod.lhs);
        } else if (
          prod.rhs.every((symbol) => this._nullables.has(symbol))
        ) {
          this._nullables.add(prod.lhs);
        }
      });

      const newCount = this._nullables.size;
      if (oldCount === newCount) {
        break;
      }
    }
  }

  isNullable(symbol: string): boolean;
  isNullable(expr: string[]): boolean;
  isNullable(input: string | string[]): boolean {
    if (Array.isArray(input)) {
      return (
        input.every((sym) => this._nullables.has(sym)) ||
        input.length === 0
      );
    } else {
      return this._nullables.has(input);
    }
  }

  getFirst(symbol: string): ReadonlySet<string>;
  getFirst(expr: string[]): ReadonlySet<string>;
  getFirst(input: string | string[]): ReadonlySet<string> {
    if (Array.isArray(input)) {
      let first = new Set<string>();
      for (let i = 0; i < input.length; i++) {
        const symbol = input[i];
        first = new Set([...first, ...this.getFirst(symbol)]);
        if (!this.isNullable(symbol)) {
          break;
        }
      }
      return first;
    } else {
      if (this.grammar.isTerminal(input)) {
        return new Set([input]);
      } else {
        return this.firstSets.get(input) || new Set();
      }
    }
  }

  getFollow(symbol: string): ReadonlySet<string>;
  getFollow(expr: string[]): ReadonlySet<string>;
  getFollow(input: string | string[]): ReadonlySet<string> {
    if (Array.isArray(input)) {
      const reversedExpr = input.slice().reverse();
      let follow = new Set<string>();
      for (let i = 0; i < reversedExpr.length; i++) {
        const symbol = reversedExpr[i];
        follow = new Set([
          ...follow,
          ...(this._followSets.get(symbol) || new Set<string>()),
        ]);
        if (!this.isNullable(symbol)) {
          break;
        }
      }
      return follow;
    } else {
      return this._followSets.get(input) || new Set<string>();
    }
  }

  get endMarker(): string {
    return this._endMarker;
  }

  get nullables(): ReadonlySet<string> {
    return this._nullables;
  }

  get firstSets(): ReadonlyMap<string, ReadonlySet<string>> {
    return this._firstSets;
  }

  get followSets(): ReadonlyMap<string, ReadonlySet<string>> {
    return this._followSets;
  }
}
