import LRItem from '../parse-logic/lritem';
import styles from './item.module.css';
/**
 *
 * @param {{item:LRItem}} props
 * @returns
 */
export default function Item({
  item,
  isLastBaseItem = false,
  onClick = () => {},
  number = null,
}) {
  const dottedRhs = item.rule.rhs;
  dottedRhs.splice(item.dotPosition, 0, '•');
  return (
    <div
      className={`${styles['item-container']} ${isLastBaseItem ? styles['bottom-div'] : ''}`}
    >
      <div onClick={onClick} className={`${styles['item']} }`}>
        <p className={styles['lhs']}>{item.rule.lhs}</p>
        <p className={styles['arrow']}>{' → '}</p>
        <p className={styles['rhs']}>{dottedRhs.join(' ')}</p>
        <p className={styles['lookahead']}>
          {' ,'}
          {`{${[...item.lookahead].join(', ')}}`}
        </p>
      </div>
      {number !== null && <p className={styles['number']}>{number}</p>}
    </div>
  );
}
