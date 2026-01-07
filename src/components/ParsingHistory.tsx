import type { ParsingStep } from '../parser/parser';
import styles from '../styles/parsing-history.module.css';

type ParsingHistoryProps = {
  history: ParsingStep[];
};

export default function ParsingHistory({ history }: ParsingHistoryProps) {
  if (history.length === 0) {
    return (
      <div className={styles['parsing-history']}>
        <h4>Parsing History</h4>
        <p className={styles['no-history']}>No parsing history yet. Click "Run" to parse the input.</p>
      </div>
    );
  }

  const getActionDescription = (action: ParsingStep['action']): string => {
    switch (action.type) {
      case 'shift':
        return `Shift '${action.token}' → State ${action.destination}`;
      case 'reduce':
        const gotoInfo = action.gotoDestination 
          ? ` → Goto State ${action.gotoDestination}`
          : '';
        return `Reduce by rule ${action.ruleNumber} (${action.lhs} → ${action.rhsl > 0 ? `${action.rhsl} symbols` : 'λ'})${gotoInfo}`;
      case 'accept':
        return 'Accept';
      case 'error':
        return `Error: ${action.errorCode}`;
      case 'goto':
        return `Goto '${action.nonTerminal}' → State ${action.destination}`;
      default:
        return 'Unknown action';
    }
  };

  return (
    <div className={styles['parsing-history']}>
      <h4>Parsing History ({history.length} steps)</h4>
      <div className={styles['history-container']}>
        <table className={styles['history-table']}>
          <thead>
            <tr>
              <th>Step</th>
              <th>Stack</th>
              <th>Dot</th>
              <th>State</th>
              <th>Next Token</th>
              <th>Action</th>
              <th>Progress</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {history.map((step) => (
              <tr
                key={step.stepNumber}
                className={
                  step.errorCode
                    ? styles['error-row']
                    : step.action.type === 'accept'
                      ? styles['accept-row']
                      : ''
                }
              >
                <td className={styles['step-number']}>{step.stepNumber}</td>
                <td className={styles['stack']}>
                  {step.parseStack.join(' ')}
                </td>
                <td className={styles['dot-position']}>{step.dotPosition}</td>
                <td className={styles['state']}>{step.stateNumber}</td>
                <td className={styles['token']}>
                  {step.nextToken || '—'}
                </td>
                <td className={styles['action']}>
                  {getActionDescription(step.action)}
                </td>
                <td className={styles['progress']}>
                  {step.progress.join(' ')}
                </td>
                <td className={styles['error']}>
                  {step.errorCode || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

