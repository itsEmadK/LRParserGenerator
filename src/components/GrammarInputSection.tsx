import { useState } from 'react';
import styles from '../styles/grammar-input-section.module.css';
import { useAppApi, useProductions } from '../contexts/AppContext';
import Production from '../parse-logic/production';

const formattingInstructions = (
  <ul>
    <li>
      All symbols (terminals and non-terminals) should be separated with a
      whitespace.
    </li>
    <li>
      The symbols on the left hand side of rules are considered in the
      non-terminals of the language, every other symbol is considered in
      the terminals.
    </li>
    <li>
      Epsilon or lambda should be specified with a whitespace or empty
      string
    </li>
    <li>Rules should be separated with a \n(enter) character</li>
  </ul>
);

const correctGrammarExample = (
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
);

export default function GrammarInputSection() {
  const productions = useProductions();
  const productionsStr = [...productions]
    .map((prod) => `${prod.lhs} -> ${prod.rhs.join(' ')}`)
    .join('\n');
  //these productions are only used as the initial productions.
  const [input, setInput] = useState(productionsStr);
  const api = useAppApi();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const productions = input
      .split('\n')
      .map((str) => Production.fromString(str));
    api?.updateGrammarProductions(productions, productions[0].lhs);
  };

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
        {formattingInstructions}
        <h3>An example of a correct grammar:</h3>
        {correctGrammarExample}
      </div>
    </section>
  );
}
