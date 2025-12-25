import styles from '../styles/page-heder.module.css';

export default function PageHeader() {
  return (
    <section className={styles['heading']}>
      <div className={styles['container']}>
        <header className={styles['header']}>
          <h1>Parser Visualizer</h1>
          <h3>Enter your context-free grammar to generate the parser</h3>
          <p>
            Created by{' '}
            <span className={styles['name']}>Emad Kheyroddin</span>
            {' '}— Modified by{' '}
            <span className={styles['name']}>Behrad Farzmahdi & Arian Soori</span> at
            Semnan University
          </p>
          <p>
            Inspired by{' '}
            <a href="https://www.cs.princeton.edu/courses/archive/spring20/cos320/LL1/">
              Princeton University&apos;s LL1 Parser Visualizer
            </a>
          </p>
        </header>
      </div>
    </section>
  );
}
