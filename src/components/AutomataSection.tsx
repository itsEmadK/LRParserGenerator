import styles from '../styles/automata-section.module.css';
import { useDfa } from '../contexts/AppContext';
import StateWithTransitions from './StateWithTransitions';

export default function AutomataSection() {
  const dfa = useDfa();

  return (
    <section className={styles['automata']}>
      <h2>Handle Finding Automata States:</h2>
      <ul className={styles['tips']}>
        <li>
          * Click on a circle to scroll into its corresponding state.
        </li>
        <li>* Hover on a circle to reveal its corresponding state.</li>
      </ul>
      <ul className={styles['states']}>
        {[...dfa.states].map((state, index) => {
          return (
            <StateWithTransitions
              key={index}
              state={state}
              transitions={[
                ...dfa.getStateOutwardTransitions(state.stateNumber),
              ]}
              isAcceptState={
                state.stateNumber === dfa.acceptState.stateNumber
              }
            />
          );
        })}
      </ul>
    </section>
  );
}
