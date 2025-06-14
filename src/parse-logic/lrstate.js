import HashSet from './hashset.js';
import LRItem from './lritem.js';
import Grammar from './grammar.js';
import LRAction from './lraction.js';

export default class LRState {
  /**
   * @type {Grammar}
   */
  #grammar;

  /**
   * @type {HashSet<LRItem>}
   */
  #baseItems = new HashSet();

  /**
   * @type {HashSet<LRItem>}
   */
  #derivedItems = new HashSet();

  /**
   * @type {HashSet<LRAction>}
   */
  #actions = new HashSet();

  /**
   *
   * @param {LRItem[]} baseItems
   */
  constructor(baseItems, grammar) {
    this.#grammar = grammar;
    baseItems.forEach((item) => {
      this.#baseItems.add(item.clone());
    });
    this.#calculateClosure();
    this.#calculateLookahead();
    this.#calculateActions();
  }

  /**
   * @type {HashSet<LRItem>}
   */
  get baseItems() {
    return new HashSet(
      this.#baseItems.values().map((item) => item.clone())
    );
  }

  /**
   * @type {HashSet<LRItem>}
   */
  get derivedItems() {
    return new HashSet(
      this.#derivedItems.values().map((item) => item.clone())
    );
  }

  get closure() {
    return new HashSet([
      ...this.#baseItems.values().map((item) => item.clone()),
      ...this.#derivedItems.values().map((item) => item.clone()),
    ]);
  }

  /**
   * @type {HashSet<LRAction>}
   */
  get actions() {
    return new HashSet([
      ...this.#actions.values().map((act) => act.clone()),
    ]);
  }

