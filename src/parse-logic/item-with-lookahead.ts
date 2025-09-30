import Item from './item';
import Production from './production';
import { Hashable } from './types';

export default class ItemWithLookahead extends Item implements Hashable {
  readonly lookahead: ReadonlySet<string>;
  constructor(
    production: Production,
    dotPosition: number,
    lookahead: Set<string>
  ) {
    super(production, dotPosition);
    this.lookahead = lookahead;
  }

  hash(): string {
    const hashWithoutLookahead = super.hash();
    const hash = `${hashWithoutLookahead}, {${[...this.lookahead].join(', ')}}`;
    return hash;
  }
}
