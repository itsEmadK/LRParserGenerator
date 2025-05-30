import styles from './grammar-info-section.module.css';
import Grammar from '../parse-logic/grammar';

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
      <RulesTable numberedRules={numberedRules} />
      <TerminalsTable terminals={[...grammar.terminals]} />
      <NonTerminalsTable grammar={grammar} />
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
        {numberedRules.map(({ number, rule }) => {
          return (
            <tr key={number}>
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
        {terminals.map((t) => (
          <tr key={t}>
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
        {[...grammar.nonTerminals].map((nt) => {
          return (
            <tr key={nt}>
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
