import { useState } from 'react';
import LR1DFA from '../parse-logic/lr1dfa';
import StateGraph from './StateGraph';
import styles from './automata-section.module.css';
import State from './State';

/**
 *
 * @param {{dfa:LR1DFA}}
 */
export default function AutomataSection({ dfa }) {
  const [hoveredTarget, setHoveredTarget] = useState(null);
  const handleTargetEnter = (targetNumber) => {
    if (targetNumber !== 'A') {
      setHoveredTarget(targetNumber);
    }
  };
  const handleTargetLeave = (targetNumber) => {
    setHoveredTarget(null);
  };
  const handleTargetClick = (targetNumber) => {
    setHoveredTarget(null);
    if (targetNumber !== 'A') {
      const targetState = dfa.getStateByNumber(targetNumber);
      const stateDivId = 's' + targetState.hash();
      const stateDiv = document.querySelector('#' + stateDivId);
      stateDiv.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };
  const states = dfa.states.values().map((s) => {
    const stateNumber = dfa.getStateNumber(s);

    return (
      <StateGraph
        key={s.hash()}
        state={s}
        stateNumber={stateNumber}
        targets={dfa.graph.edges
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
      <ul className={styles['states']}>{states}</ul>
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
