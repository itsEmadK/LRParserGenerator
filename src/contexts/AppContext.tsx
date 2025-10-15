/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import Grammar from '../parse-logic/grammar';
import GrammarAnalyzer from '../parse-logic/grammar-analyzer';
import type DFA from '../parse-logic/dfa';
import DfaGenerator from '../parse-logic/dfa-generator';
import ParseTableGenerator from '../parse-logic/parse-table-generator';
import type { ParserType } from '../parse-logic/types';
import ParseTable from '../parse-logic/parse-table';
import Parser from '../parse-logic/parser';
import type {
  ParserBaseStatus,
  ParserStatus,
} from '../parse-logic/parser';
import {
  END_MARKER,
  initialDfa,
  initialDfaGenerator,
  initialGrammar,
  initialGrammarAnalyzer,
  initialParser,
  initialParserStatus,
  initialParserType,
  initialParseTable,
  initialParseTableGenerator,
  initialTokenStream,
} from '../util/initial-data';
import type Production from '../parse-logic/production';

type AppData = {
  grammar: Grammar;
  grammarAnalyzer: GrammarAnalyzer;
  dfa: DFA;
  dfaGenerator: DfaGenerator;
  parseTableGenerator: ParseTableGenerator;
  parseTable: ParseTable;
  parser: Parser;
  tokenStream: string[];
  parserStatus: ParserStatus;
  parserType: ParserType;
};

type AppApi = {
  updateGrammarProductions: (
    newProductions: Production[],
    newStartSymbol: string
  ) => void;
  stepParser: (previousStatus: ParserBaseStatus) => void;
  parse: (previousStatus?: ParserBaseStatus) => void;
  resetParser: () => void;
  updateTokenStream: (newStream: string[]) => void;
  updateParserType: (newType: ParserType) => void;
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
  newStream: string[];
};

type ReducerAction =
  | ParserStepAction
  | ParserParseAction
  | ParserResetAction
  | GrammarUpdateAction
  | ParserTypeUpdateAction
  | UpdateTokenStreamAction;

const initialData: AppData = {
  grammar: initialGrammar,
  grammarAnalyzer: initialGrammarAnalyzer,
  dfaGenerator: initialDfaGenerator,
  dfa: initialDfa,
  parseTableGenerator: initialParseTableGenerator,
  parseTable: initialParseTable,
  parser: initialParser,
  tokenStream: initialTokenStream,
  parserStatus: initialParserStatus,
  parserType: initialParserType,
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
export const useParseTable = () => {
  return useContext(AppDataContext)!.parseTable;
};
export const useLrTable = () => {
  return useContext(AppDataContext)!.parser.lrTable;
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
        dispatch({ type: 'updateTokenStream', newStream });
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
    progress.splice(state.parserStatus.dotPosition, 0, '•');
    const nextToken = tokenStream[0];
    return {
      dotPosition: 0,
      isAccepted: false,
      parseStack: [1],
      tokenStream,
      progress,
      nextToken,
      stateNumber: 1,
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
        parserStatus: createInitialParserStatus(state.tokenStream),
      };
    }
    case 'step': {
      const newParserStatus = state.parser.step(state.parserStatus);
      return { ...state, parserStatus: newParserStatus };
    }
    case 'updateGrammarProductions': {
      const newGrammar = new Grammar(
        action.newProductions,
        action.newStartSymbol
      );
      const newGrammarAnalyzer = new GrammarAnalyzer(
        newGrammar,
        END_MARKER
      );
      const newDfaGenerator = new DfaGenerator(newGrammar, END_MARKER);
      const newDfa = newDfaGenerator.generate(state.parserType);
      const newParseTableGenerator = new ParseTableGenerator(
        newGrammar,
        newGrammarAnalyzer,
        newDfa
      );
      const newParseTable = newParseTableGenerator.generate(
        state.parserType
      );
      const newParser = new Parser(newParseTable, newGrammar.productions);
      return {
        ...state,
        dfa: newDfa,
        dfaGenerator: newDfaGenerator,
        grammar: newGrammar,
        grammarAnalyzer: newGrammarAnalyzer,
        parser: newParser,
        parseTable: newParseTable,
        parserStatus: createInitialParserStatus(state.tokenStream),
        parseTableGenerator: newParseTableGenerator,
      };
    }
    case 'updateParserType': {
      const newDfaGenerator = new DfaGenerator(state.grammar, END_MARKER);
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
        state.grammar.productions
      );

      return {
        ...state,
        dfa: newDfa,
        dfaGenerator: newDfaGenerator,
        parserStatus: createInitialParserStatus(state.tokenStream),
        parser: newParser,
        parseTable: newParseTable,
        parserType: action.newParserType,
        parseTableGenerator: newParseTableGenerator,
      };
    }
    case 'updateTokenStream': {
      return {
        ...state,
        tokenStream: action.newStream,
        parserStatus: createInitialParserStatus(action.newStream),
      };
    }
    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(`Unsupported action type: ${(action as any).type}`);
  }
}
