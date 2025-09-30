import type { Hashable } from './types';

export default class Production implements Hashable {
  readonly lhs: string;
  readonly rhs: readonly string[];
  constructor(lhs: string, rhs: string[]) {
    this.lhs = lhs;
    this.rhs = rhs;
  }

  hash(): string {
    return `${this.lhs}->${this.rhs.join(' ')}`;
  }

  isLambdaProduction(): boolean {
    return this.rhs.length === 0;
  }

  static fromString(rule: string, separator: string = '->'): Production {
    const separatorIndex = rule.trim().split(' ').indexOf(separator);
    if (separatorIndex === -1) {
      throw new Error('Incorrect format.');
    }

    const lhs = rule
      .trim()
      .split(' ')
      .slice(0, separatorIndex)
      .join('')
      .trim();
    const rhs = rule
      .trim()
      .split(' ')
      .slice(separatorIndex + 1)
      .join(' ')
      .trim()
      .split(' ')
      .filter((nonTerminal) => nonTerminal.length > 0);

    return new Production(lhs, rhs);
  }
}
