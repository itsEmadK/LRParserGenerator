import { useEffect, useState } from 'react';
import LR1DFA from '../parse-logic/lr1dfa';
import State from './State';
import styles from './automata-section.module.css';

function getStateElkGraph(stateNumber, dfa, width, height) {
  const targetStateNumbers = dfa.graph.edges
    .filter((e) => e.from === stateNumber)
    .map((e) => e.to);
  const elkGraph = {};
  elkGraph.layoutOptions = {
    'spacing.nodeNodeBetweenLayers': '120.0',
    portConstraints: 'FIXED_SIDE',
    edgeRouting: 'POLYLINE',
    'spacing.nodeNode': '0.0',
    'spacing.nodeSelfLoop': '30.0',
  };
  elkGraph.id = 'g';
  elkGraph.children = [];
  elkGraph.edges = [];
  const nodeId = 'n' + stateNumber;
  const n = { id: nodeId, ports: [] };
  targetStateNumbers.forEach((t) => {
    const portId = 'p' + stateNumber + t;
    const edgeId = 'e' + stateNumber + t;
    const targetId = 'n' + t;
    const targetPortId = 'p' + targetId;
    n.layoutOptions = { portConstraints: 'FIXED_SIDE' };

    if (t !== stateNumber) {
      n.ports.push({
        id: portId,
        layoutOptions: {
          'port.side': t < stateNumber ? 'WEST' : 'EAST',
        },
      });
      elkGraph.children.push({
        id: targetId,
        ports: [
          {
            id: 'p' + targetId,
            layoutOptions: {
              'port.side': t < stateNumber ? 'EAST' : 'WEST',
            },
          },
        ],
        layoutOptions: { portConstraints: 'FIXED_SIDE' },
      });
      elkGraph.edges.push({
        id: edgeId,
        sources: [portId],
        targets: [targetPortId],
      });
    } else {
      elkGraph.edges.push({
        id: edgeId,
        sources: [nodeId],
        targets: [nodeId],
      });
    }
  });
  n.width = width;
  n.height = height;
  elkGraph.children.push(n);
  return elkGraph;
}

/**
 *
 * @param {{dfa:LR1DFA}}
 */
export default function AutomataSection({ dfa }) {
  const [rects, setRects] = useState([]);
  const onRectSpecified = (stateHash, width, height) => {
    setRects((rects) => {
      if (!rects.find((r) => r.stateHash === stateHash)) {
        return [...rects, { stateHash, width, height }];
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
          onRectSpecified(s.hash(), width, height);
        }}
      />
    );
  });

  useEffect(() => {
    console.log(rects);
  }, [rects]);

  return (
    <section className={styles['automata']}>
      <ul className={styles['states']}>{states}</ul>
    </section>
  );
}
