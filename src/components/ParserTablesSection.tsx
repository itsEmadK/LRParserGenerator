import styles from '../styles/parser-tables-section.module.css';
import type { Action, ParserType } from '../util/types';
import type { NumberedProduction } from '../grammar/grammar';
import {
  useAppApi,
  useEndMarker,
  useNonTerminals,
  useParserType,
  useParseTable,
  useProductions,
  useTerminals,
  useIsOptimization,
  useParserOverride,
} from '../contexts/AppContext';
import type ParseTable from '../parser/parse-table';
import { useState, type ChangeEvent } from 'react';
import type { ParseTableCell } from '../parser/parse-table';

type LrParseTableProps = {
  terminals: string[];
  nonTerminals: string[];
  parseTable: ParseTable;
  parserType: ParserType;
  endMarker: string;
};

type LrTableProps = {
  productions: NumberedProduction[];
};

type TableCellProps = {
  parseTableCell: ParseTableCell;
};
type LrParseTableOverrideCell = {
  terminals: string[];
  nonTerminals: string[];
  parseTable: ParseTable;
  parserType: ParserType;
  endMarker: string;
  productions: NumberedProduction[];
};
export default function ParserTablesSection() {
  const productions = useProductions();
  const terminals = useTerminals();
  const nonTerminals = useNonTerminals();
  const parseTable = useParseTable();
  const endMarker = useEndMarker();
  const parserType = useParserType();
  const api = useAppApi();
  const is_optimization = useIsOptimization();

  function handleParserTypeChange(e: ChangeEvent<HTMLSelectElement>) {
    api!.updateParserType(e.target.value.toLowerCase() as ParserType);
  }
    const handleParserTablesOptimization = () => {
    api?.ParserTablesOptimization();
  };
  return (
    <section className={styles['parser-tables']}>
      <h2>Parser Tables:</h2>
            <button className={styles['optimization-btn']} onClick={handleParserTablesOptimization}>
        {is_optimization ? 'Normal' : 'Optimization'}
      </button>
      <div className={styles['parser-type-container']}>
        <h3>Parser Type:</h3>
        <select value={parserType} onChange={handleParserTypeChange}>
          <option value="lr0">LR0</option>
          <option value="slr1">SLR1</option>
          <option value="lalr1">LALR1</option>
          <option value="lr1">LR1</option>
        </select>
      </div>
      <div className={styles['tables']}>
        <LrParseTable
          parseTable={parseTable}
          endMarker={endMarker}
          parserType={parserType}
          nonTerminals={[...nonTerminals]}
          terminals={[...terminals]}
        />
        <LrTable productions={[...productions]} />
      </div>
              <ParseTableOverrideCell parseTable={parseTable}
          endMarker={endMarker}
          parserType={parserType}
          nonTerminals={[...nonTerminals]}
          terminals={[...terminals]}
          productions={[...productions]} />
    </section>
  );
}

