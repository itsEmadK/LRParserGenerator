import Grammar from './grammar';
import GrammarAnalyzer from './grammar-analyzer';
import HashSet from './hashset';
import Item from './item';
import State from './state';

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
        count += item.lookahead?.size || 0;
      });
      return count;
    };

    while (true) {
      const oldCount = calcTerminalCount();

      for (let i = 0; i < derivedItems.length; i++) {
        for (let j = 0; j < derivedItems.length + baseItems.length; j++) {
          const item = [...baseItems, ...derivedItems][j];
          if (item.lookahead) {
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
          } else {
            derivedItems[i] = new Item(
              derivedItems[i].production,
              derivedItems[i].dotPosition
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
      new HashSet([...state.baseItems]),
      new HashSet([...derivedItems])
    );
  }

  generate(baseItems: Iterable<Item>): State {
    return this.generateWithLookaheads(baseItems);
  }

  mergeStates(...states: State[]): State {
    let finalState = states[0];
    for (let i = 1; i < states.length; i++) {
      const state = states[i];
      if (
        state.withoutLookaheads().hash() ===
        finalState.withoutLookaheads().hash()
      ) {
        const mergedBaseItems = new HashSet<Item>();
        finalState.baseItems.forEach((outerItem) => {
          const lookaheadToMerge =
            state.baseItems.values.find(
              (innerItem) =>
                innerItem.withoutLookahead().hash() ===
                outerItem.withoutLookahead().hash()
            )?.lookahead || [];

          if (outerItem.lookahead) {
            const newBaseItem = new Item(
              outerItem.production,
              outerItem.dotPosition,
              [...outerItem.lookahead, ...lookaheadToMerge]
            );
            mergedBaseItems.add(newBaseItem);
          } else {
            const newBaseItem = new Item(
              outerItem.production,
              outerItem.dotPosition
            );
            mergedBaseItems.add(newBaseItem);
          }
        });

        finalState = this.generate(mergedBaseItems);
      }
    }
    return finalState;
  }

  private generateWithLookaheads(baseItems: Iterable<Item>): State {
    let state = new State(baseItems, []);
    state = this.computeDerivedItems(state);
    state = this.computeLookahead(state);
    return state;
  }
}
