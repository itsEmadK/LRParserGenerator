import HashSet from '../util/hashset';
import type Item from './item';
import State from './state';
import type { Hashable } from '../util/types';

export type Transition = GotoTransition | ShiftTransition;
export class GotoTransition implements Hashable {
  readonly type = 'goto' as const;
  readonly source: State;
  readonly destination: State;
  readonly originatingItems: HashSet<Item>;
  readonly nonTerminal: string;
  constructor(
    source: State,
    destination: State,
    nonTerminal: string,
    originatingItems: Iterable<Item>
  ) {
    this.source = source;
    this.destination = destination;
    this.originatingItems = new HashSet([...originatingItems]);
    this.nonTerminal = nonTerminal;
  }
  hash(): string {
    return (
      this.type +
      '\n' +
      'from: \n' +
      this.source.hash() +
      '\n to \n ' +
      this.destination.hash()
    );
  }
}
export class ShiftTransition implements Hashable {
  readonly type = 'shift' as const;
  readonly source: State;
  readonly destination: State;
  readonly terminal: string;
  readonly originatingItems: HashSet<Item>;
  constructor(
    source: State,
    destination: State,
    terminal: string,
    originatingItems: Iterable<Item>
  ) {
    this.source = source;
    this.destination = destination;
    this.terminal = terminal;
    this.originatingItems = new HashSet([...originatingItems]);
  }
  hash(): string {
    return (
      this.type +
      '\n' +
      'from: \n' +
      this.source.hash() +
      '\n to \n ' +
      this.destination.hash()
    );
  }
}
