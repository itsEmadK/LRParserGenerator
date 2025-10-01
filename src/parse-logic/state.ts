import HashSet, { type ReadonlyHashSet } from './hashset';
import Item from './item';
import { type Hashable } from './types';

export default class State implements Hashable {
  private _baseItems: HashSet<Item>;
  private _derivedItems: HashSet<Item>;
  constructor(baseItems: HashSet<Item>, derivedItems: HashSet<Item>) {
    this._baseItems = baseItems;
    this._derivedItems = derivedItems;
  }

  hash(): string {
    const items = [...this._baseItems, ...this._derivedItems];
    return items.map((item) => item.hashWithoutLookahead()).join('\n');
  }

  get baseItems(): ReadonlyHashSet<Item> {
    return this._baseItems;
  }

  get derivedItems(): ReadonlyHashSet<Item> {
    return this._derivedItems;
  }
}
