import type { NumberedProduction } from '../grammar/grammar';
import { type Hashable } from '../util/types';

export default class Item implements Hashable {
  readonly production: NumberedProduction;
  readonly dotPosition: number;
  readonly lookahead: ReadonlySet<string> | null;

  constructor(
    production: NumberedProduction,
    dotPosition: number,
    lookahead: Iterable<string> | null
  ) {
    this.production = production;
    this.dotPosition = dotPosition;
    if (dotPosition > production.rhs.length || dotPosition < 0) {
      throw new Error(`invalid dot position(${dotPosition}).`);
    }
    if (lookahead) {
      this.lookahead = new Set(lookahead);
    } else {
      this.lookahead = lookahead;
    }
  }

  hash(): string {
    const dottedRhs = this.production.rhs.slice();
    dottedRhs.splice(this.dotPosition, 0, '•');
    const rhsStr = dottedRhs.join(' ');
    const lookaheadStr = this.lookahead
      ? [...this.lookahead].join(', ')
      : '';
    return `${this.production.lhs} -> ${rhsStr} , {${lookaheadStr}}`;
  }

  withoutLookahead(): Item {
    return new Item(this.production, this.dotPosition, null);
  }

  isReducible(): boolean {
    return this.dotPosition === this.production.rhs.length;
  }

  get symbolAfterDot(): string | undefined {
    return this.production.rhs[this.dotPosition];
  }

  get exprAfterDot(): readonly string[] {
    return this.production.rhs.slice(this.dotPosition);
  }
}
