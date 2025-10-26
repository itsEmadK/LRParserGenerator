import styles from '../styles/parser-section.module.css';
import ParseTree from './ParseTree.jsx';

export default function ParserSection({
  parser,
  onStep,
  onRun,
  onReset,
  onInputChange,
}) {
  const input = parser.input;
  const parserStatus = parser.currentStatus;
  const errors = parser.ERROR_CODES;
  const handleInputChange = (e) => {
    onInputChange(e.target.value);
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
                `${parserStatus.accepted ? ` ${styles['accepted']}` : ''}`
              }
            >
              {parserStatus.accepted
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
          <div className={styles['action-container']}>
            <h4>Last action:</h4>
            <div className={styles['action']}>
              {parserStatus.lastAction
                ? parserStatus.lastAction.action
                : '?'}
              {parserStatus.lastAction &&
                (parserStatus.lastAction.destination !== -1
                  ? parserStatus.lastAction.destination
                  : '')}
            </div>
          </div>
        </div>
        {parserStatus.error && (
          <div className={styles['error-container']}>
            <h4>Error:</h4>
            <p>
              {errors[parserStatus.error.errorCode]}
              {parserStatus.error.errorCode === 1 &&
                ` : ${parserStatus.error.desc.actions.map((a) => a.action + a.destination).join(', ')}`}
            </p>
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
          <h4>Parse tree:</h4>
          {parserStatus.treeStack.length > 0 ? (
            <ParseTree
              parseTreeClassName={styles['parse-tree']}
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
