import Grammar from './parse-logic/grammar.js';
import HashSet from './parse-logic/hashset.js';
import LALR1DFA from './parse-logic/lalr1dfa.js';
import LR0DFA from './parse-logic/lr0dfa.js';
import LR1DFA from './parse-logic/lr1dfa.js';
import LRItem from './parse-logic/lritem.js';
import LRState from './parse-logic/lrstate.js';
import ParseTable from './parse-logic/parse-table.js';
import Parser from './parse-logic/parser.js';
import Production from './parse-logic/prod.js';
import SLR1DFA from './parse-logic/slr1dfa.js';

const rules = [
  new Production('E', ['T', "E'"]),
  new Production("E'", []),
  new Production("E'", ['+', 'T', "E'"]),
  new Production('T', ['F', "T'"]),
  new Production("T'", []),
  new Production("T'", ['*', 'F', "T'"]),
  new Production('F', ['id']),
  new Production('F', ['(', 'E', ')']),
];

// hs.forEach((it) => console.log(it.toString()));

// const rules = [
//   new Production('E', ['E', '+', 'E']),
//   new Production('E', ['E', '*', 'E']),
//   new Production('E', ['id']),
//   new Production('E', ['id']),
//   // new Production('E', ['-', 'E']),
//   new Production('E', ['(', 'E', ')']),
// ];
// const rules = [
//     new Production('E', ['L', '=', 'R']),
//     new Production('E', ['R']),
//     new Production('L', ['id']),
//     new Production('L', ['*', 'R']),
//     new Production('R', ['L']),
// ];
// const rules = [
//   new Production('E', ['E', '+', 'T']),
//   new Production('E', ['T']),
//   new Production('T', ['T', '*', 'F']),
//   new Production('T', ['F']),
//   new Production('F', ['id']),
//   new Production('F', ['(', 'E', ')']),
//   new Production('F', ['-', 'E']),
// ];

const grammar = new Grammar(rules);

console.log(grammar.toString());

const dfa = new LR1DFA(grammar);
const lalrdfa = new LALR1DFA(grammar);
const slr1dfa = new SLR1DFA(grammar);
const lr0dfa = new LR0DFA(grammar);

const lr1pt = new ParseTable(dfa);
const lalr1pt = new ParseTable(lalrdfa);
const slr1pt = new ParseTable(slr1dfa, false);
const lr0pt = new ParseTable(lr0dfa, false);

const lalr1Parser = new Parser(lalr1pt, grammar);

console.log('\nLR0 Parse Table:\n');
console.log(lr0pt.toString());

console.log('\nSLR1 Parse Table:\n');
console.log(slr1pt.toString());

console.log('\nLALR1 Parse Table:\n');
console.log(lalr1pt.toString());

// console.log('\nLR1 Parse Table:\n');
// console.log(lr1pt.toString());

lalr1Parser.setInput('id + id *  id');
// console.log(lr1Parser.run());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());
console.log(lalr1Parser.step());

lalr1Parser.reset();

lalr1Parser.run();

console.log(lalr1Parser.treeStack);
