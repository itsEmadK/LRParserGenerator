import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import Grammar from '../grammar/grammar';
import GrammarAnalyzer from '../grammar/grammar-analyzer';
import DFA from '../dfa/dfa';
import DfaGenerator from '../dfa/dfa-generator';
import ParseTableGenerator from '../parser/parse-table-generator';
import type { ParserType } from '../util/types';
import ParseTable from '../parser/parse-table';
import Parser from '../parser/parser';
import type { ParserBaseStatus, ParserStatus } from '../parser/parser';
import {
  initialDfa,
  initialDfaGenerator,
  initialEndMarker,
  initialGrammar,
  initialGrammarAnalyzer,
  initialInput,
  initialParser,
  initialParserStatus,
  initialParserType,
  initialParseTable,
  initialParseTableGenerator,
} from '../util/initial-data';
import type Production from '../grammar/production';
import type State from '../dfa/state';

type AppData = {
  grammar: Grammar;
  grammarAnalyzer: GrammarAnalyzer;
  dfa: DFA;
  dfaGenerator: DfaGenerator;
  parseTableGenerator: ParseTableGenerator;
  parseTable: ParseTable;
  parser: Parser;
  input: string;
  parserStatus: ParserStatus;
  parserType: ParserType;
  endMarker: string;
  is_optimization: boolean,
  parseTableOverride: Object
};

type AppApi = {
  updateGrammarProductions: (
    newProductions: Production[],
    newStartSymbol: string
  ) => void;
  stepParser: (previousStatus?: ParserBaseStatus) => void;
  parse: (previousStatus?: ParserBaseStatus) => void;
  resetParser: () => void;
  updateTokenStream: (newInput: string) => void;
  updateParserType: (newType: ParserType) => void;
  updateParserOverride: (state: any, symbol: any, action: any) => void;
  ParserTablesOptimization: () => void;
  backParser: (previousStatus?: ParserBaseStatus) => void;
};
type ParserStepAction = {
  type: 'step';
  previousStatus?: ParserBaseStatus;
};
type ParserParseAction = {
  type: 'parse';
  previousStatus?: ParserBaseStatus;
};
type ParserBackAction = {
  type: 'back';
  previousStatus?: ParserBaseStatus;
};
type ParserResetAction = {
  type: 'reset';
};
type GrammarUpdateAction = {
  type: 'updateGrammarProductions';
  newProductions: Production[];
  newStartSymbol: string;
};
type ParserTypeUpdateAction = {
  type: 'updateParserType';
  newParserType: ParserType;
};
type UpdateTokenStreamAction = {
  type: 'updateTokenStream';
  newInput: string;
};
type updateParserOverride = {
  type: 'updateParserOverride';
  state: any,
  symbol: any,
  action: any
};
type ParserTablesOptimization = {
  type: 'ParserTablesOptimization';
};
type ReducerAction =
  | ParserStepAction
  | ParserBackAction
  | ParserParseAction
  | ParserResetAction
  | GrammarUpdateAction
  | ParserTypeUpdateAction
  | ParserTablesOptimization
  | updateParserOverride
  | UpdateTokenStreamAction;

const initialData: AppData = {
  grammar: initialGrammar,
  grammarAnalyzer: initialGrammarAnalyzer,
  dfaGenerator: initialDfaGenerator,
  dfa: initialDfa,
  parseTableGenerator: initialParseTableGenerator,
  parseTable: initialParseTable,
  parser: initialParser,
  input: initialInput,
  parserStatus: initialParserStatus,
  parserType: initialParserType,
  endMarker: initialEndMarker,
  is_optimization: false,
  parseTableOverride: {},
};

const AppDataContext = createContext<AppData | null>(null);
const AppApiContext = createContext<AppApi | null>(null);

