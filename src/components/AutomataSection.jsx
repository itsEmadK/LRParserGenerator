import LR1DFA from '../parse-logic/lr1dfa';
import State from './State';
import StateGraph from './StateGraph';
import styles from './automata-section.module.css';

/**
 *
 * @param {{dfa:LR1DFA}}
 */
export default function AutomataSection({ dfa }) {
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
      />
    );
  });

  return (
    <section className={styles['automata']}>
      <h2>Handle Finding Automata States:</h2>
      <ul className={styles['states']}>{states}</ul>
    </section>
  );
}
