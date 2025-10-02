import HashSet from './hashset';
import State from './state';
import { type Transition } from './transition';
import type { ReadonlyHashSet } from './hashset';
import type { ParserType } from './types';

class NumberedState extends State {
  readonly stateNumber: number;
  constructor(
    type: ParserType,
    stateNumber: number,
    state: State
  ) {
    super(
      type,
      new HashSet([...state.baseItems]),
      new HashSet([...state.derivedItems])
    );
    this.stateNumber = stateNumber;
  }
}

type TransitionTable = (
  | { type: 'shift' | 'goto'; symbol: string }
  | undefined
)[][];
type ReadonlyTransitionTable = (
  | { type: 'shift' | 'goto'; symbol: string }
  | undefined
)[][];

export default class DFA {
  readonly type = 'lr1' as const;
  private _states: HashSet<NumberedState>;
  readonly initialState: NumberedState;
  private _transitions: HashSet<Transition>;
  readonly acceptState: NumberedState;
  private index: number = 2;
  private _transitionTable: TransitionTable = [];

  constructor(
    states: HashSet<State>,
    initialState: State,
    transitions: HashSet<Transition>,
    acceptState: State
  ) {
    this._states = new HashSet(
      [...states].map((state) => {
        if (state.hash() === initialState.hash()) {
          return new NumberedState(state.type, 1, state);
        } else {
          return new NumberedState(state.type, this.index++, state);
        }
      })
    );
    this.initialState = this._states.values.find(
      (state) => state.hash() === initialState.hash()
    )!;
    this._transitions = transitions;
    this.acceptState = this._states.values.find(
      (state) => state.hash() === acceptState.hash()
    )!;
    this.constructTransitionTable();
  }

  get states(): ReadonlyHashSet<NumberedState> {
    return this._states;
  }

  get transitions(): ReadonlyHashSet<Transition> {
    return this._transitions;
  }

  get transitionTable(): ReadonlyTransitionTable {
    return this._transitionTable;
  }

  findStateByNumber(stateNumber: number) {
    return this._states.values.find(
      (state) => state.stateNumber === stateNumber
    );
  }

  private getStateNumber(state: State): number {
    return (
      this.states.values.find((s) => state.hash() === s.hash())
        ?.stateNumber || -1
    );
  }

  private constructTransitionTable(): void {
    for (let i = 0; i <= this.index; i++) {
      const temp = [];
      for (let j = 0; j <= this.index; j++) {
        temp.push(undefined);
      }
      this._transitionTable.push(temp);
    }
    this._transitions.forEach((transition) => {
      switch (transition.type) {
        case 'goto': {
          const sourceNumber = this.getStateNumber(transition.source);
          const destinationNumber = this.getStateNumber(
            transition.destination
          );
          this._transitionTable[sourceNumber][destinationNumber] = {
            type: 'goto',
            symbol: transition.nonTerminal,
          };
          break;
        }
        case 'shift': {
          const sourceNumber = this.getStateNumber(transition.source);
          const destinationNumber = this.getStateNumber(
            transition.destination
          );
          this._transitionTable[sourceNumber][destinationNumber] = {
            type: 'shift',
            symbol: transition.terminal,
          };
          break;
        }
        default: {
          break;
        }
      }
    });
  }
}
