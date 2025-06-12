import { useState } from 'react';
import styles from '../styles/parser-section.module.css';
import Parser from '../parse-logic/parser.js';

/**
 *
 * @param {{parser:Parser}} param0
 */
export default function ParserSection({ parser }) {
  const [input, setInput] = useState(parser.input);
  const [currentStatus, setCurrentStatus] = useState(parser.currentStatus);
  const handleInputChange = (e) => {
    parser.setInput(e.target.value);
    setCurrentStatus(parser.currentStatus);
    setInput(e.target.value);
  };
  const onStep = () => {
    setCurrentStatus(parser.step());
  };
  const onReset = () => {
    parser.reset();
    setCurrentStatus(parser.currentStatus);
  };
  const onRun = () => {
    setCurrentStatus(parser.run());
  };
  return (
    <section className={styles['parser']}>
      <h2>Parsing:</h2>
      <div className={styles['input']}>
        <label>
          <h4> Token stream separated by spaces:</h4>
          <input value={input} onChange={handleInputChange} type="text" />
        </label>
        <button onClick={onStep} className={styles['step']}>
          Step
        </button>
        <button onClick={onRun} className={styles['run']}>
          Run
        </button>
        <button onClick={onReset} className={styles['reset']}>
          Reset
        </button>
      </div>
      <div className={styles['parse-info']}>
        <div className={styles['parse-stack-container']}>
          <p>Parse stack:</p>
          <input
            value={currentStatus.parseStack.join(' ')}
            readOnly
            className={styles['parse-stack']}
          />
        </div>
        <div className={styles['progress-container']}>
          <p>Progress:</p>
          <input
            value={currentStatus.progress.join(' ')}
            readOnly
            className={styles['progress']}
          />
        </div>
        <div className={styles['flex']}>
          <div className={styles['current-state-container']}>
            <p>Current state:</p>
            <div className={styles['current-state']}>
              {
                currentStatus.parseStack[
                  currentStatus.parseStack.length - 1
                ]
              }
            </div>
          </div>
          <div className={styles['next-token-container']}>
            <p>Next token:</p>
            <div className={styles['next-token']}>
              {currentStatus.nextToken || 'Finished!'}
            </div>
          </div>
          <div className={styles['action-container']}>
            <p>Action:</p>
            <div className={styles['action']}>
              {currentStatus.lastAction && currentStatus.lastAction.action}
              {currentStatus.lastAction &&
                (currentStatus.lastAction.destination !== -1
                  ? currentStatus.lastAction.destination
                  : '')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
