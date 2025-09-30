import Production from './production';
import { Hashable } from './types';

export default class Item implements Hashable {
  production: Production;
  declare readonly dotPosition: number;
  constructor(production: Production, dotPosition: number) {
    this.production = production;
    this.dotPosition = dotPosition;
    if (dotPosition > production.rhs.length || dotPosition < 0) {
      throw new Error(`invalid dot position(${dotPosition}).`);
    }
  }

  hash(): string {
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
}
