import Grammar from './grammar';
import GrammarAnalyzer from './grammar-analyzer';
import HashSet from './hashset';
import Item from './item';
import State from './state';
import type { ParserType } from './types';

export default class StateGenerator {
  readonly grammar: Grammar;
  private readonly grammarAnalyzer: GrammarAnalyzer;
  constructor(grammar: Grammar) {
    this.grammar = grammar;
    this.grammarAnalyzer = new GrammarAnalyzer(grammar);
  }

  computeDerivedItems(state: State): State {
    const derivedItems = new HashSet<Item>();
    while (true) {
      const oldCount = derivedItems.size;

      [...state.baseItems, ...derivedItems].forEach((item) => {
        const symbol = item.symbolAfterDot;
        if (symbol) {
          if (this.grammar.isNonTerminal(symbol)) {
            const productions =
              this.grammar.getProductionsForNonTerminal(symbol);
            productions.forEach((prod) => {
              const newItem = new Item(prod, 0);
              derivedItems.add(newItem);
            });
          }
        }
      });

      const newCount = derivedItems.size;
      if (oldCount === newCount) {
        break;
      }
    }
    return new State(
      state.type,
      new HashSet([...state.baseItems]),
      new HashSet([...derivedItems])
    );
  }

  computeLookahead(state: State): State {
    const baseItems = [...state.baseItems];
    const derivedItems = [...state.derivedItems];

    const calcTerminalCount = () => {
      let count = 0;
      derivedItems.forEach((item) => {
        count += item.lookahead.size;
      });
      return count;
    };

    while (true) {
      const oldCount = calcTerminalCount();

      for (let i = 0; i < derivedItems.length; i++) {
        for (let j = 0; j < derivedItems.length + baseItems.length; j++) {
          const item = [...baseItems, ...derivedItems][j];
          if (item.symbolAfterDot === derivedItems[i].production.lhs) {
            const rest = [...item.exprAfterDot];
            rest.shift();
            let lookahead = new Set([
              ...this.grammarAnalyzer.getFirst(rest),
            ]);

            if (this.grammarAnalyzer.isNullable(rest)) {
              lookahead = new Set([...lookahead, ...item.lookahead]);
            }
            derivedItems[i] = new Item(
              derivedItems[i].production,
              derivedItems[i].dotPosition,
              lookahead
            );
          }
        }
      }

      const newCount = calcTerminalCount();
      if (oldCount === newCount) {
        break;
      }
    }

    return new State(
      state.type,
      new HashSet([...state.baseItems]),
      new HashSet([...derivedItems])
    );
  }

  generate(type: ParserType, baseItems: HashSet<Item>): State {
    switch (type) {
      case 'lr1': {
        return this.generateLr1State(baseItems);
      }
      case 'lalr1': {
        return this.generateLalr1State(baseItems);
      }
      case 'slr1': {
        return this.generateSlr1State(baseItems);
      }
      case 'lr0': {
        return this.generateLr0State(baseItems);
      }
    }
  }

  private generateLr1State(baseItems: HashSet<Item>): State {
    let state = new State(
      'lr1',
      new HashSet([...baseItems]),
      new HashSet()
    );
    state = this.computeDerivedItems(state);
    state = this.computeLookahead(state);
    return state;
  }

  private generateLalr1State(baseItems: HashSet<Item>): State {
    let state = new State(
      'lalr1',
      new HashSet([...baseItems]),
      new HashSet()
    );
    state = this.computeDerivedItems(state);
    state = this.computeLookahead(state);
    return state;
  }

  private generateSlr1State(baseItems: HashSet<Item>): State {
    let state = new State(
      'slr1',
      new HashSet([...baseItems]),
      new HashSet()
    );
    state = this.computeDerivedItems(state);
    const newBaseItems = state.baseItems.values.map((item) => {
      const lhsFollowSet = new Set(
        this.grammarAnalyzer.getFollow(item.production.lhs)
      );
      return new Item(item.production, item.dotPosition, lhsFollowSet);
    });
    const newDerivedItems = state.derivedItems.values.map((item) => {
      const lhsFollowSet = new Set(
        this.grammarAnalyzer.getFollow(item.production.lhs)
      );
      return new Item(item.production, item.dotPosition, lhsFollowSet);
    });
    state = new State(
      state.type,
      new HashSet(newBaseItems),
      new HashSet(newDerivedItems)
    );
    return state;
  }

  private generateLr0State(baseItems: HashSet<Item>): State {
    let state = new State(
      'lr0',
      new HashSet([...baseItems]),
      new HashSet()
    );
    state = this.computeDerivedItems(state);
    const newBaseItems = state.baseItems.values.map((item) => {
      const terminals = new Set(this.grammar.terminals);
      return new Item(item.production, item.dotPosition, terminals);
    });
    const newDerivedItems = state.derivedItems.values.map((item) => {
      const terminals = new Set(this.grammar.terminals);
      return new Item(item.production, item.dotPosition, terminals);
    });
    state = new State(
      state.type,
      new HashSet(newBaseItems),
      new HashSet(newDerivedItems)
    );
    return state;
  }
}