function LrParseTable({
  endMarker,
  parseTable,
  parserType,
  terminals,
  nonTerminals,
}: LrParseTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th
            colSpan={
              1 + //state column
              1 + //end marker
              terminals.length +
              nonTerminals.length
            }
          >
            {parserType.toUpperCase() + ' Parse Table'}
          </th>
        </tr>
        <tr>
          <th rowSpan={2}>State</th>
          <th colSpan={1 + terminals.length}>ACTION</th>
          <th colSpan={nonTerminals.length}>GOTO</th>
        </tr>
        <tr>
          {terminals.map((terminal, index) => (
            <th key={index}>{terminal}</th>
          ))}
          {<th>{endMarker}</th>}
          {nonTerminals.map((nonTerminal, index) => (
            <th key={index}>{nonTerminal}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(parseTable.table).map((stateNumber) => {
          return (
            <tr key={stateNumber}>
              <th>{stateNumber}</th>
              {[...terminals, endMarker, ...nonTerminals].map(
                (symbol, index) => {
                  const cell = parseTable.get(+stateNumber, symbol);
                  return <TableCell key={index} parseTableCell={cell} />;
                }
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function LrTable({ productions }: LrTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th colSpan={3}>LR Table</th>
        </tr>
        <tr>
          <th>Number</th>
          <th>LHS</th>
          <th>RHSL</th>
        </tr>
      </thead>
      <tbody>
        {productions.map((prod) => {
          const ruleNumber = prod.productionNumber;
          const lhs = prod.lhs;
          const rhsl = prod.rhs.length;
          return (
            <tr key={ruleNumber}>
              <td>{ruleNumber}</td>
              <td>{lhs}</td>
              <td>{rhsl}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
function ParseTableOverrideCell({
  endMarker,
  parseTable,
  terminals,
  nonTerminals,
  productions,
}: LrParseTableOverrideCell) {

  const ParserOverride:any = useParserOverride();
  return (
    <table className={styles['table-override']}>
      <thead>
        <tr>
          <th
            colSpan={
              1 + //state column
              1 + //end marker
              terminals.length +
              nonTerminals.length
            }
          >
            Override Parse Table
          </th>
        </tr>
        <tr>
          <th rowSpan={2}>State</th>
          <th colSpan={1 + terminals.length}>ACTION</th>
        </tr>
        <tr>
          {terminals.map((terminal, index) => (
            <th key={index}>{terminal}</th>
          ))}
          {<th>{endMarker}</th>}
        </tr>
      </thead>
      <tbody>
        {Object.keys(parseTable.table).map((stateNumber) => {
          return (
            <tr key={stateNumber}>
              <th>{stateNumber}</th>
              {[...terminals, endMarker].map(
                (symbol, index) => {
                  const cell = ParserOverride[stateNumber]?.[symbol];
                  return (
                    <td key={index}>
                      <OverrideInput
                        productions={productions}
                        parseTable={parseTable}
                        state={stateNumber}
                        symbol={symbol}
                        parseTableCell={cell}
                      />
                    </td>);
                }
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
function TableCell({ parseTableCell }: TableCellProps) {
  function getCellContentForAction(action: Action) {
    switch (action.type) {
      case 'accept': {
        return 'A';
      }
      case 'goto':
      case 'shift': {
        return (action.type === 'goto' ? 'G' : 'S') + action.destination;
      }
      case 'reduce': {
        return 'R' + action.ruleNumber;
      }
      case 'shift_reduce': {
        return 'SR' + action.destination;
      }
    }
  }
  if (!parseTableCell) {
    return <td className={styles['error']}></td>;
  } else if (Array.isArray(parseTableCell)) {
    return (
      <td className={styles['conflict']}>
        {parseTableCell
          .map((action) => getCellContentForAction(action))
          .join(', ')}
      </td>
    );
  } else {
    return (
      <td className={styles[parseTableCell.type]}>
        {getCellContentForAction(parseTableCell)}
      </td>
    );
  }
}
function parseInputToAction(input: string, num: number | null) {
  if (input === 'A') return { type: 'accept' };
  if (input === 'S') {
    return { type: 'shift', destination: num };
  }
  if (input === 'R') {
    return { type: 'reduce', ruleNumber: num };
  }
  if (input === 'SR') {
    return { type: 'shift_reduce', destination: num };
  }
  return null;
}
function OverrideInput({
  parseTable,
  productions,
  state,
  symbol,
  parseTableCell
}: any) {
  const [value, setValue] = useState('');
  const stateCount = Object.keys(parseTable['_table']).length;
  const productionCount = productions.length;
  const api = useAppApi();
  function getCellContentForAction(action: Action) {
    switch (action.type) {
      case 'accept': {
        return 'A';
      }
      case 'shift': {
        return 'S' + action.destination;
      }
      case 'reduce': {
        return 'R' + action.ruleNumber;
      }
      case 'shift_reduce': {
        return 'SR' + action.destination;
      }
    }
  }
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value.toUpperCase());
  }

  function handleBlur() {
    if (value === '') {
      api!.updateParserOverride(state, symbol, null);
      return;
    }
    const match = value.toUpperCase().match(/^(S|A|R|SR)?(\d+)?$/);
    if (!match) {
      setValue('');
      return;
    }
    const prefix = match[1] || '';
    const num = match[2] ? parseInt(match[2], 10) : null;
    if (
      (prefix === 'S' || prefix === 'SR') &&
      (num === null || num <= 0 || num > stateCount)
    ) {
      setValue('');
      return;
    } else if (prefix === 'R' && (num === null || num <= 0 || num > productionCount)) {
      setValue('');
      return;
    } else if (prefix === '' && value.toUpperCase() !== 'A') {
      setValue('');
      return;
    }
    const action = parseInputToAction(prefix, num);
    api!.updateParserOverride(state, symbol, action);
  }
  if (!parseTableCell) {
    return (
      <input
        type="text"
        className={styles['input-override']}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  } else {
    return (
      <input
        type="text"
        className={`${styles['input-override']} ${styles[parseTableCell.type]}`}
        value={getCellContentForAction(parseTableCell)}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  }
}