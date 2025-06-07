import { useEffect, useState } from 'react';
import LR1DFA from '../parse-logic/lr1dfa';
import State from './State';
import styles from './automata-section.module.css';

/**
 *
 * @param {{dfa:LR1DFA}}
 */
export default function AutomataSection({ dfa }) {
  const [rects, setRects] = useState([]);
  const onRectSpecified = (stateHash, width, height) => {
    setRects((rects) => {
      if (!rects.find((r) => r.stateHash === stateHash)) {
        return [...rects, { stateHash, width, height }];
      }
      return [...rects];
    });
  };
  const states = dfa.states.values().map((s) => {
    return (
      <State
        key={s.hash()}
        state={s}
        stateNumber={dfa.getStateNumber(s)}
        onRectSpecified={({ width, height }) => {
          onRectSpecified(s.hash(), width, height);
        }}
      />
    );
  });

  useEffect(() => {
    console.log(rects);
  }, [rects]);

  return (
    <section className={styles['automata']}>
      <ul className={styles['states']}>{states}</ul>
    </section>
  );
}