  #calculateClosure() {
    while (true) {
      const oldCount = this.#derivedItems.size;

      this.closure.forEach((item) => {
        const symbol = item.getNextSymbol();
        if (symbol) {
          if (this.#grammar.nonTerminals.has(symbol)) {
            const lhsRules = this.#grammar.getRulesForLHS(symbol);
            lhsRules.forEach((rule) => {
              const newItem = new LRItem(rule, 0, []);
              this.#derivedItems.add(newItem);
            });
          }
        }
      });

      const newCount = this.#derivedItems.size;
      if (oldCount === newCount) {
        break;
      }
    }
  }

  #calculateLookahead() {
    const calcCount = () => {
      let count = 0;
      this.#derivedItems.forEach((item) => {
        count += item.lookahead.size;
      });
      return count;
    };
    while (true) {
      const oldCount = calcCount();

      this.#derivedItems.forEach((dit) => {
        this.closure.forEach((it) => {
          if (it.getNextSymbol() === dit.rule.lhs) {
            const rest = it.rule.rhs.slice(it.dotPosition + 1);
            const restFirstSet = this.#grammar.getFirst(rest);
            dit.addToLookahead([...restFirstSet]);
            const isRestNullable = this.#grammar.isNullable(rest);
            if (isRestNullable) {
              dit.addToLookahead([...it.lookahead]);
            }
          }
        });
      });

      const newCount = calcCount();
      if (oldCount === newCount) {
        break;
      }
    }
  }

  #calculateActions() {
    this.closure.forEach((item) => {
      const symbol = item.getNextSymbol();
      if (symbol) {
        if (symbol === '$') {
          const action = new LRAction('A', [item]);
          this.#actions.add(action);
        } else {
          const actionType = this.#grammar.terminals.has(symbol)
            ? 'S'
            : 'G';
          let actionExists = false;
          this.#actions.values().forEach((a) => {
            if (
              a.type === actionType &&
              [...a.inputs.values()][0] === symbol
            ) {
              a.addOriginatingItem(item);
              actionExists = true;
            }
          });
          if (!actionExists) {
            const action = new LRAction(actionType, [item]);
            this.#actions.add(action);
          }
        }
      } else {
        const action = new LRAction('R', [item]);
        this.#actions.add(action);
      }
    });
  }

  hash() {
    let hash = '';
    this.#baseItems.forEach((item) => {
      hash += item.hash();
    });
    return hash;
  }

  hashWithoutLookahead() {
    let hash = '';
    this.#baseItems.forEach((item) => {
      hash += item.hashWithoutLookahead();
    });
    return hash;
  }

  clone() {
    return new LRState(
      [...this.#baseItems.values().map((item) => item.clone())],
      this.#grammar
    );
  }

  toString() {
    let output = '=============================\n';

    output += 'Base Items:\n';
    this.#baseItems.forEach((item) => {
      output += '\t';
      output += item.toString();
      output += '\n';
    });
    output += '_____________________________\n';

    output += 'Derived Items:\n';
    this.#derivedItems.forEach((item) => {
      output += '\t';
      output += item.toString();
      output += '\n';
    });

    output += '------------------------------\n';
    output += 'Actions: \n';
    this.#actions.forEach((action) => {
      output += `\tType: ${action.type}\n`;
      output += `\tInputs: {${[...action.inputs.values()]}}\n`;
      output += '\tOriginating Items: \n';
      action.originatingItems.forEach((item) => {
        output += `\t  ${item.toString()}\n`;
      });
      output += '\n_____________________________\n';
    });
    output += '------------------------------\n';

    output += '=============================\n';

    return output;
  }

  #transition(type, inputSymbol) {
    const targetBaseItems = this.#actions
      .values()
      .find(
        (action) => action.type === type && action.inputs.has(inputSymbol)
      )
      .originatingItems.values()
      .map(
        (item) =>
          new LRItem(item.rule, item.dotPosition + 1, [...item.lookahead])
      );
    const newState = new LRState(targetBaseItems, this.#grammar);
    return newState;
  }

  /**
   *
   * @param {string} inputSymbol
   * @returns {LRState}
   */
  goto(inputSymbol) {
    return this.#transition('G', inputSymbol);
  }

  /**
   *
   * @param {string} inputSymbol
   * @returns {LRState}
   */
  shift(inputSymbol) {
    return this.#transition('S', inputSymbol);
  }

  /**
   *
   * @param {LRState[]} states
   * @returns {LRState}
   */
  merge(states) {
    let newState = new LRState(this.baseItems, this.#grammar);
    states.forEach((state) => {
      const newBaseItems = new HashSet(
        newState.baseItems.values(),
        LRItem.hashWithoutLookahead
      );
      state.closure.forEach((item) => {
        for (let i = 0; i < newState.baseItems.size; i++) {
          const it = newState.baseItems.values()[i];
          if (it.hashWithoutLookahead() === item.hashWithoutLookahead()) {
            const mergedItem = new LRItem(it.rule, it.dotPosition, [
              ...it.lookahead,
              ...item.lookahead,
            ]);
            newBaseItems.delete(mergedItem);
            newBaseItems.add(mergedItem);
            break;
          }
        }
      });

      newState = new LRState(newBaseItems.values(), this.#grammar);
    });

    return newState;
  }

  /**
   * @type {LRState}
   */
  toSLR1State() {
    const newState = this.clone();
    newState.#baseItems.forEach((item) => {
      item.clearLookahead();
      const follow = newState.#grammar.getFollow([item.rule.lhs]);
      item.addToLookahead([...follow.values()]);
    });
    newState.#derivedItems.forEach((item) => {
      item.clearLookahead();
      const follow = newState.#grammar.getFollow([item.rule.lhs]);
      item.addToLookahead([...follow.values()]);
    });
    return newState;
  }

  /**
   * @type {LRState}
   */
  toLR0State() {
    const newState = this.clone();
    newState.#baseItems.forEach((item) => {
      item.clearLookahead();
      const { terminals } = newState.#grammar;
      item.addToLookahead([...terminals.values(), '$']);
    });
    newState.#derivedItems.forEach((item) => {
      item.clearLookahead();
      const { terminals } = newState.#grammar;
      item.addToLookahead([...terminals.values(), '$']);
    });
    return newState;
  }
}
