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
        <th>Terminals</th>
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
