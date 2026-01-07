import { useState, useMemo } from 'react';
import {
  useAppApi,
  useOverrideTable,
  useParseTable,
  useTerminals,
  useNonTerminals,
  useEndMarker,
} from '../contexts/AppContext';
import type { ParseTableShape } from '../parser/parse-table';
import type { Action } from '../util/types';
import styles from '../styles/override-table-section.module.css';

export default function OverrideTableSection() {
  const api = useAppApi();
  const overrideTable = useOverrideTable();
  const parseTable = useParseTable();
  const terminals = useTerminals();
  const nonTerminals = useNonTerminals();
  const endMarker = useEndMarker();

  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [editingAction, setEditingAction] = useState<string>('');
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const allSymbols = useMemo(() => {
    return [...Array.from(terminals), endMarker, ...Array.from(nonTerminals)];
  }, [terminals, endMarker, nonTerminals]);

  const states = useMemo(() => {
    return Object.keys(parseTable.table)
      .map(Number)
      .sort((a, b) => a - b);
  }, [parseTable]);

  const getOverrideAction = (stateNumber: number, symbol: string): Action | Action[] | undefined => {
    if (!overrideTable) return undefined;
    return overrideTable[stateNumber]?.[symbol];
  };

  const getMainAction = (stateNumber: number, symbol: string): Action | Action[] | undefined => {
    return parseTable.get(stateNumber, symbol);
  };

  const getDisplayAction = (stateNumber: number, symbol: string): Action | Action[] | undefined => {
    // Override table takes precedence
    const overrideAction = getOverrideAction(stateNumber, symbol);
    if (overrideAction !== undefined) return overrideAction;
    return getMainAction(stateNumber, symbol);
  };

  const formatAction = (action: Action | Action[] | undefined): string => {
    if (!action) return '';
    if (Array.isArray(action)) {
      return action.map(formatSingleAction).join(', ');
    }
    return formatSingleAction(action);
  };

  const formatSingleAction = (action: Action): string => {
    switch (action.type) {
      case 'shift':
        return `S${action.destination}`;
      case 'reduce':
        return `R${action.ruleNumber}`;
      case 'goto':
        return `G${action.destination}`;
      case 'accept':
        return 'A';
    }
  };

  const handleSetOverride = () => {
    if (!selectedState || !selectedSymbol || !api) return;

    let action: Action | Action[] | undefined;
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(editingAction);
      if (Array.isArray(parsed)) {
        action = parsed;
      } else {
        action = parsed;
      }
    } catch {
      // If not JSON, try to parse as action string (e.g., "S5", "R2", "G3", "A")
      const trimmed = editingAction.trim().toUpperCase();
      if (trimmed === 'A' || trimmed === 'ACCEPT') {
        action = { type: 'accept' };
      } else if (trimmed.startsWith('S')) {
        const dest = parseInt(trimmed.slice(1));
        if (!isNaN(dest)) {
          action = { type: 'shift', destination: dest };
        }
      } else if (trimmed.startsWith('R')) {
        const rule = parseInt(trimmed.slice(1));
        if (!isNaN(rule)) {
          action = { type: 'reduce', ruleNumber: rule };
        }
      } else if (trimmed.startsWith('G')) {
        const dest = parseInt(trimmed.slice(1));
        if (!isNaN(dest)) {
          action = { type: 'goto', destination: dest };
        }
      } else if (trimmed === '' || trimmed === 'CLEAR' || trimmed === 'DELETE') {
        action = undefined;
      }
    }

    const newOverrideTable: ParseTableShape = overrideTable ? { ...overrideTable } : {};
    if (!newOverrideTable[selectedState]) {
      newOverrideTable[selectedState] = {};
    }

    if (action === undefined) {
      // Remove override
      delete newOverrideTable[selectedState][selectedSymbol];
      if (Object.keys(newOverrideTable[selectedState]).length === 0) {
        delete newOverrideTable[selectedState];
      }
    } else {
      newOverrideTable[selectedState][selectedSymbol] = action;
    }

    api.setOverrideTable(Object.keys(newOverrideTable).length > 0 ? newOverrideTable : null);
    setEditingAction('');
  };

  const handleClearAll = () => {
    if (!api) return;
    if (confirm('Clear all override table entries?')) {
      api.clearOverrideTable();
    }
  };

  const handleImportJson = () => {
    if (!api) return;
    try {
      const parsed = JSON.parse(jsonInput);
      api.setOverrideTable(parsed as ParseTableShape);
      setShowJsonEditor(false);
      setJsonInput('');
      alert('Override table imported successfully!');
    } catch (error) {
      alert(`Error parsing JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleExportJson = () => {
    const json = JSON.stringify(overrideTable || {}, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'override-table.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    const json = JSON.stringify(overrideTable || {}, null, 2);
    navigator.clipboard.writeText(json);
    alert('Override table copied to clipboard!');
  };

  const handleCellClick = (stateNumber: number, symbol: string) => {
    setSelectedState(stateNumber);
    setSelectedSymbol(symbol);
    const overrideAction = getOverrideAction(stateNumber, symbol);
    if (overrideAction) {
      setEditingAction(JSON.stringify(overrideAction, null, 2));
    } else {
      setEditingAction('');
    }
  };

  const overrideCount = useMemo(() => {
    if (!overrideTable) return 0;
    let count = 0;
    Object.values(overrideTable).forEach((state) => {
      count += Object.keys(state).length;
    });
    return count;
  }, [overrideTable]);

  return (
    <section className={styles['override-table']}>
      <h2>Override Table</h2>
      <div className={styles['description']}>
        <p>
          Override specific entries in the parse table. When an override exists for a state and symbol,
          it takes precedence over the main parse table during parsing.
        </p>
        {overrideCount > 0 && (
          <p className={styles['override-count']}>
            {overrideCount} override{overrideCount !== 1 ? 's' : ''} active
          </p>
        )}
      </div>

      <div className={styles['controls']}>
        <div className={styles['button-group']}>
          <button
            onClick={() => setShowJsonEditor(!showJsonEditor)}
            className={styles['button']}
          >
            {showJsonEditor ? 'Hide' : 'Show'} JSON Editor
          </button>
          <button
            onClick={handleExportJson}
            className={styles['button']}
            disabled={!overrideTable}
          >
            Export JSON
          </button>
          <button
            onClick={handleCopyJson}
            className={styles['button']}
            disabled={!overrideTable}
          >
            Copy JSON
          </button>
          <button
            onClick={handleClearAll}
            className={styles['button']}
            disabled={!overrideTable}
          >
            Clear All
          </button>
        </div>
      </div>

      {showJsonEditor && (
        <div className={styles['json-editor']}>
          <h3>JSON Editor</h3>
          <textarea
            value={jsonInput || JSON.stringify(overrideTable || {}, null, 2)}
            onChange={(e) => setJsonInput(e.target.value)}
            className={styles['json-textarea']}
            placeholder="Enter override table JSON..."
          />
          <div className={styles['json-actions']}>
            <button onClick={handleImportJson} className={styles['button']}>
              Import
            </button>
            <button
              onClick={() => setJsonInput(JSON.stringify(overrideTable || {}, null, 2))}
              className={styles['button']}
            >
              Load Current
            </button>
          </div>
        </div>
      )}

      <div className={styles['editor']}>
        <h3>Cell Editor</h3>
        {selectedState !== null && selectedSymbol !== null ? (
          <div className={styles['editor-content']}>
            <div className={styles['selection']}>
              <strong>State:</strong> {selectedState}, <strong>Symbol:</strong> {selectedSymbol}
            </div>
            <div className={styles['current-values']}>
              <div>
                <strong>Main Table:</strong> {formatAction(getMainAction(selectedState, selectedSymbol)) || 'Error'}
              </div>
              <div>
                <strong>Override:</strong> {formatAction(getOverrideAction(selectedState, selectedSymbol)) || 'None'}
              </div>
              <div>
                <strong>Effective:</strong> {formatAction(getDisplayAction(selectedState, selectedSymbol)) || 'Error'}
              </div>
            </div>
            <div className={styles['action-input']}>
              <label>
                Set Override (JSON or action like "S5", "R2", "G3", "A", or empty to clear):
                <textarea
                  value={editingAction}
                  onChange={(e) => setEditingAction(e.target.value)}
                  className={styles['action-textarea']}
                  placeholder='e.g., {"type":"shift","destination":5} or S5'
                />
              </label>
              <div className={styles['action-buttons']}>
                <button onClick={handleSetOverride} className={styles['button']}>
                  Set Override
                </button>
                <button
                  onClick={() => {
                    setEditingAction('');
                    handleSetOverride();
                  }}
                  className={styles['button']}
                >
                  Clear Override
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className={styles['no-selection']}>Click a cell in the table below to edit it</p>
        )}
      </div>

      <div className={styles['table-container']}>
        <h3>Parse Table (click cells to override)</h3>
        <div className={styles['table-wrapper']}>
          <table className={styles['table']}>
            <thead>
              <tr>
                <th rowSpan={2}>State</th>
                <th colSpan={Array.from(terminals).length + 1}>ACTION</th>
                <th colSpan={Array.from(nonTerminals).length}>GOTO</th>
              </tr>
              <tr>
                {Array.from(terminals).map((term: string) => (
                  <th key={term}>{term}</th>
                ))}
                <th>{endMarker}</th>
                {Array.from(nonTerminals).map((nt: string) => (
                  <th key={nt}>{nt}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {states.map((stateNumber) => (
                <tr key={stateNumber}>
                  <th>{stateNumber}</th>
                  {allSymbols.map((symbol) => {
                    const hasOverride = getOverrideAction(stateNumber, symbol) !== undefined;
                    const isSelected =
                      selectedState === stateNumber && selectedSymbol === symbol;
                    const action = getDisplayAction(stateNumber, symbol);
                    return (
                      <td
                        key={symbol}
                        className={`${styles['cell']} ${
                          hasOverride ? styles['overridden'] : ''
                        } ${isSelected ? styles['selected'] : ''}`}
                        onClick={() => handleCellClick(stateNumber, symbol)}
                        title={
                          hasOverride
                            ? 'Has override (click to edit)'
                            : 'Click to add override'
                        }
                      >
                        {formatAction(action)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

