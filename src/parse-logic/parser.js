/* eslint-disable no-constant-condition */
import ParseTable from './parse-table.js';
import Grammar from './grammar.js';

export default class Parser {
  /**@type {ParseTable} */
  #parseTable;

  /**@type {string} */
  #input = '';

  /**@type {number[]} */
  #parseStack;

  #lrTable;

  /**@type {Grammar}*/
  grammar;
  /**
   *
   * @param {ParseTable} parseTable
   * @param {Grammar} grammar
   */
  constructor(parseTable, grammar) {
    this.#parseTable = parseTable;
    this.grammar = grammar;
    this.#constructLRTable();
  }

  #constructLRTable() {
    const lrt = {};
    const rules = this.grammar.rules.values();
    rules.forEach((rule) => {
      const ruleNumber = this.grammar.findRuleNumber(rule);
      const { lhs, rhs } = rule;
      lrt[ruleNumber] = { lhs, rhsl: rhs.length };
    });
    this.#lrTable = lrt;
  }

  /**
   *
   * @param {string} input
   */
  setInput(input) {
    this.#input = `${input} $`
      .split(' ')
      .filter((token) => token && token !== ' ');
  }

  run() {
    if (this.#input.length === 0) {
      return;
    }

    this.#parseStack = [0];
    let dotPosition = 0;
    while (true) {
      const token = this.#input[dotPosition];
      const stateNumber = this.#parseStack[this.#parseStack.length - 1];
      const actions = this.#parseTable.getCell(stateNumber, token);
      if (!actions) {
        console.log('input is invalid.');
        break;
      }
      if (actions.length > 1) {
        throw new Error(
          `Conflict at state ${stateNumber} with token ${token}. Possible actions: ${actions.toString()}`
        );
      } else if (actions.length === 0) {
        console.log('input is invalid.');
        break;
      }
      const action = actions[0];
      if (action.action === 'S') {
        this.#parseStack.push(action.destination);
        dotPosition++;
      } else if (action.action === 'R') {
        const ruleNumber = action.destination;
        const { lhs, rhsl } = this.#lrTable[ruleNumber];
        for (let i = 0; i < rhsl; i++) {
          this.#parseStack.pop();
        }

        const newTop = this.#parseStack[this.#parseStack.length - 1];
        const gotoAction = this.#parseTable.getCell(newTop, lhs)[0];

        if (!gotoAction) {
          console.log('Input is invalid');
          break;
        }

        this.#parseStack.push(gotoAction.destination);
      } else if (action.action === 'A') {
        console.log('Valid!');
        return true;
      } else {
        break;
      }
    }

    return false;
  }
}
