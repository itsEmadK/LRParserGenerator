import type { Action } from './types';

export type ParseTableShape = {
  [stateNumber: number]: {
    [symbol: string]: ParseTableCell;
  };
};
export type ParseTableCell = Action | Array<Action> | undefined;

export type ReadonlyParseTable = {
  readonly [stateNumber: number]: {
    readonly [symbol: string]: Readonly<ParseTableCell>;
  };
};

export default class ParseTable {
  private _table: ParseTableShape;
  constructor(table: ParseTableShape) {
    this._table = table;
  }

  get table(): ReadonlyParseTable {
    return this._table as ReadonlyParseTable;
  }

  get conflicts(): Array<{ stateNumber: number; symbol: string }> {
    const conflicts: Array<{ stateNumber: number; symbol: string }> = [];
    Object.keys(this._table).forEach((stateNumber) => {
      Object.keys(this._table[+stateNumber]).forEach((symbol) => {
        if (this.isConflict(+stateNumber, symbol)) {
          conflicts.push({ stateNumber: +stateNumber, symbol });
        }
      });
    });
    return conflicts;
  }

  get(stateNumber: number, symbol: string): Readonly<ParseTableCell> {
    return this.table[stateNumber][symbol];
  }

  hasConflict() {
    Object.keys(this._table).forEach((stateNumber) => {
      Object.keys(this._table[+stateNumber]).forEach((symbol) => {
        if (this.isConflict(+stateNumber, symbol)) {
          return true;
        }
      });
    });
  }

  isConflict(stateNumber: number, symbol: string): boolean {
    return Array.isArray(this._table[stateNumber][symbol]!);
  }

  isShift(stateNumber: number, symbol: string): boolean {
    const cell = this._table[stateNumber][symbol];
    if (cell) {
      if (Array.isArray(cell)) {
        return false;
      } else {
        return cell.type === 'shift';
      }
    }
    return false;
  }

  isGoto(stateNumber: number, symbol: string): boolean {
    const cell = this._table[stateNumber][symbol];
    if (cell) {
      if (Array.isArray(cell)) {
        return false;
      } else {
        return cell.type === 'goto';
      }
    }
    return false;
  }

  isReduce(stateNumber: number, symbol: string): boolean {
    const cell = this._table[stateNumber][symbol];
    if (cell) {
      if (Array.isArray(cell)) {
        return false;
      } else {
        return cell.type === 'reduce';
      }
    }
    return false;
  }

  isAccept(stateNumber: number, symbol: string): boolean {
    const cell = this._table[stateNumber][symbol];
    if (cell) {
      if (Array.isArray(cell)) {
        return false;
      } else {
        return cell.type === 'accept';
      }
    }
    return false;
  }

  isError(stateNumber: number, symbol: string): boolean {
    const cell = this._table[stateNumber][symbol];
    return !cell;
  }
}
