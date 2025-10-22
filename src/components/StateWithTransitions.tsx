import { useMemo } from 'react';
import type {
  NumberedState,
  TransitionWithNumberedState,
} from '../dfa/dfa';
import styles from '../styles/state-with-transitions.module.css';
import State from './State';

type StateWithTransitionsProps = {
  state: NumberedState;
  transitions: TransitionWithNumberedState[];
};

export default function StateWithTransitions({
  state,
  transitions,
}: StateWithTransitionsProps) {
  const forwardTransitions = useMemo(() => {
    return transitions.filter(
      (transition) =>
        transition.destination.stateNumber > transition.source.stateNumber
    );
  }, [transitions]);
  const backwardTransitions = useMemo(() => {
    return transitions.filter(
      (transition) =>
        transition.destination.stateNumber < transition.source.stateNumber
    );
  }, [transitions]);
  const selfLoopTransition = useMemo(() => {
    return transitions.find(
      (transition) =>
        transition.destination.stateNumber ===
        transition.source.stateNumber
    );
  }, [transitions]);
  return (
    <div className={styles['outer-container']}>
      <div className={styles['container']}>
        <div className={styles['backward-transitions']}>
          {backwardTransitions.map((transition, index) => {
            return (
              <Transition
                key={index}
                destinationNumber={transition.destination.stateNumber}
                symbol={transition.symbol}
                direction="backward"
              />
            );
          })}
        </div>
        <State state={state} />
        <div className={styles['forward-transitions']}>
          {forwardTransitions.map((transition, index) => {
            return (
              <Transition
                key={index}
                destinationNumber={transition.destination.stateNumber}
                symbol={transition.symbol}
                direction="forward"
              />
            );
          })}
        </div>
      </div>
      {selfLoopTransition && (
        <div className={styles['self-loop']}>
          {selfLoopTransition.symbol}
        </div>
      )}
    </div>
  );
}

type TransitionProps = {
  symbol: string;
  destinationNumber: number;
  direction: 'forward' | 'backward';
};
export function Transition({
  symbol,
  destinationNumber,
  direction,
}: TransitionProps) {
  return (
    <div className={`${styles['transition']} ${styles[direction]}`}>
      <div className={styles['arrow-out']}>
        <div className={styles['symbol']}>{symbol}</div>
      </div>
      <div className={styles['destination']}>{destinationNumber}</div>
    </div>
  );
}
