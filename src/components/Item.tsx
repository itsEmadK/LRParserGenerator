import type Item from '../dfa/item';
import styles from '../styles/item.module.css';

type LrItemProps = {
  item: Item;
};

export default function LrItem({ item }: LrItemProps) {
  const dottedRhs = [...item.production.rhs];
  dottedRhs.splice(item.dotPosition, 0, '•');
  return (
    <div className={`${styles['item-container']}`}>
      <div className={`${styles['item']} }`}>
        <p className={styles['lhs']}>{item.production.lhs}</p>
        <p className={styles['arrow']}>{' -> '}</p>
        <p className={styles['rhs']}>{dottedRhs.join(' ')}</p>
        <p className={styles['lookahead']}>
          {item.lookahead &&
            `,{${[...(item.lookahead ?? [])].join(', ')}}`}
        </p>
      </div>
    </div>
  );
}
