import type { Hashable } from './types';

export default class Production implements Hashable {
  declare private _lhs: string;
  declare private _rhs: string[];
  constructor(lhs: string, rhs: string[]) {
    this._lhs = lhs;
    this._rhs = rhs;
  }

  get rhs(): readonly string[] {
    return this._rhs;
  }

  get lhs(): string {
    return this._lhs;
  }

  hash(): string {
    return `${this._lhs}->${this._rhs.join(' ')}`;
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
