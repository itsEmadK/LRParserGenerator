import DfaGenerator from '../dfa/dfa-generator';
import Grammar from '../grammar/grammar';
import GrammarAnalyzer from '../grammar/grammar-analyzer';
import ParseTableGenerator from '../parser/parse-table-generator';
import Parser from '../parser/parser';
import type { ParserStatus } from '../parser/parser';
import Production from '../grammar/production';

export const END_MARKER = '$';
const initialProductions = [
  new Production('E', ['T', "E'"]),
  new Production("E'", []),
  new Production("E'", ['+', 'T', "E'"]),
  new Production('T', ['F', "T'"]),
  new Production("T'", []),
  new Production("T'", ['*', 'F', "T'"]),
  new Production('F', ['id']),
  new Production('F', ['(', 'E', ')']),
];
export const initialGrammar = new Grammar(initialProductions, 'E');
export const initialGrammarAnalyzer = new GrammarAnalyzer(
  initialGrammar,
  END_MARKER
);
export const initialDfaGenerator = new DfaGenerator(
  initialGrammar,
  END_MARKER
);
export const initialParserType = 'lalr1';
export const initialDfa = initialDfaGenerator.generate(initialParserType);
export const initialParseTableGenerator = new ParseTableGenerator(
  initialGrammar,
  initialGrammarAnalyzer,
  initialDfa
);
export const initialParseTable =
  initialParseTableGenerator.generate(initialParserType);
export const initialParser = new Parser(
  initialParseTable,
  initialGrammar.productions
);

export const initialEndMarker = '$';
export const initialInput = ['id', '+', 'id', '*', 'id', '$'].join(' ');

// Create initial parser status without parsing (to avoid pre-parsing)
const initialTokenStream = initialInput.split(' ');
const initialProgress = initialTokenStream.slice();
initialProgress.splice(0, 0, '•');
const initialNextToken = initialTokenStream[0];
export const initialParserStatus: ParserStatus = {
  dotPosition: 0,
  isAccepted: false,
  parseStack: [1],
  tokenStream: initialTokenStream,
  progress: initialProgress,
  nextToken: initialNextToken,
  stateNumber: 1,
  treeStack: [],
};
