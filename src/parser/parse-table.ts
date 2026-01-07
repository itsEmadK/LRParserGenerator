import type { Action } from '../util/types';

export type ParseTableShape = {
  [stateNumber: number]: {
    [symbol: string]: ParseTableCell;
  };
};
export type ParseTableCell = Action | Array<Action> | undefined;

export default class ParseTable {
  private _table: ParseTableShape;
  constructor(table: ParseTableShape) {
    this._table = table;
  }

  get table(): ParseTableShape {
    return this._table as ParseTableShape;
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

  get(stateNumber: number, symbol: string): ParseTableCell {
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

  /**
   * Compares two parse table rows to check if they are identical.
   * Two rows are identical if they have the same actions for all symbols.
   */
  private areRowsIdentical(
    state1: number,
    state2: number,
    allSymbols: Set<string>
  ): boolean {
    for (const symbol of allSymbols) {
      const cell1 = this._table[state1]?.[symbol];
      const cell2 = this._table[state2]?.[symbol];

      // Compare cells - both undefined means identical
      if (!cell1 && !cell2) continue;
      if (!cell1 || !cell2) return false;

      // Compare arrays
      if (Array.isArray(cell1) && Array.isArray(cell2)) {
        if (cell1.length !== cell2.length) return false;
        const cell1Str = JSON.stringify(cell1.sort());
        const cell2Str = JSON.stringify(cell2.sort());
        if (cell1Str !== cell2Str) return false;
        continue;
      }

      // One is array, one is not
      if (Array.isArray(cell1) || Array.isArray(cell2)) return false;

      // Compare single actions
      const cell1Str = JSON.stringify(cell1);
      const cell2Str = JSON.stringify(cell2);
      if (cell1Str !== cell2Str) return false;
    }
    return true;
  }

  /**
   * Optimizes the parse table by removing redundant (identical) rows.
   * Returns an optimized parse table and a mapping of removed states to kept states.
   */
  optimize(): {
    optimizedTable: ParseTable;
    stateMapping: Map<number, number>;
    removedStates: number[];
    keptStates: number[];
  } {
    // Get all states and symbols
    const states = Object.keys(this._table).map(Number).sort((a, b) => a - b);
    const allSymbols = new Set<string>();
    
    states.forEach((state) => {
      Object.keys(this._table[state]).forEach((symbol) => {
        allSymbols.add(symbol);
      });
    });

    // Find redundant states
    const stateMapping = new Map<number, number>(); // redundant -> kept
    const keptStates: number[] = [];
    const removedStates: number[] = [];
    const processed = new Set<number>();

    // Always keep state 1 (initial state) and accept state
    // We'll identify accept state by checking for accept action
    let acceptState: number | null = null;
    for (const state of states) {
      for (const symbol of allSymbols) {
        const cell = this._table[state]?.[symbol];
        if (cell && !Array.isArray(cell) && cell.type === 'accept') {
          acceptState = state;
          break;
        }
      }
      if (acceptState) break;
    }

    // Compare states to find duplicates
    for (let i = 0; i < states.length; i++) {
      const state1 = states[i];
      if (processed.has(state1)) continue;

      // Always keep initial state (1) and accept state
      if (state1 === 1 || state1 === acceptState) {
        keptStates.push(state1);
        processed.add(state1);
        continue;
      }

      let foundDuplicate = false;

      // Check against already kept states
      for (const keptState of keptStates) {
        if (this.areRowsIdentical(state1, keptState, allSymbols)) {
          stateMapping.set(state1, keptState);
          removedStates.push(state1);
          processed.add(state1);
          foundDuplicate = true;
          break;
        }
      }

      if (!foundDuplicate) {
        // Check against remaining unprocessed states
        for (let j = i + 1; j < states.length; j++) {
          const state2 = states[j];
          if (processed.has(state2)) continue;
          if (state2 === acceptState) continue; // Don't remove accept state

          if (this.areRowsIdentical(state1, state2, allSymbols)) {
            // Keep the lower-numbered state
            keptStates.push(state1);
            stateMapping.set(state2, state1);
            removedStates.push(state2);
            processed.add(state1);
            processed.add(state2);
            foundDuplicate = true;
            break;
          }
        }

        if (!foundDuplicate) {
          keptStates.push(state1);
          processed.add(state1);
        }
      }
    }

    // Create optimized table
    const optimizedTable: ParseTableShape = {};

    // Copy kept states
    for (const state of keptStates) {
      optimizedTable[state] = { ...this._table[state] };
    }

    // Update all state references in actions
    const updateStateReference = (state: number): number => {
      return stateMapping.get(state) ?? state;
    };

    // Update shift/goto destinations
    for (const state of keptStates) {
      for (const symbol of Object.keys(optimizedTable[state])) {
        const cell = optimizedTable[state][symbol];
        if (!cell) continue;

        if (Array.isArray(cell)) {
          // Update each action in the array
          optimizedTable[state][symbol] = cell.map((action) => {
            if (action.type === 'shift' || action.type === 'goto') {
              return {
                ...action,
                destination: updateStateReference(action.destination),
              };
            }
            return action;
          }) as typeof cell;
        } else {
          // Update single action
          if (cell.type === 'shift' || cell.type === 'goto') {
            optimizedTable[state][symbol] = {
              ...cell,
              destination: updateStateReference(cell.destination),
            };
          }
        }
      }
    }

    return {
      optimizedTable: new ParseTable(optimizedTable),
      stateMapping,
      removedStates: removedStates.sort((a, b) => a - b),
      keptStates: keptStates.sort((a, b) => a - b),
    };
  }
}
