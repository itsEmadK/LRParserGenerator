export interface Hashable {
  hash(): string;
}

export type ParserType = 'lr1' | 'lalr1' | 'slr1' | 'lr0';

export type Action =
  | ReduceAction
  | GotoAction
  | ShiftAction
  | ShiftReduceAction
  | AcceptAction;

export type ReduceAction = {
  type: 'reduce';
  ruleNumber: number;
};
export type ShiftAction = {
  type: 'shift';
  destination: number;
};
export type GotoAction = {
  type: 'goto';
  destination: number;
};
export type AcceptAction = {
  type: 'accept';
};
export type ShiftReduceAction = {
  type: 'shift_reduce';
  destination: number;
};