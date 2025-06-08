import { useEffect, useState } from 'react';
import LR1DFA from '../parse-logic/lr1dfa';
import State from './State';
import styles from './automata-section.module.css';

/**
 *
 * @param {*} stateNumber
 * @param {LR1DFA} dfa
 * @param {*} width
 * @param {*} height
 * @returns
 */
function getStatesElkGraph(dfa, rects) {
  if (rects.length === 0) {
    return;
  }
  const graphs = [];
  dfa.states.forEach((s) => {
    const stateNumber = dfa.getStateNumber(s);
    const targets = dfa.graph.edges
      .filter((e) => e.from === stateNumber)
      .map((e) => ({ target: e.to, label: e.label }));
    const elkGraph = {};
    elkGraph.layoutOptions = {
      'spacing.nodeNodeBetweenLayers': '120.0',
      portConstraints: 'FIXED_SIDE',
      edgeRouting: 'POLYLINE',
      'spacing.nodeNode': '0.0',
      'spacing.nodeSelfLoop': '30.0',
    };
    elkGraph.stateNumber = stateNumber;
    elkGraph.id = 's' + stateNumber;
    elkGraph.children = [];
    elkGraph.edges = [];
    const nodeId = 'n' + stateNumber;
    const n = { id: nodeId, ports: [] };
    const rect = rects.find((r) => r.stateNumber === stateNumber);
    targets.forEach((t) => {
      const portId = 'p' + stateNumber + t.target;
      const edgeId = 'e' + stateNumber + t.target;
      const targetId = 'n' + t.target;
      const targetPortId = 'p' + targetId;
      n.layoutOptions = { portConstraints: 'FIXED_SIDE' };

      if (t !== stateNumber) {
        n.ports.push({
          id: portId,
          layoutOptions: {
            'port.side': t.target < stateNumber ? 'WEST' : 'EAST',
          },
        });
        elkGraph.children.push({
          id: targetId,
          ports: [
            {
              id: 'p' + targetId,
              layoutOptions: {
                'port.side': t.target < stateNumber ? 'EAST' : 'WEST',
              },
            },
          ],
          layoutOptions: { portConstraints: 'FIXED_SIDE' },
        });
        elkGraph.edges.push({
          id: edgeId,
          sources: [portId],
          targets: [targetPortId],
          labels: [{ text: t.label }],
        });
      } else {
        elkGraph.edges.push({
          id: edgeId,
          sources: [nodeId],
          targets: [nodeId],
          labels: [{ text: t.label }],
        });
      }
    });
    n.width = rect.width;
    n.height = rect.height;
    elkGraph.children.push(n);
    graphs.push(elkGraph);
  });

  return graphs;
}

/**
 *
 * @param {{dfa:LR1DFA}}
 */
export default function AutomataSection({ dfa }) {
  const [rects, setRects] = useState([]);
  const onRectSpecified = (stateNumber, width, height) => {
    setRects((rects) => {
      if (!rects.find((r) => r.stateNumber === stateNumber)) {
        return [...rects, { stateNumber, width, height }];
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
          onRectSpecified(dfa.getStateNumber(s), width, height);
        }}
      />
    );
  });

  useEffect(() => {
    console.log(rects);
    console.log(getStatesElkGraph(dfa, rects));
  }, [rects]);

  return (
    <section className={styles['automata']}>
      <ul className={styles['states']}>{states}</ul>
    </section>
  );
}
