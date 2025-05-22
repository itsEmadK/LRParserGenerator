import Grammar from './grammar.js';
import HashSet from './hashset.js';
import LALR1DFA from './lalr1dfa.js';
import LR1DFA from './lr1dfa.js';
import LRItem from './lritem.js';
import LRState from './lrstate.js';
import ParseTable from './parse-table.js';
import Production from './prod.js';

// const rules = [
//     new Production('E', ['T', "E'"]),
//     new Production("E'", []),
//     new Production("E'", ['+', 'T', "E'"]),
//     new Production('T', ['F', "T'"]),
//     new Production("T'", []),
//     new Production("T'", ['*', 'F', "T'"]),
//     new Production('F', ['id']),
//     new Production('F', ['(', 'E', ')']),
// ];

// hs.forEach((it) => console.log(it.toString()));

// const rules = [
//     new Production('E', ['E', '+', 'E']),
//     new Production('E', ['E', '*', 'E']),
//     new Production('E', ['id']),
//     new Production('E', ['id']),
//     new Production('E', ['(', 'E', ')']),
// ];
// const rules = [
//     new Production('E', ['L', '=', 'R']),
//     new Production('E', ['R']),
//     new Production('L', ['id']),
//     new Production('L', ['*', 'R']),
//     new Production('R', ['L']),
// ];
const rules = [
    new Production('E', ['E', '+', 'T']),
    new Production('E', ['T']),
    new Production('T', ['*', 'F']),
    new Production('T', ['F']),
    new Production('F', ['id']),
    new Production('F', ['(', 'E', ')']),
];

const grammar = new Grammar(rules);

grammar.rules.forEach((rule, index) => {
    console.log(index + 1, rule.toString());
});
console.log('==================================\n');

const dfa = new LR1DFA(grammar);
const lalrdfa = new LALR1DFA(grammar);

dfa.states.forEach((s, index) => {
    s.baseItems.forEach((item) => {
        console.log(index + 1, item.toString());
    });
    console.log('-----------------------');
});

console.log('========================================');

lalrdfa.states.forEach((s, index) => {
    s.baseItems.forEach((item) => {
        console.log(index + 1, item.toString());
    });
    console.log('-----------------------');
});
console.log('========================================');

const lr1pt = new ParseTable(dfa);
const lalr1pt = new ParseTable(lalrdfa);

lalrdfa.states.values()[0].actions.forEach((act) => {
    console.log(act.toString());
});
console.log('========================================');

console.log(lalr1pt.toString());
console.log(lalr1pt.hasConflict('7', '+'));
