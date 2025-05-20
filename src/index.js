import Grammar from './grammar.js';
import LRItem from './lritem.js';
import Production from './prod.js';

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

const grammar = new Grammar(rules);

console.log(grammar.toString());

console.log(grammar.getFirst(['T', "E'"]));

const item1 = new LRItem(rules[0], 0, []);
console.log(item1.hash());
const item2 = new LRItem(rules[1], 0, []);
console.log(item2.hash());
