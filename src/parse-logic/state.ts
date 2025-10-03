import HashSet, { type ReadonlyHashSet } from './hashset';
import Item from './item';
import { type Hashable } from './types';

export default class State implements Hashable {
  private _baseItems: HashSet<Item>;
  private _derivedItems: HashSet<Item>;
  constructor(baseItems: Iterable<Item>, derivedItems: Iterable<Item>) {
    this._baseItems = new HashSet(baseItems);
    this._derivedItems = new HashSet(derivedItems);
  }

  hash(): string {
    const items = [...this._baseItems, ...this._derivedItems];
    return items.map((item) => item.hash()).join('\n');
  }

  withoutLookaheads(): State {
    return new State(
      this.baseItems.values.map(
        (item) => new Item(item.production, item.dotPosition),
      ),
      this.derivedItems.values.map(
        (item) => new Item(item.production, item.dotPosition),
      )
    );
  }

  get baseItems(): ReadonlyHashSet<Item> {
    return this._baseItems;
  }

  get derivedItems(): ReadonlyHashSet<Item> {
    return this._derivedItems;
  }
}
