import { useState, type ChangeEvent } from 'react';
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
import styles from '../styles/parser-section.module.css';
import ParseTree from './ParseTree';
import parserTemplate from '../parser/parser_template.cpp?raw';

export default function ParserSection() {
  const api = useAppApi();
  const parserStatus = useParserStatus();
  const parseTable = useParseTable();
  const terminals = useTerminals();
  const nonTerminals = useNonTerminals();
  const startSymbol = useStartSymbol();
  const productions = useProductions();
  const ParserOverride = useParserOverride();
  const input = useInput();
  const [showModal, setShowModal] = useState(false);
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    api?.updateTokenStream(e.target.value);
  };
  const handleStep = () => {
    api?.stepParser();
  };
  const handleBack = () => {

    api?.backParser();
  };
  const handleRun = () => {
    api?.parse();
  };
  const handleReset = () => {
    api?.resetParser();
  };
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
  const downloadCppFile = () => {
    const blob = new Blob([parserTemplate], { type: 'text/x-cpp' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parser.cpp';
    a.click();
    URL.revokeObjectURL(url);
  };
  const copyCommand = () => {
    navigator.clipboard.writeText(`c++ parser.cpp parse-table.json "${input.slice(0, -2)}"`)
  };
  const copyCommandOverride = () => {
    navigator.clipboard.writeText(`c++ parser.cpp parse-table.json "${input.slice(0, -2)}" override.json`)
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
          <button onClick={handleBack} className={styles['back']}>
            Back
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
            You can download the parse table as a JSON file or the C++ LR parser source code.
            The parse table contains all the information the parser needs, and the parser implementation is fixed.
          </p>

          <p>
            <strong>Step 1:</strong> Download the generated files (<code>parser.cpp</code> and
            <code> parse-table.json</code>) and place them in the same directory on your system.
          </p>

          <p>
            <strong>Step 2:</strong> Open a terminal (Command Prompt, PowerShell, or Terminal)
            in that directory and compile the C++ parser using a C++ compiler.
          </p>

          <div className={styles['box-command']}>
            <pre>
              g++ parser.cpp -o parser
            </pre>
            <button onClick={copyCommand} className={styles['copy-command']}>
              Copy
            </button>
          </div>
                      
          <p>
            <strong>Step 3:</strong> After successful compilation, run the generated executable
            and provide the parse table and input tokens as arguments.
          </p>
                      
          <div className={styles['box-command']}>
            <pre>
              ./parser parse-table.json "{input.slice(0, -2)}"
            </pre>
            <button onClick={copyCommand} className={styles['copy-command']}>
              Copy
            </button>
          </div>
                      
          <p>or with override table:</p>
                      
          <div className={styles['box-command']}>
            <pre>
              ./parser parse-table.json "{input.slice(0, -2)}" override.json
            </pre>
            <button onClick={copyCommandOverride} className={styles['copy-command']}>
              Copy
            </button>
          </div>
                      
          <p>
            Make sure you have a C++ compiler (such as <code>g++</code>) installed on your system.
            Replace <code>"{input.slice(0, -2)}"</code> with your own sequence of tokens.
          </p>
                      
          <p>
            If the input is valid according to the grammar, you will see <strong>Input Accepted</strong>.
            If there is a syntax error, the parser will display the current state, unexpected token,
            and its position.
          </p>


            <br />
            <h5>Download Options:</h5>
            <div className={styles['modal-buttons']}>
              <button onClick={downloadJson}>
                Parse Table (JSON)
              </button>

              <button onClick={downloadCppFile}>
                LR Parser (C++)
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
