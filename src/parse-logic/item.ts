import Production from './production';
import { type Hashable } from './types';

export default class Item implements Hashable {
  readonly production: Production;
  readonly dotPosition: number;
  readonly lookahead: ReadonlySet<string>;

  constructor(
    production: Production,
    dotPosition: number,
    lookahead: Set<string> = new Set()
  ) {
    this.production = production;
    this.dotPosition = dotPosition;
    if (dotPosition > production.rhs.length || dotPosition < 0) {
      throw new Error(`invalid dot position(${dotPosition}).`);
    }
    this.lookahead = lookahead;
  }

  hash(): string {
    const dottedRhs = this.production.rhs.slice();
    dottedRhs.splice(this.dotPosition, 0, '•');
    const rhsStr = dottedRhs.join(' ');
    return (
      this.production.lhs +
      ' -> ' +
      rhsStr +
      ' , ' +
      `${[...this.lookahead].join(', ')}`
    );
  }

  hashWithoutLookahead(): string {
    const dottedRhs = this.production.rhs.slice();
    dottedRhs.splice(this.dotPosition, 0, '•');
    const rhsStr = dottedRhs.join(' ');
    return this.production.lhs + ' -> ' + rhsStr;
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
