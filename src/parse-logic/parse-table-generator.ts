import type DFA from './dfa';
import type Grammar from './grammar';
import type GrammarAnalyzer from './grammar-analyzer';
import ParseTable from './parse-table';
import type { ParseTableShape } from './parse-table';
import type {
  GotoAction,
  ParserType,
  ReduceAction,
  ShiftAction,
} from './types';

export default class ParseTableGenerator {
  readonly grammarAnalyzer: GrammarAnalyzer;
  readonly grammar: Grammar;
  readonly dfa: DFA;
  constructor(
    grammar: Grammar,
    grammarAnalyzer: GrammarAnalyzer,
    dfa: DFA
  ) {
    this.grammar = grammar;
    this.grammarAnalyzer = grammarAnalyzer;
    this.dfa = dfa;
  }

  generate(parserType: ParserType): ParseTable {
    const table: ParseTableShape = {};
    //shift and goto:
    this.dfa.states.forEach((rowState) => {
      const rowNumber = rowState.stateNumber;
      table[rowNumber] = {};
      this.dfa.states.forEach((columnState) => {
        const columnNumber = columnState.stateNumber;
        const transition =
          this.dfa.transitionTable[rowNumber][columnNumber];
        if (transition) {
          if (transition.type === 'goto') {
            const action: GotoAction = {
              type: 'goto',
              destination: columnNumber,
            };
            table[rowNumber][transition.symbol] = action;
          } else {
            const action: ShiftAction = {
              type: 'shift',
              destination: columnNumber,
            };
            table[rowNumber][transition.symbol] = action;
          }
        }
      });
    });

    //reduce:
    this.dfa.states.forEach((state) => {
      const rowNumber = state.stateNumber;
      state.reducibleItems.forEach((item) => {
        let symbolsToReduceOver: Set<string>;
        if (parserType === 'lalr1' || parserType === 'lr1') {
          symbolsToReduceOver = new Set(item.lookahead || []);
        } else if (parserType === 'slr1') {
          symbolsToReduceOver = new Set(
            this.grammarAnalyzer.getFollow(item.production.lhs)
          );
        } else {
          symbolsToReduceOver = new Set(this.grammar.terminals);
        }

        symbolsToReduceOver.forEach((terminal) => {
          const reduceAction: ReduceAction = {
            type: 'reduce',
            ruleNumber: item.production.productionNumber,
          };

          const oldContent = table[rowNumber][terminal];
          if (oldContent) {
            if (Array.isArray(oldContent)) {
              table[rowNumber][terminal] = [...oldContent, reduceAction];
            } else {
              table[rowNumber][terminal] = [oldContent, reduceAction];
            }
          } else {
            table[rowNumber][terminal] = reduceAction;
          }
        });
      });
    });

    //accept:
    const acceptStateNumber = this.dfa.acceptState.stateNumber;
    table[acceptStateNumber][this.grammarAnalyzer.endMarker] = {
      type: 'accept',
    };

    return new ParseTable(table);
  }
}
