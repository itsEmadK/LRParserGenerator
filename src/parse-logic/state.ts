import HashSet, { type ReadonlyHashSet } from './hashset';
import Item from './item';
import { type Hashable, type ParserType } from './types';

export default class State implements Hashable {
  private _baseItems: HashSet<Item>;
  private _derivedItems: HashSet<Item>;
  readonly type: ParserType;
  constructor(
    type: ParserType,
    baseItems: Iterable<Item>,
    derivedItems: Iterable<Item>
  ) {
    this.type = type;
    this._baseItems = new HashSet(baseItems);
    this._derivedItems = new HashSet(derivedItems);
  }

  hash(includeItemsLookahead: boolean = true): string {
    const items = [...this._baseItems, ...this._derivedItems];
    if (this.type === 'lr1' && includeItemsLookahead) {
      return items.map((item) => item.hash()).join('\n');
    } else {
      return items.map((item) => item.hashWithoutLookahead()).join('\n');
    }
  }

  get baseItems(): ReadonlyHashSet<Item> {
    return this._baseItems;
  }

  get derivedItems(): ReadonlyHashSet<Item> {
    return this._derivedItems;
  }
}