export const useAppApi = () => useContext(AppApiContext);
export const useProductions = () => {
  return useContext(AppDataContext)!.grammar.productions;
};
export const useTerminals = () => {
  return useContext(AppDataContext)!.grammar.terminals;
};
export const useNonTerminals = () => {
  return useContext(AppDataContext)!.grammar.nonTerminals;
};
export const useFirst = (nonTerminal: string) => {
  return useContext(AppDataContext)!.grammarAnalyzer.getFirst(nonTerminal);
};
export const useStartSymbol = () => {
  return useContext(AppDataContext)!.grammar.startSymbol;
};
export const useFollow = (nonTerminal: string) => {
  return useContext(AppDataContext)!.grammarAnalyzer.getFollow(
    nonTerminal
  );
};
export const useIsNullable = (nonTerminal: string) => {
  return useContext(AppDataContext)!.grammarAnalyzer.isNullable(
    nonTerminal
  );
};
export const useParserOverride = () => {
  return useContext(AppDataContext)!.parseTableOverride;
};
export const useParserStatus = () => {
  return useContext(AppDataContext)!.parserStatus;
};
export const useIsOptimization = () => {
  return useContext(AppDataContext)!.is_optimization;
};
export const useParseTable = () => {
  return useContext(AppDataContext)!.parseTable;
};
export const useParserType = () => {
  return useContext(AppDataContext)!.parserType;
};
export const useLrTable = () => {
  return useContext(AppDataContext)!.parser.lrTable;
};
export const useEndMarker = () => {
  return useContext(AppDataContext)!.endMarker;
};
export const useStateOutwardTransitions = (stateNumber: number) => {
  const { dfa } = useContext(AppDataContext)!;
  return dfa.getStateOutwardTransitions(stateNumber);
};
export const useStateNumber = (state: State) => {
  const { dfa } = useContext(AppDataContext)!;
  return dfa.findStateNumber(state);
};
export const useDfa = () => {
  return useContext(AppDataContext)!.dfa;
};
export const useInput = () => {
  return useContext(AppDataContext)!.input;
};
export const useCompatibleParserTypes: () => Array<ParserType> = () => {
  const state = useContext(AppDataContext);
  const parseTableGenerator = new ParseTableGenerator(
    state!.grammar,
    state!.grammarAnalyzer,
    state!.dfa
  );
  const lr0ParseTable = parseTableGenerator.generate('lr0');
  const slr1ParseTable = parseTableGenerator.generate('slr1');
  const lalr1ParseTable = parseTableGenerator.generate('lalr1');
  const lr1ParseTable = parseTableGenerator.generate('lr1');

  const compatibles: Array<ParserType> = [];
  if (!lr0ParseTable.hasConflict()) {
    compatibles.push('lr0');
  }
  if (!slr1ParseTable.hasConflict()) {
    compatibles.push('slr1');
  }
  if (!lalr1ParseTable.hasConflict()) {
    compatibles.push('lalr1');
  }
  if (!lr1ParseTable.hasConflict()) {
    compatibles.push('lr1');
  }

  return compatibles;
};

export default function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducerFn, initialData);

  const api: AppApi = useMemo(() => {
    return {
      parse(previousStatus?) {
        dispatch({ type: 'parse', previousStatus });
      },
      resetParser() {
        dispatch({ type: 'reset' });
      },
      stepParser(previousStatus?) {
        dispatch({ type: 'step', previousStatus });
      },
      backParser(previousStatus?) {
        dispatch({ type: 'back', previousStatus });
      },
      updateGrammarProductions(newProductions, newStartSymbol) {
        dispatch({
          type: 'updateGrammarProductions',
          newProductions,
          newStartSymbol,
        });
      },
      updateParserType(newParserType) {
        dispatch({ type: 'updateParserType', newParserType });
      },
      ParserTablesOptimization() {
        dispatch({ type: 'ParserTablesOptimization' });
      },
      updateTokenStream(newStream) {
        dispatch({ type: 'updateTokenStream', newInput: newStream });
      },
      updateParserOverride(state: any, symbol: any, action: any) {
        dispatch({ type: 'updateParserOverride', state, symbol, action });
      },
    };
  }, []);
  return (
    <AppDataContext.Provider value={state}>
      <AppApiContext.Provider value={api}>
        {children}
      </AppApiContext.Provider>
    </AppDataContext.Provider>
  );
}

