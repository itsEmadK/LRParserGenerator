import DfaGenerator from '../parse-logic/dfa-generator';
import Grammar from '../parse-logic/grammar';
import GrammarAnalyzer from '../parse-logic/grammar-analyzer';
import ParseTableAnalyzer from '../parse-logic/parse-table-analyzer';
import ParseTableGenerator from '../parse-logic/parse-table-generator';
import Parser from '../parse-logic/parser';
import Production from '../parse-logic/production';

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
  initialParseTableGenerator.generate('lookahead');
export const initialParseTableAnalyzer = new ParseTableAnalyzer(
  initialParseTable
);
export const initialParser = new Parser(
  initialParseTableAnalyzer,
  initialGrammar.productions
);
export const initialTokenStream = ['id', '+', 'id', '*', 'id'];

export const initialParserStatus = initialParser.parse(initialTokenStream);
