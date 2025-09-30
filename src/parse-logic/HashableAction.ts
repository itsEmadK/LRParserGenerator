import { Hashable } from './types';

export interface GotoAction {
  type: 'goto';
  nonTerminal: string;
  sourceStateNumber: number;
  destinationStateNumber: number;
}

export interface ShiftAction {
  type: 'shift';
  terminal: string;
  sourceStateNumber: number;
  destinationStateNumber: number;
}

export interface ReduceAction {
  type: 'reduce';
  lookaheadTerminals: Set<string>;
  ruleNumber: number;
  sourceStateNumber: number;
}

export type Action = GotoAction | ShiftAction | ReduceAction;

export default class HashableAction implements Hashable {
  value: Action;
  constructor(action: Action) {
    this.value = action;
  }

  hash(): string {
    if (this.value.type === 'goto') {
      return (
        this.value.type +
        ' ' +
        this.value.nonTerminal +
        ' ' +
        this.value.sourceStateNumber +
        ' ' +
        this.value.destinationStateNumber
      );
    } else if (this.value.type === 'shift') {
      return (
        this.value.type +
        ' ' +
        this.value.terminal +
        ' ' +
        this.value.sourceStateNumber +
        ' ' +
        this.value.destinationStateNumber
      );
    } else {
      return (
        this.value.type +
        ' ' +
        this.value.ruleNumber +
        ' ' +
        this.value.sourceStateNumber +
        ' ' +
        [...this.value.lookaheadTerminals]
      );
    }
  }
}
