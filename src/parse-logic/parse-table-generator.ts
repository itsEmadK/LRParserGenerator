import type DFA from './dfa';
import type Grammar from './grammar';
import type GrammarAnalyzer from './grammar-analyzer';
import type {
  Action,
  GotoAction,
  ParserType,
  ReduceAction,
  ShiftAction,
} from './types';

type ParseTable = {
  [stateNumber: number]: {
    [symbol: string]: Action | Array<Action> | undefined;
  };
};
type ReadonlyParseTable = {
  readonly [stateNumber: number]: {
    readonly [symbol: string]: Readonly<
      Action | Array<Action> | undefined
    >;
  };
};

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

  generate(parserType: ParserType): ReadonlyParseTable {
    const parseTable: ParseTable = {};
    //shift and goto:
    this.dfa.states.forEach((rowState) => {
      const rowNumber = rowState.stateNumber;
      parseTable[rowNumber] = {};
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
            const oldContent = parseTable[rowNumber][transition.symbol];
            parseTable[rowNumber][transition.symbol] = {
              ...oldContent,
              ...action,
            };
          } else {
            const action: ShiftAction = {
              type: 'shift',
              destination: columnNumber,
            };
            const oldContent = parseTable[rowNumber][transition.symbol];
            parseTable[rowNumber][transition.symbol] = {
              ...oldContent,
              ...action,
            };
          }
        }
      });
    });

    //reduce:
    this.dfa.states.forEach((state) => {
      const rowNumber = state.stateNumber;
      state.reducibleItems.forEach((item) => {
        let symbolsToReduceOver: Set<string>;
        if (parserType === 'lr1' || parserType === 'lalr1') {
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

          const oldContent = parseTable[rowNumber][terminal];
          if (oldContent) {
            if (Array.isArray(oldContent)) {
              parseTable[rowNumber][terminal] = [
                ...oldContent,
                reduceAction,
              ];
            } else {
              parseTable[rowNumber][terminal] = [oldContent, reduceAction];
            }
          } else {
            parseTable[rowNumber][terminal] = reduceAction;
          }
        });
      });
    });

    //accept:
    const acceptStateNumber = this.dfa.acceptState.stateNumber;
    parseTable[acceptStateNumber][this.grammarAnalyzer.endMarker] = {
      type: 'accept',
    };

    return parseTable;
  }
}
