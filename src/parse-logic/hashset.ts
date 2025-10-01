import type { Hashable } from './types';

type MapItem<T> = {
  index: number;
  item: T;
};

export default class HashSet<T extends Hashable> {
  private map = new Map<string, MapItem<T>>();
  private counter = 0;

  constructor(items: T[] = []) {
    items.forEach((item) => {
      this.add(item);
    });
  }

  /**returns true if item.hash() is present in the set. */
  has(item: T): boolean {
    const bucket = this.map.get(item.hash());
    return !!bucket;
  }

  add(item: T) {
    if (!this.has(item)) {
      this.map.set(item.hash(), { item, index: this.counter });
      this.counter++;
    }
  }

  delete(item: T) {
    this.map.delete(item.hash());
  }

  clear() {
    this.map.clear();
  }

  get values(): readonly T[] {
    let mapItems: MapItem<T>[] = [];
    this.map.forEach((mapItem) => {
      mapItems = [...mapItems, mapItem];
    });

    const sortedMapItems = mapItems.sort((a, b) =>
      a.index < b.index ? -1 : 1
    );

    const items = sortedMapItems.map((mapItem) => mapItem.item);
    return items;
  }

  forEach(callback: (item: T) => void) {
    const items = this.values;
    items.forEach(callback);
  }

  [Symbol.iterator](): Iterator<T> {
    return this.values[Symbol.iterator]();
  }

  get size(): number {
    return this.values.length;
  }
}

export type ReadonlyHashSet<T extends Hashable> = Omit<
  HashSet<T>,
  'add' | 'delete' | 'clear'
>;
