/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useEffect,
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
import type { ParserBaseStatus, ParserStatus, ParsingStep } from '../parser/parser';
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
import type { ParseTableShape } from '../parser/parse-table';
import {
  generateParserCode,
  parseTableToJson,
  lrTableToJson,
  type ParserConfigJson,
} from '../parser/code-generator';

type OptimizationResult = {
  optimizedTable: ParseTable;
  stateMapping: Map<number, number>;
  removedStates: number[];
  keptStates: number[];
} | null;

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
  parsingHistory: ParsingStep[];
  parserType: ParserType;
  endMarker: string;
  optimizationResult: OptimizationResult;
  overrideTable: ParseTableShape | null;
};

type AppApi = {
  updateGrammarProductions: (
    newProductions: Production[],
    newStartSymbol: string
  ) => void;
  stepParser: (previousStatus?: ParserBaseStatus) => void;
  parse: (previousStatus?: ParserBaseStatus) => void;
  resetParser: () => void;
  undoParser: () => void;
  optimizeParseTable: () => void;
  updateTokenStream: (newInput: string) => void;
  updateParserType: (newType: ParserType) => void;
  generateParserCode: (includeOverrideTable?: boolean) => string;
  exportParserConfig: () => ParserConfigJson;
  setOverrideTable: (overrideTable: ParseTableShape | null) => void;
  clearOverrideTable: () => void;
};
type ParserStepAction = {
  type: 'step';
  previousStatus?: ParserBaseStatus;
};
type ParserParseAction = {
  type: 'parse';
  previousStatus?: ParserBaseStatus;
};
type ParserResetAction = {
  type: 'reset';
};
type ParserUndoAction = {
  type: 'undo';
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
type OptimizeParseTableAction = {
  type: 'optimizeParseTable';
};
type SetOverrideTableAction = {
  type: 'setOverrideTable';
  overrideTable: ParseTableShape | null;
};

type ReducerAction =
  | ParserStepAction
  | ParserParseAction
  | ParserResetAction
  | ParserUndoAction
  | OptimizeParseTableAction
  | GrammarUpdateAction
  | ParserTypeUpdateAction
  | UpdateTokenStreamAction
  | SetOverrideTableAction;

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
  parsingHistory: [],
  parserType: initialParserType,
  endMarker: initialEndMarker,
  optimizationResult: null,
  overrideTable: null,
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
export const useParserStatus = () => {
  return useContext(AppDataContext)!.parserStatus;
};
export const useParsingHistory = () => {
  return useContext(AppDataContext)!.parsingHistory;
};
export const useOptimizationResult = () => {
  return useContext(AppDataContext)!.optimizationResult;
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
export const useOverrideTable = () => {
  return useContext(AppDataContext)!.overrideTable;
};

export default function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducerFn, initialData);
  const stateRef = useRef(state);
  
  // Keep stateRef in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const api: AppApi = useMemo(() => {
    return {
      parse(previousStatus?) {
        dispatch({ type: 'parse', previousStatus });
      },
      resetParser() {
        dispatch({ type: 'reset' });
      },
      undoParser() {
        dispatch({ type: 'undo' });
      },
      optimizeParseTable() {
        dispatch({ type: 'optimizeParseTable' });
      },
      stepParser(previousStatus?) {
        dispatch({ type: 'step', previousStatus });
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
      updateTokenStream(newStream) {
        dispatch({ type: 'updateTokenStream', newInput: newStream });
      },
      generateParserCode(includeOverrideTable = false) {
        const currentState = stateRef.current;
        // Use optimized table if available, otherwise use regular table
        const tableToUse = currentState.optimizationResult?.optimizedTable || currentState.parseTable;
        const config = {
          parseTable: parseTableToJson(tableToUse),
          lrTable: lrTableToJson(currentState.grammar.productions),
          endMarker: currentState.endMarker,
          overrideTable: includeOverrideTable && currentState.overrideTable
            ? parseTableToJson(new ParseTable(currentState.overrideTable))
            : undefined,
        };
        return generateParserCode(config, includeOverrideTable);
      },
      exportParserConfig() {
        const currentState = stateRef.current;
        // Use optimized table if available, otherwise use regular table
        const tableToUse = currentState.optimizationResult?.optimizedTable || currentState.parseTable;
        return {
          parseTable: parseTableToJson(tableToUse),
          lrTable: lrTableToJson(currentState.grammar.productions),
          endMarker: currentState.endMarker,
          overrideTable: currentState.overrideTable ? parseTableToJson(new ParseTable(currentState.overrideTable)) : undefined,
        };
      },
      setOverrideTable(overrideTable) {
        dispatch({ type: 'setOverrideTable', overrideTable });
      },
      clearOverrideTable() {
        dispatch({ type: 'setOverrideTable', overrideTable: null });
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
      const parseResult = state.parser.parse(state.parserStatus);
      // Debug: log history and final status to inspect missing final step
      // eslint-disable-next-line no-console
      console.log('parseResult.history', parseResult.history);
      // eslint-disable-next-line no-console
      console.log('parseResult.finalStatus', parseResult.finalStatus);
      return { 
        ...state, 
        parserStatus: parseResult.finalStatus,
        parsingHistory: parseResult.history,
      };
    }
    case 'reset': {
      return {
        ...state,
        parserStatus: createInitialParserStatus(state.input.split(' ')),
        parsingHistory: [],
      };
    }
    case 'undo': {
      if (state.parsingHistory.length === 0) {
        // Nothing to undo
        return state;
      }
      
      // Get the last step from history (the state before the last action)
      const lastStep = state.parsingHistory[state.parsingHistory.length - 1];
      
      // Restore parser status from that step
      const restoredStatus = state.parser.restoreFromStep(
        lastStep,
        state.parserStatus.tokenStream
      );
      
      // Remove the last step from history
      const newHistory = state.parsingHistory.slice(0, -1);
      
      return {
        ...state,
        parserStatus: restoredStatus,
        parsingHistory: newHistory,
      };
    }
    case 'optimizeParseTable': {
      const optimizationResult = state.parseTable.optimize();
      return {
        ...state,
        optimizationResult,
      };
    }
    case 'step': {
      const stepNumber = state.parsingHistory.length;
      const stepResult = state.parser.stepWithHistory(state.parserStatus, stepNumber);
      return { 
        ...state, 
        parserStatus: stepResult.status,
        parsingHistory: [...state.parsingHistory, stepResult.step],
      };
    }
    case 'updateGrammarProductions': {
      try {
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
        const newParser = new Parser(newParseTable, newGrammar.productions, state.overrideTable);
        return {
          ...state,
          dfa: newDfa,
          dfaGenerator: newDfaGenerator,
          grammar: newGrammar,
          grammarAnalyzer: newGrammarAnalyzer,
          parser: newParser,
          parseTable: newParseTable,
          parserStatus: createInitialParserStatus(state.input.split(' ')),
          parsingHistory: [],
          optimizationResult: null,
          parseTableGenerator: newParseTableGenerator,
        };
      } catch (error) {
        console.error('Error updating grammar:', error);
        alert(`Error generating parse table: ${error instanceof Error ? error.message : String(error)}\n\nPlease check your grammar format.`);
        return state; // Return unchanged state on error
      }
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
        state.grammar.productions,
        state.overrideTable
      );

      return {
        ...state,
        dfa: newDfa,
        dfaGenerator: newDfaGenerator,
        parserStatus: createInitialParserStatus(state.input.split(' ')),
        parsingHistory: [],
        optimizationResult: null,
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
        parsingHistory: [],
      };
    }
    case 'setOverrideTable': {
      // Update parser with new override table
      const updatedParser = new Parser(
        state.parseTable,
        state.grammar.productions,
        action.overrideTable
      );
      return {
        ...state,
        overrideTable: action.overrideTable,
        parser: updatedParser,
        parserStatus: createInitialParserStatus(state.input.split(' ')),
        parsingHistory: [],
      };
    }
    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(`Unsupported action type: ${(action as any).type}`);
  }
}
