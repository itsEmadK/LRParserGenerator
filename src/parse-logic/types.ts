export interface Hashable {
  hash(): string;
}

export type ParserType = 'lr1' | 'lalr1' | 'slr1' | 'lr0';
