import { useState } from 'react';
import { useAppApi } from '../contexts/AppContext';
import styles from '../styles/code-generation-section.module.css';

export default function CodeGenerationSection() {
  const api = useAppApi();
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [parserConfig, setParserConfig] = useState<string | null>(null);
  const [includeOverrideTable, setIncludeOverrideTable] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'config'>('code');

  const handleGenerateCode = () => {
    if (!api) return;
    const code = api.generateParserCode(includeOverrideTable);
    setGeneratedCode(code);
    setActiveTab('code');
  };

  const handleExportConfig = () => {
    if (!api) return;
    const config = api.exportParserConfig();
    const configJson = JSON.stringify(config, null, 2);
    setParserConfig(configJson);
    setActiveTab('config');
  };

  const handleDownloadCode = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parser.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadConfig = () => {
    if (!parserConfig) return;
    const blob = new Blob([parserConfig], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parser-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    alert('Code copied to clipboard!');
  };

  const handleCopyConfig = () => {
    if (!parserConfig) return;
    navigator.clipboard.writeText(parserConfig);
    alert('Config copied to clipboard!');
  };

  return (
    <section className={styles['code-generation']}>
      <h2>Parser Code Generation</h2>
      <div className={styles['description']}>
        <p>
          Generate a standalone parser program that can be executed from the terminal.
          The generated parser accepts a token stream and parse table (JSON) as input.
        </p>
      </div>

      <div className={styles['controls']}>
        <div className={styles['option']}>
          <label>
            <input
              type="checkbox"
              checked={includeOverrideTable}
              onChange={(e) => setIncludeOverrideTable(e.target.checked)}
            />
            Include override table support (Stage 5 bonus)
          </label>
        </div>
        <div className={styles['buttons']}>
          <button onClick={handleGenerateCode} className={styles['generate-button']}>
            Generate Parser Code
          </button>
          <button onClick={handleExportConfig} className={styles['export-button']}>
            Export Parser Config (JSON)
          </button>
        </div>
      </div>

      {(generatedCode || parserConfig) && (
        <div className={styles['output-container']}>
          <div className={styles['tabs']}>
            <button
              className={`${styles['tab']} ${activeTab === 'code' ? styles['active'] : ''}`}
              onClick={() => setActiveTab('code')}
              disabled={!generatedCode}
            >
              Generated Code
            </button>
            <button
              className={`${styles['tab']} ${activeTab === 'config' ? styles['active'] : ''}`}
              onClick={() => setActiveTab('config')}
              disabled={!parserConfig}
            >
              Parser Config (JSON)
            </button>
          </div>

          <div className={styles['content']}>
            {activeTab === 'code' && generatedCode && (
              <div className={styles['code-viewer']}>
                <div className={styles['code-actions']}>
                  <button onClick={handleCopyCode} className={styles['action-button']}>
                    Copy
                  </button>
                  <button onClick={handleDownloadCode} className={styles['action-button']}>
                    Download
                  </button>
                </div>
                <pre className={styles['code']}>
                  <code>{generatedCode}</code>
                </pre>
              </div>
            )}

            {activeTab === 'config' && parserConfig && (
              <div className={styles['config-viewer']}>
                <div className={styles['code-actions']}>
                  <button onClick={handleCopyConfig} className={styles['action-button']}>
                    Copy
                  </button>
                  <button onClick={handleDownloadConfig} className={styles['action-button']}>
                    Download
                  </button>
                </div>
                <pre className={styles['code']}>
                  <code>{parserConfig}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {generatedCode && (
        <div className={styles['usage']}>
          <h3>Usage Instructions:</h3>
          <ol>
            <li>Download the generated parser code (parser.js)</li>
            <li>Make it executable: <code>chmod +x parser.js</code></li>
            <li>
              Run it with a token stream:
              <pre className={styles['usage-code']}>
                <code>node parser.js &lt;token1&gt; &lt;token2&gt; ... &lt;tokenN&gt;</code>
              </pre>
            </li>
            {includeOverrideTable && (
              <li>
                Or with an override table:
                <pre className={styles['usage-code']}>
                  <code>node parser.js --override override.json &lt;token1&gt; &lt;token2&gt; ...</code>
                </pre>
              </li>
            )}
            <li>
              The parser will output step-by-step parsing information and indicate
              whether the parse was successful.
            </li>
          </ol>
        </div>
      )}
    </section>
  );
}

