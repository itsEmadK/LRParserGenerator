import LRItem from '../parse-logic/lritem';
import styles from './item.module.css';
/**
 *
 * @param {{item:LRItem}} props
 * @returns
 */
export default function Item({ item, isLastBaseItem = true }) {
  const dottedRhs = item.rule.rhs;
  dottedRhs.splice(item.dotPosition, 0, '•');
  return (
    <p
      className={`${styles['item']} ${isLastBaseItem ? styles['bottom-div'] : ''}`}
    >
      <p className={styles['lhs']}>{item.rule.lhs}</p>
      <p className={styles['arrow']}>{' → '}</p>
      <p className={styles['rhs']}>{dottedRhs.join(' ')}</p>
      <p className={styles['lookahead']}>
        {' ,'}
        {`{${[...item.lookahead].join(', ')}}`}
      </p>
    </p>
  );
}
