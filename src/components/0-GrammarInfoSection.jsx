import styles from '../styles/grammar-info-section.module.css';
import Grammar from '../grammar/grammar';

/**
 *
 * @param {{grammar:Grammar}} grammar
 */
export default function GrammarInfoSection({ grammar }) {
  const numberedRules = grammar.rules.values().map((rule) => ({
    number: grammar.findRuleNumber(rule),
    rule,
  }));
  return (
    <section className={styles['grammar-info-section']}>
      <h2 className={styles['heading']}>Grammar info:</h2>
      <div className={styles['tables']}>
        <RulesTable numberedRules={numberedRules} />
        <TerminalsTable terminals={[...grammar.terminals]} />
        <NonTerminalsTable grammar={grammar} />
      </div>
    </section>
  );
}

function RulesTable({ numberedRules }) {
  return (
    <table className={styles['rules']}>
      <thead>
        <tr>
          <th colSpan={2}>Rules</th>
        </tr>
        <tr>
          <th>Number</th>
          <th>Rule</th>
        </tr>
      </thead>
      <tbody>
        {numberedRules.map(({ number, rule }, index) => {
          return (
            <tr key={index}>
              <td>{number}</td>
              <td>{`${rule.lhs} -> ${rule.rhs.length > 0 ? rule.rhs.join(' ') : 'λ'}`}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TerminalsTable({ terminals }) {
  return (
    <table className={styles['terminals']}>
      <thead>
        <tr>
          <th>Terminals</th>
        </tr>
      </thead>
      <tbody>
        {terminals.map((t, index) => (
          <tr key={index}>
            <td>{t}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 *
 * @param {{grammar:Grammar}} grammar
 * @returns
 */
function NonTerminalsTable({ grammar }) {
  return (
    <table>
      <thead>
        <tr>
          <th colSpan={4}>Non Terminals</th>
        </tr>
        <tr>
          <th>Non Terminal</th>
          <th>Nullable</th>
          <th>First Set</th>
          <th>Follow Set</th>
        </tr>
      </thead>
      <tbody>
        {[...grammar.nonTerminals].map((nt, index) => {
          return (
            <tr key={index}>
              <td>{nt}</td>
              <td>{grammar.isNullable([nt]) ? '✔' : '✖'}</td>
              <td>{[...grammar.getFirst([nt])].join(', ')}</td>
              <td>{[...grammar.getFollow([nt])].join(', ')}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
