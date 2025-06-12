/* eslint-disable no-constant-condition */
import ParseTable from './parse-table.js';
import Grammar from './grammar.js';

export default class Parser {
  /**@type {ParseTable} */
  #parseTable;

  /**@type {string} */
  #input = '';

  /**@type {number[]} */
  #parseStack = [0];

  #lrTable;

  /**@type {Grammar}*/
  grammar;

  /**@type {number} */
  #dotPosition = 0;

  #steppedToAccept = false;

  #error = null;

  #lastAction = null;

  #treeStack = [];

  get treeStack() {
    return this.#treeStack.slice().map((node) => ({ ...node }));
  }

  ERROR_CODES = {
    0: 'No action exists for next token at current state',
    1: 'Multiple actions exist for next token at current state ',
    2: 'No goto action exists for the lhs of rule',
  };

  /**@type {{parseStack:number[],dotPosition:number,nextToken:string}} */
  get currentStatus() {
    return {
      parseStack: this.#parseStack.slice(),
      dotPosition: this.#dotPosition,
      nextToken:
        this.#dotPosition < this.#input.length
          ? this.#input[this.#dotPosition]
          : null,
      accepted: this.#steppedToAccept,
      error: this.#error,
      lastAction: this.#lastAction,
      treeStack: this.treeStack,
    };
  }

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
    this.reset();
    if (this.#input.length === 0) {
      return;
    }

    this.#parseStack = [0];
    while (true) {
      const token = this.#input[this.#dotPosition];
      const stateNumber = this.#parseStack[this.#parseStack.length - 1];
      const actions = this.#parseTable.getCell(stateNumber, token);
      if (!actions) {
        this.#error = { errorCode: 0, desc: { stateNumber, token } };
        return this.currentStatus;
      }
      if (actions.length > 1) {
        this.#error = {
          errorCode: 1,
          desc: { stateNumber, token, actions },
        };
        return this.currentStatus;
      } else if (actions.length === 0) {
        this.#error = { errorCode: 0, desc: { stateNumber, token } };
        return this.currentStatus;
      }

      const action = actions[0];
      this.#lastAction = action;
      if (action.action === 'S') {
        this.#parseStack.push(action.destination);
        this.#treeStack.push({ symbol: token, children: null });
        this.#dotPosition++;
      } else if (action.action === 'R') {
        const ruleNumber = action.destination;
        const { lhs, rhsl } = this.#lrTable[ruleNumber];
        const children = this.#treeStack.splice(-rhsl);
        this.#treeStack.push({ symbol: lhs, children });
        for (let i = 0; i < rhsl; i++) {
          this.#parseStack.pop();
        }

        const newTop = this.#parseStack[this.#parseStack.length - 1];
        const gotoAction = this.#parseTable.getCell(newTop, lhs)[0];

        if (!gotoAction) {
          this.#error = {
            errorCode: 2,
            desc: { stateNumber, symbol: lhs, rule: ruleNumber },
          };
        }

        this.#parseStack.push(gotoAction.destination);
      } else if (action.action === 'A') {
        this.#steppedToAccept = true;
        this.#dotPosition++;
        this.#lastAction = action;
        return this.currentStatus;
      } else {
        break;
      }
    }

    return this.currentStatus;
  }

  step() {
    if (this.#error || this.#steppedToAccept) {
      return this.currentStatus;
    }
    const token = this.#input[this.#dotPosition];
    const stateNumber = this.#parseStack[this.#parseStack.length - 1];
    const actions = this.#parseTable.getCell(stateNumber, token);
    if (!actions) {
      this.#error = { errorCode: 0, desc: { stateNumber, token } };
      return this.currentStatus;
    }
    if (actions.length > 1) {
      this.#error = {
        errorCode: 1,
        desc: { stateNumber, token, actions },
      };
      return this.currentStatus;
    } else if (actions.length === 0) {
      this.#error = { errorCode: 0, desc: { stateNumber, token } };
      return this.currentStatus;
    }
    const action = actions[0];
    if (action.action === 'S') {
      this.#treeStack.push({ symbol: token, children: null });
      this.#parseStack.push(action.destination);
      this.#dotPosition++;
      this.#lastAction = action;
    } else if (action.action === 'R') {
      const ruleNumber = action.destination;
      this.#lastAction = action;
      const { lhs, rhsl } = this.#lrTable[ruleNumber];
      const children = this.#treeStack.splice(-rhsl);
      this.#treeStack.push({ symbol: lhs, children });
      for (let i = 0; i < rhsl; i++) {
        this.#parseStack.pop();
      }

      const newTop = this.#parseStack[this.#parseStack.length - 1];
      const gotoAction = this.#parseTable.getCell(newTop, lhs)[0];

      if (!gotoAction) {
        this.#error = {
          errorCode: 2,
          desc: { stateNumber, symbol: lhs, rule: ruleNumber },
        };
      }

      this.#parseStack.push(gotoAction.destination);
    } else if (action.action === 'A') {
      this.#steppedToAccept = true;
      this.#dotPosition++;
      this.#lastAction = action;
      return this.currentStatus;
    }
    return this.currentStatus;
  }

  reset() {
    this.#parseStack = [0];
    this.#dotPosition = 0;
    this.#steppedToAccept = false;
    this.#error = null;
    this.#lastAction = null;
    this.#treeStack = [];
  }
}
