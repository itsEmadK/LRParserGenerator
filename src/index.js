import Grammar from './grammar.js';
import HashSet from './hashset.js';
import LR1DFA from './lr1dfa.js';
import LRItem from './lritem.js';
import LRState from './lrstate.js';
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
const rules = [
    new Production('E', ['L', '=', 'R']),
    new Production('E', ['R']),
    new Production('L', ['id']),
    new Production('L', ['*', 'R']),
    new Production('R', ['L']),
];

const grammar = new Grammar(rules);

grammar.rules.forEach((rule) => {
    console.log(rule.toString());
});
console.log('==================================\n');

const dfa = new LR1DFA(grammar);
dfa.states.forEach((s) => {
    s.baseItems.forEach((item) => {
        console.log(item.toString());
    });
    console.log('-----------------------');
});

console.log(dfa.states.size);
