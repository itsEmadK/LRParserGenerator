import HashSet from '../util/hashset';
import type Item from './item';
import State from './state';
import type { Hashable } from '../util/types';

export class Transition implements Hashable {
  readonly type: 'shift' | 'goto';
  readonly source: State;
  readonly destination: State;
  readonly symbol: string;
  readonly originatingItems: HashSet<Item>;
  constructor(
    type: 'shift' | 'goto',
    source: State,
    destination: State,
    symbol: string,
    originatingItems: Iterable<Item>
  ) {
    this.type = type;
    this.source = source;
    this.destination = destination;
    this.symbol = symbol;
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
