export interface Hashable<T> {
  hash(this: T): string;
}
