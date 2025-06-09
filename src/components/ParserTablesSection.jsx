import styles from './parser-tables-section.module.css';
import ParseTable from '../parse-logic/parse-table';
import Grammar from '../parse-logic/grammar';

/**
 *
 * @param {{parseTable:ParseTable,grammar:Grammar}} param0
 */
export default function ParserTablesSection({
  parseTable,
  grammar,
  parserType,
  onParserTypeChange,
}) {
  function handleParserTypeChange(e) {
    onParserTypeChange(e.target.value);
  }
  return (
    <section className={styles['parser-tables']}>
      <h2>Parser Tables:</h2>
      <div className={styles['parser-type-container']}>
        <h3>Parser Type:</h3>
        <select value={parserType} onChange={handleParserTypeChange}>
          <option>LR0</option>
          <option>SLR1</option>
          <option>LALR1</option>
          <option>LR1</option>
        </select>
      </div>
      <div className={styles['tables']}>
        <LRParseTable parseTable={parseTable} parserType={parserType} />
        <LRTable grammar={grammar} />
      </div>
    </section>
  );
}

/**
 *
 * @param {{parseTable:ParseTable}} param0
 */
function LRParseTable({ parseTable, parserType }) {
  return (
    <table>
      <thead>
        <tr>
          <th
            colSpan={
              1 +
              parseTable.actionsSymbols.length +
              parseTable.gotoSymbols.length
            }
          >
            {parserType + ' Parse Table'}
          </th>
        </tr>
        <tr>
          <th rowSpan={2}>State</th>
          <th colSpan={parseTable.actionsSymbols.length}>ACTION</th>
          <th colSpan={parseTable.gotoSymbols.length}>GOTO</th>
        </tr>
        <tr>
          {parseTable.actionsSymbols.map((s) => (
            <th key={s}>{s}</th>
          ))}
          {parseTable.gotoSymbols.map((s) => (
            <th key={s}>{s}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {parseTable.rows.map((_, stateNumber) => {
          return (
            <tr key={stateNumber}>
              <th>{stateNumber}</th>
              {[
                ...parseTable.actionsSymbols,
                ...parseTable.gotoSymbols,
              ].map((s) => {
                const actions = parseTable.getCell(stateNumber, s);
                let className = '';
                if (actions.length === 0) {
                  className = styles['error'];
                } else if (actions.length > 1) {
                  className = styles['conflict'];
                } else {
                  className = {
                    S: styles['shift'],
                    G: styles['goto'],
                    R: styles['reduce'],
                    A: styles['accept'],
                  }[actions[0].action];
                }

                const cellContent = actions
                  .map(
                    (act) =>
                      `${act.action}${act.action === 'A' ? '' : act.destination}`
                  )
                  .join(', ');

                return (
                  <td className={className} key={s}>
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 *
 * @param {{grammar:Grammar}} param0
 */
function LRTable({ grammar }) {
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
        {grammar.rules.values().map((rule) => {
          const ruleNumber = grammar.findRuleNumber(rule);
          const lhs = rule.lhs;
          const rhsl = rule.rhs.length;
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
