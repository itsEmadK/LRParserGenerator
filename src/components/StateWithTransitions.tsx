import { useMemo } from 'react';
import type {
  NumberedState,
  TransitionWithNumberedState,
} from '../dfa/dfa';
import styles from '../styles/state-with-transitions.module.css';
import State from './State';
import { useEndMarker } from '../contexts/AppContext';

type StateWithTransitionsProps = {
  state: NumberedState;
  transitions: TransitionWithNumberedState[];
  isAcceptState: boolean;
};

export default function StateWithTransitions({
  state,
  transitions,
  isAcceptState,
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
          {isAcceptState && <AcceptTransition />}
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
function Transition({
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

function AcceptTransition() {
  const endMarker = useEndMarker();
  return (
    <div className={`${styles['transition']} ${styles['forward']}`}>
      <div className={styles['arrow-out']}>
        <div className={styles['symbol']}>{endMarker}</div>
      </div>
      <div className={`${styles['destination']} ${styles['accept']}`}>
        A
      </div>
    </div>
  );
}
