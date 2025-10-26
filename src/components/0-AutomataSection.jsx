import { useMemo, useState } from 'react';
import LR1DFA from '../parser/0-lr1dfa';
import StateGraph from './0-StateGraph';
import styles from '../styles/automata-section.module.css';
import State from './State';

/**
 *
 * @param {{dfa:LR1DFA}}
 */
export default function AutomataSection({ dfa }) {
  const [hoveredTarget, setHoveredTarget] = useState(null);
  const [timeoutId, setTimeOutId] = useState(null);
  const states = useMemo(() => dfa.states.values(), [dfa]);
  const graph = useMemo(() => dfa.graph, [dfa]);
  const [highlightedStateNumber, setHighlightedStateNumber] =
    useState(null);
  const handleTargetEnter = (targetNumber) => {
    const delay = 1250;
    if (targetNumber !== 'A') {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const id = setTimeout(() => {
        setHoveredTarget(targetNumber);
      }, delay);
      setTimeOutId(id);
    }
  };
  const handleTargetLeave = () => {
    clearTimeout(timeoutId);
    setTimeOutId(null);
    setHoveredTarget(null);
  };
  const handleTargetClick = (targetNumber) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeOutId(null);
    }
    const highlightDuration = 2000;
    setHoveredTarget(null);
    if (targetNumber !== 'A') {
      const targetState = dfa.getStateByNumber(targetNumber);
      const stateDivId = 's' + targetState.hash();
      const stateDiv = document.querySelector('#' + stateDivId);
      stateDiv.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setHighlightedStateNumber(targetNumber);
      setTimeout(() => {
        setHighlightedStateNumber(null);
      }, highlightDuration);
    }
  };
  const statesGraph = states.map((s) => {
    const stateNumber = dfa.getStateNumber(s);

    return (
      <StateGraph
        key={s.hash()}
        state={s}
        stateNumber={stateNumber}
        isHighlighted={highlightedStateNumber === stateNumber}
        targets={graph.edges
          .filter((e) => e.from === stateNumber)
          .map((e) => ({ number: e.to, input: e.label }))}
        onTargetClick={handleTargetClick}
        onMouseEnterTarget={handleTargetEnter}
        onMouseLeaveTarget={handleTargetLeave}
      />
    );
  });

  return (
    <section className={styles['automata']}>
      <h2>Handle Finding Automata States:</h2>
      <ul className={styles['tips']}>
        <li>
          * Click on a circle to scroll into its corresponding state.
        </li>
        <li>* Hover on a circle to reveal its corresponding state.</li>
      </ul>
      <ul className={styles['states']}>{statesGraph}</ul>
      {hoveredTarget !== null && (
        <div className={styles['backdrop']}>
          <State
            state={dfa.getStateByNumber(hoveredTarget)}
            stateNumber={hoveredTarget}
          />
        </div>
      )}
    </section>
  );
}
