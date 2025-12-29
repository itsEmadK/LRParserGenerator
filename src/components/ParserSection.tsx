import { type ChangeEvent } from 'react';
import {
  useAppApi,
  useInput,
  useParserStatus,
} from '../contexts/AppContext';
import styles from '../styles/parser-section.module.css';
import ParseTree from './ParseTree';

export default function ParserSection() {
  const api = useAppApi();
  const parserStatus = useParserStatus();
  const input = useInput();
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    api?.updateTokenStream(e.target.value);
  };
  const handleStep = () => {
    api?.stepParser();
  };
  const Support_back = () => {
    api?.back_parser_table();
  };
  const handleRun = () => {
    api?.parse();
  };
  const handleReset = () => {
    api?.resetParser();
  };

  return (
    <section className={styles['parser']}>
      <h2>Parsing:</h2>
      <div className={styles['input']}>
        <label>
          <h4> Token stream separated by spaces:</h4>
          <input value={input} onChange={handleInputChange} type="text" />
        </label>
        <div className={styles['buttons']}>
          <button onClick={handleStep} className={styles['step']}>
            Step
          </button>
          <button onClick={handleRun} className={styles['run']}>
            Run
          </button>
          <button onClick={handleReset} className={styles['reset']}>
            Reset
          </button>
        </div>
      </div>
      <div className={styles['parse-info']}>
        <div className={styles['parse-stack-container']}>
          <h4>Parse stack:</h4>
          <input
            value={parserStatus.parseStack.join(' ')}
            readOnly
            className={styles['parse-stack']}
          />
        </div>
        <div className={styles['progress-container']}>
          <h4>Progress:</h4>
          <input
            value={parserStatus.progress.join(' ')}
            readOnly
            className={styles['progress']}
          />
        </div>
        <div className={styles['flex']}>
          <div className={styles['current-state-container']}>
            <h4>Current state:</h4>
            <div
              className={
                styles['current-state'] +
                `${parserStatus.isAccepted ? ` ${styles['accepted']}` : ''}`
              }
            >
              {parserStatus.isAccepted
                ? 'Accept'
                : parserStatus.parseStack[
                    parserStatus.parseStack.length - 1
                  ]}
            </div>
          </div>
          <div className={styles['next-token-container']}>
            <h4>Next token:</h4>
            <div className={styles['next-token']}>
              {parserStatus.nextToken || 'Finished!'}
            </div>
          </div>
        </div>
        {parserStatus.errorCode && (
          <div className={styles['error-container']}>
            <h4>Error:</h4>
            <p>{parserStatus.errorCode}</p>
          </div>
        )}
        <div
          className={
            styles['parse-tree-container'] +
            (parserStatus.treeStack.length === 0
              ? ' ' + styles['no-tree']
              : '')
          }
        >
           <button onClick={Support_back} className={styles['back-button']}>
            Back
          </button>
          <h4>Parse tree:</h4>
          {parserStatus.treeStack.length > 0 ? (
            <ParseTree
              hideLambdaNodes={false}
              treeStack={parserStatus.treeStack}
            />
          ) : (
            <p>No trees yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
