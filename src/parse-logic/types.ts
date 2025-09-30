export interface Hashable {
  hash(): string;
}

export type Action = GotoAction | ShiftAction | ReduceAction;

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
