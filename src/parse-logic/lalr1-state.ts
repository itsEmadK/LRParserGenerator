import HashSet from './hashset';
import Item from './item';
import State from './state';

export default class Lalr1State extends State {
  constructor(baseItems: HashSet<Item>, derivedItems: HashSet<Item>) {
    super(baseItems, derivedItems);
  }
  hash(): string {
    const items = [...this.baseItems, ...this.derivedItems];
    return items.map((item) => item.hash()).join('\n');
  }
}
