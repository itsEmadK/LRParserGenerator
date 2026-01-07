import type { NumberedState } from '../dfa/dfa';
import styles from '../styles/state.module.css';
import LrItem from './Item';

type StateProps = {
  state: NumberedState;
};

export default function State({ state }: StateProps) {
  const baseItems = [...state.baseItems].map((baseItem, index) => {
    return (
      <li key={index}>
        <LrItem item={baseItem} />
      </li>
    );
  });
  const derivedItems = [...state.derivedItems].map(
    (derivedItem, index) => {
      return (
        <li key={index}>
          <LrItem item={derivedItem} />
        </li>
      );
    }
  );
  return (
    <div className={styles['state']}>
      <ul
        className={`${styles['base-items']} ${derivedItems.length > 0 ? styles['bottom-border'] : ''}`}
      >
        {baseItems}
      </ul>
      {derivedItems.length > 0 && (
        <ul className={styles['derived-items']}>{derivedItems}</ul>
      )}
      <p className={styles['state-number']}>{state.stateNumber}</p>
    </div>
  );
}
