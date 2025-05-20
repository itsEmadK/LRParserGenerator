import Grammar from './grammar.js';
import LRItem from './lritem.js';
import LRState from './lrstate.js';
import Production from './prod.js';

const rules = [
    new Production('E', ['L', '=', 'R']),
    new Production('E', ['R']),
    new Production('L', ['id']),
    new Production('L', ['*', 'R']),
    new Production('R', ['L']),
];

const grammar = new Grammar(rules);

// const augmentedRule = new Production("S'", ['E', '$']);
const augmentedRule = new Production('L', ['*', 'R']);
const baseItem = new LRItem(augmentedRule, 2, ['=', '$']);
const state = new LRState([baseItem], grammar);
console.log(state.hash());
grammar.rules.forEach(({ num, rule }) => {
    console.log(num, rule.toString());
});

state.derivedItems.forEach((item) => console.log(item.toString()));
console.log(state.derivedItems.size);
console.log(state.toString());
