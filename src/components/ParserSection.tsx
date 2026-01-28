import {useState , type ChangeEvent } from 'react';
import {
  useAppApi,
  useInput,
  useParserStatus,
  useParseTable,
  useTerminals,
  useNonTerminals,
  useProductions,
  useStartSymbol,
  useParserOverride,
} from '../contexts/AppContext';
import parserTemplate from '../parser/parser_template.py?raw';
import styles from '../styles/parser-section.module.css';
import ParseTree from './ParseTree';

export default function ParserSection() {
  const api = useAppApi();
  const parserStatus = useParserStatus();
  const input = useInput();
  const productions = useProductions();
  const startSymbol = useStartSymbol();
  const ParserOverride = useParserOverride();
  const [showModal, setShowModal] = useState(false);
  const parseTable = useParseTable();
  const terminals = useTerminals();
  const nonTerminals = useNonTerminals();
  
  const downloadJson = () => {
    var data = {
      startSymbol: startSymbol,
      terminals: [...terminals],
      nonTerminals: [...nonTerminals],
      parseTable: { ...parseTable },
      productions: [...productions]
    };
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parse-table.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const downloadJsonOverride = () => {
    var data = { ...ParserOverride };
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'override.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const downloadPythonFile = () => {
    const blob = new Blob([parserTemplate], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parser.py';
    a.click();
    URL.revokeObjectURL(url);
  };
  const copyCommand = () => {
    navigator.clipboard.writeText(`python parser.py parse-table.json "${input.slice(0, -2)}"`)
  };
  const copyCommandOverride = () => {
    navigator.clipboard.writeText(`python parser.py parse-table.json "${input.slice(0, -2)}" override.json`)
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    api?.updateTokenStream(e.target.value);
  };
  const handleStep = () => {
    api?.stepParser();
  };
    const handle_back = () => {

    api?.back_parser();
  };
  const handleRun = () => {
    api?.parse();
  };
  const handleReset = () => {
    api?.resetParser();
  };

  return (
    <section className={styles['parser']}>
      <h2 className={styles['display-inline']}>Parsing:</h2>
      <button onClick={() => setShowModal(true)} className={styles['export']}>
        Export
      </button>
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
                           <button onClick={handle_back} className={styles['back-step']}>
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
      {showModal && (
        <div
          className={styles['modal-overlay']}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles['modal']}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles['header-modal']}>
              <h3>Export Parser</h3>
              <button
                className={styles['close']}
                onClick={() => setShowModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 17L7 7.00002M17 7L7.00001 17" stroke="black" stroke-width="2" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <p>
              You can export the parse table either as a JSON file or as a Python LR parser script. The parse table contains all the data required by the parser, while the parser implementation itself is fixed.


            </p>

            <p>
              TTo run the downloaded Python parser, open a terminal and execute the following command:
            </p>

            <div className={styles['box-command']}>
              <pre>
                python parser.py parse-table.json "{input.slice(0, -2)}"
              </pre>
              <button onClick={copyCommand} className={styles['copy-command']}>
                Copy
              </button>
            </div>
            <p>or with override table:</p>
            <div className={styles['box-command']}>
              <pre>
                python parser.py parse-table.json "{input.slice(0, -2)}" override.json
              </pre>
              <button onClick={copyCommandOverride} className={styles['copy-command']}>
                Copy
              </button>
            </div>
            <p>
              Make sure Python is installed on your system.
              Replace <code>"{input.slice(0, -2)}"</code> with your own sequence of tokens.
            </p>

            <p>
              If the input conforms to the grammar, the message <strong>Input Accepted</strong> will be displayed.
              If there is a syntax error, the parser will display the current state, unexpected token, and its position.
            </p>
            <br />
            <h5>Download Options:</h5>
            <div className={styles['modal-buttons']}>
              <button onClick={downloadJson}>
                Parse Table (JSON)
              </button>

              <button onClick={downloadPythonFile}>
                LR Parser (Python)
              </button>

              <button onClick={downloadJsonOverride}>
                Override Table (JSON)
              </button>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
