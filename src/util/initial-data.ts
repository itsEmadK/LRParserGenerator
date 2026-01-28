import DfaGenerator from '../dfa/dfa-generator';
import Grammar from '../grammar/grammar';
import GrammarAnalyzer from '../grammar/grammar-analyzer';
import ParseTableGenerator from '../parser/parse-table-generator';
import Parser from '../parser/parser';
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
  {}, // override table
  initialGrammar.productions
);

export const initialEndMarker = '$';
export const initialInput = ['id', '+', 'id', '*', 'id', '$'].join(' ');

export const initialParserStatus = initialParser.parse(
  initialInput.split(' ')
);
