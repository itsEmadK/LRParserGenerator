import { useState } from 'react';
import styles from './grammar-input-section.module.css';

export default function GrammarInputSection({ onSubmit }) {
  const [input, setInput] = useState('');
  function handleInputChange(e) {
    setInput(e.target.value);
  }
  return (
    <section className={styles['grammar']}>
      <h2 className={styles['heading']}>Enter your Grammar:</h2>
      <div className={styles['grammar-box-container']}>
        <textarea
          cols={30}
          rows={15}
          onChange={handleInputChange}
          value={input}
          className={styles['grammar-box']}
        />
        <button className={styles['gen-btn']}>Generate Tables</button>
      </div>

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
          <li>S -{'>'} a S b</li>
          <li>S -{'>'} ST;</li>
          <li>A -{'>'} a b</li>
          <li>ST -{'>'} if BE then ST EP</li>
          <li>ST -{'>'} st</li>
          <li>EP -{'>'} </li>
          <li>EP -{'>'} else ST</li>
        </ul>
      </div>
    </section>
  );
}