function reducerFn(state: AppData, action: ReducerAction): AppData {
  function createInitialParserStatus(tokenStream: string[]): ParserStatus {
    const progress = tokenStream.slice();
    progress.splice(0, 0, '•');
    const nextToken = tokenStream[0];
    return {
      dotPosition: 0,
      isAccepted: false,
      parseStack: [1],
      tokenStream,
      progress,
      nextToken,
      stateNumber: 1,
      treeStack: [],
    };
  }

  switch (action.type) {
    case 'parse': {
      const newParserStatus = state.parser.parse(state.parserStatus);
      return { ...state, parserStatus: newParserStatus };
    }
    case 'reset': {
      return {
        ...state,
        parserStatus: createInitialParserStatus(state.input.split(' ')),
      };
    }
    case 'back': {
      const previousParserStatus = state.parser.back();
      if (previousParserStatus) {
        return previousParserStatus
          ? { ...state, parserStatus: previousParserStatus }
          : state;
      } else {
        return {
          ...state,
          parserStatus: createInitialParserStatus(state.input.split(' ')),
        };
      }
    }
    case 'step': {
      const newParserStatus = state.parser.step(state.parserStatus);
      return { ...state, parserStatus: newParserStatus };
    }
    case 'ParserTablesOptimization': {
      const newDfaGenerator = new DfaGenerator(
        state.grammar,
        state.endMarker
      );
      const newDfa = newDfaGenerator.generate(state.parserType);
      const newParseTableGenerator = new ParseTableGenerator(
        state.grammar,
        state.grammarAnalyzer,
        newDfa
      );
      var newParseTable = newParseTableGenerator.generate(
        state.parserType
      ).table;
      //  && state.parserType == 'lalr1'
      if (!state.is_optimization) {
        for (const _ in newParseTable) {
          for (const row in newParseTable) {
            var is_all_reduce = true
            var num_reduce = 0
            for (const cell in newParseTable[row]) {
              const action: any = newParseTable[row][cell];
              if (!action) continue;
              num_reduce = action.ruleNumber
              if (action.type != 'reduce') {
                is_all_reduce = false
                break
              }
            }
            var has_goto;
            if (is_all_reduce) {
              has_goto = false
              for (const row_in in newParseTable) {
                for (const cell_in in newParseTable[row_in]) {
                  const action_in: any = newParseTable[row_in][cell_in];
                  if (!action_in) continue;
                  if (action_in.type == 'goto') {
                    if (action_in.destination == row) {
                      has_goto = true
                      break
                    }
                  }
                }
              }
              if (has_goto == false) {
                delete newParseTable[row];
                for (const row_SR in newParseTable) {
                  for (const cell_SR in newParseTable[row_SR]) {
                    var action_SR: any = newParseTable[row_SR][cell_SR];
                    if (!action_SR) continue;
                    if (action_SR.type == 'shift') {
                      if (action_SR.destination == row) {
                        action_SR.type = 'shift_reduce'
                        action_SR.destination = num_reduce
                      }
                    }
                  }
                }
                break;
              }
            }
          }
        }
      }
      return {
        ...state,
        parseTable: new ParseTable(newParseTable),
        is_optimization: !state.is_optimization,
      };
    }
    case 'updateParserOverride': {
      var overrideTable: any = state.parseTableOverride
      if (!action.action) {
        if (overrideTable[action.state]) {
          delete overrideTable[action.state][action.symbol];
          if (Object.keys(overrideTable[action.state]).length === 0) delete overrideTable[action.state];
          return {
            ...state,
            parseTableOverride: overrideTable
          };
        } else {
          return {
            ...state,
            parseTableOverride: overrideTable
          };
        }
      }
      overrideTable[action.state] ??= {};
      overrideTable[action.state][action.symbol] = action.action;
      const newDfaGenerator = new DfaGenerator(
        state.grammar,
        state.endMarker
      );
      const newDfa = newDfaGenerator.generate(state.parserType);
      const newParseTableGenerator = new ParseTableGenerator(
        state.grammar,
        state.grammarAnalyzer,
        newDfa
      );
      const newParseTable = newParseTableGenerator.generate(
        state.parserType
      );
      const newParser = new Parser(
        newParseTable,
        overrideTable,
        state.grammar.productions
      );
      return {
        ...state,
        dfa: newDfa,
        dfaGenerator: newDfaGenerator,
        parserStatus: createInitialParserStatus(state.input.split(' ')),
        parser: newParser,
        parseTable: newParseTable,
        parseTableGenerator: newParseTableGenerator,
        parseTableOverride: overrideTable
      };
    }
    case 'updateGrammarProductions': {
      const newGrammar = new Grammar(
        action.newProductions,
        action.newStartSymbol
      );
      const newGrammarAnalyzer = new GrammarAnalyzer(
        newGrammar,
        state.endMarker
      );
      const newDfaGenerator = new DfaGenerator(
        newGrammar,
        state.endMarker
      );
      const newDfa = newDfaGenerator.generate(state.parserType);
      const newParseTableGenerator = new ParseTableGenerator(
        newGrammar,
        newGrammarAnalyzer,
        newDfa
      );
      const newParseTable = newParseTableGenerator.generate(
        state.parserType
      );
      const newParser = new Parser(newParseTable,{}, newGrammar.productions);
      return {
        ...state,
        dfa: newDfa,
        dfaGenerator: newDfaGenerator,
        grammar: newGrammar,
        grammarAnalyzer: newGrammarAnalyzer,
        parser: newParser,
        parseTable: newParseTable,
        parserStatus: createInitialParserStatus(state.input.split(' ')),
        parseTableGenerator: newParseTableGenerator,
      };
    }
    case 'updateParserType': {
      const newDfaGenerator = new DfaGenerator(
        state.grammar,
        state.endMarker
      );
      const newDfa = newDfaGenerator.generate(action.newParserType);
      const newParseTableGenerator = new ParseTableGenerator(
        state.grammar,
        state.grammarAnalyzer,
        newDfa
      );
      const newParseTable = newParseTableGenerator.generate(
        action.newParserType
      );
      const newParser = new Parser(
        newParseTable,
        {},
        state.grammar.productions
      );

      return {
        ...state,
        dfa: newDfa,
        dfaGenerator: newDfaGenerator,
        parserStatus: createInitialParserStatus(state.input.split(' ')),
        parser: newParser,
        parseTable: newParseTable,
        parserType: action.newParserType,
        parseTableGenerator: newParseTableGenerator,
      };
    }
    case 'updateTokenStream': {
      return {
        ...state,
        input: action.newInput,
        parserStatus: createInitialParserStatus(
          action.newInput
            .trim()
            .split(' ')
            .filter((token) => token.length > 0)
        ),
      };
    }
    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(`Unsupported action type: ${(action as any).type}`);
  }
}