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
      <RulesTable numberedRules={numberedRules}></RulesTable>
    </section>
  );
}

function RulesTable({ numberedRules }) {
  return (
    <table>
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
