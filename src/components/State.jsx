import styles from './state.module.css';
import LRState from '../parse-logic/lrstate.js';
import Item from './Item.jsx';

/**
 *
 * @param {{state:LRState}}
 */
export default function State({ state, stateNumber }) {
  const baseItems = state.baseItems.values().map((bi, index) => {
    return (
      <li className={index === 0 ? styles['first'] : ''} key={bi.hash()}>
        <Item
          item={bi}
          isLastBaseItem={
            index === state.baseItems.size - 1 &&
            state.derivedItems.size > 0
          }
          number={index === 0 ? stateNumber : null}
        />
      </li>
    );
  });
  const derivedItems = state.derivedItems.values().map((di) => {
    return <Item key={di.hash()} item={di} isLastBaseItem={false} />;
  });
  return (
    <div className={styles['state']}>
      {[
        <ul className={styles['base-items']} key={'base'}>
          {[...baseItems]}
        </ul>,
        derivedItems.length > 0 && (
          <ul className={styles['derived-items']} key={'derived'}>
            {[...derivedItems]}
          </ul>
        ),
      ]}
    </div>
  );
}
