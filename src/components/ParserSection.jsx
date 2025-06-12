import styles from '../styles/parser-section.module.css';

export default function ParserSection({ parser }) {
  return (
    <section className={styles['parser']}>
      <h2>Parsing:</h2>
      <div className={styles['input']}>
        <h4> Token stream separated by spaces:</h4>
        <input type="text" />
        <button className={styles['step']}>Step</button>
        <button className={styles['run']}>Run</button>
        <button className={styles['reset']}>Reset</button>
      </div>
    </section>
  );
}
