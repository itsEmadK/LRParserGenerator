import { useState } from 'react';
import styles from '../styles/grammar-input-section.module.css';
import Production from '../parse-logic/prod';

export default function GrammarInputSection({ onSubmit, initialRules }) {
  const [input, setInput] = useState(initialRules);
  function handleInputChange(e) {
    setInput(e.target.value);
  }
  function handleSubmit(e) {
    e.preventDefault();
    //TODO: Form validation
    const rules = input
      .split('\n')
      .filter((ruleStr) => ruleStr.length > 0)
      .map((ruleStr) => Production.fromString(ruleStr));
    onSubmit(rules);
  }
  return (
    <section className={styles['grammar']}>
      <h2 className={styles['heading']}>Enter your Grammar:</h2>
      <form className={styles['grammar-box-container']}>
        <textarea
          cols={25}
          rows={13}
          onChange={handleInputChange}
          value={input}
          className={styles['grammar-box']}
        />
        <button onClick={handleSubmit} className={styles['gen-btn']}>
          Generate Tables
        </button>
      </form>

      <div className={styles['instructions']}>
        <h3>Formatting Instructions:</h3>
        <ul>
          <li>
            All symbols (terminals and non-terminals) should be separated
            with a whitespace.
          </li>
          <li>
            The symbols on the left hand side of rules are considered in
            the non-terminals of the language, every other symbol is
            considered in the terminals.
          </li>
          <li>
            Epsilon or lambda should be specified with a whitespace or
            empty string
          </li>
          <li>Rules should be separated with a \n(enter) character</li>
        </ul>
        <h3>An example of a correct grammar:</h3>
        <ul>
          <li>E -{'>'} T E'</li>
          <li>E' -{'>'}</li>
          <li>E' -{'>'} + T E'</li>
          <li>T -{'>'} F T'</li>
          <li>T' -{'>'}</li>
          <li>T' -{'>'} * F T'</li>
          <li>F -{'>'} id</li>
          <li>F -{'>'} ( E )</li>
        </ul>
      </div>
    </section>
  );
}
