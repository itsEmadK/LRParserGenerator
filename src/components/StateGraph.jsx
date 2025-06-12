import styles from '../styles/state-graph.module.css';
import LRState from '../parse-logic/lrstate';
import State from './State';
import { Fragment, useState } from 'react';

/**
 *
 * @param {{state:LRState,stateNumber:number,targets:{number:number,input:string}[]}}
 * @returns
 */
export default function StateGraph({
  state,
  stateNumber,
  targets,
  isHighlighted,
  onTargetClick,
  onMouseEnterTarget,
  onMouseLeaveTarget,
}) {
  const xMin = 0;
  const yMin = 0;
  const xMax = 100;
  const [yMax, setYMax] = useState(100);
  const virtualHeight = yMax - yMin;
  const circleStrokeWidth = 2;
  const circleRadius = 15 - circleStrokeWidth;
  const circleDiameter = circleRadius * 2;
  const backwardActions = targets.filter((t) => {
    return t.number < stateNumber;
  });
  const backSegLength = virtualHeight / (backwardActions.length + 1);

  const handleTargetClick = (targetNumber) => {
    onTargetClick(targetNumber);
  };
  const handleTargetEnter = (number) => {
    onMouseEnterTarget(number);
  };
  const handleTargetLeave = (number) => {
    onMouseLeaveTarget(number);
  };
  const backwardLineCircles = backwardActions.map(
    ({ number, input }, index) => {
      const lineY = backSegLength * (index + 1);
      const cx = xMin + circleRadius + circleStrokeWidth;
      return (
        <Fragment key={number + input}>
          <line
            x1={xMax}
            y1={lineY}
            x2={xMin + circleDiameter}
            y2={lineY}
            stroke="black"
            strokeWidth={2}
            markerEnd="url(#left-arrowhead)"
          />
          <text x={(xMin + xMax) / 2} y={lineY - 3}>
            {input}
          </text>
          <g
            className={styles['target']}
            onClick={() => {
              handleTargetClick(number);
            }}
            onMouseEnter={() => {
              handleTargetEnter(number);
            }}
            onMouseLeave={() => {
              handleTargetLeave(number);
            }}
          >
            <circle
              cx={cx}
              cy={lineY}
              r={circleRadius}
              fill="beige"
              stroke="black"
              strokeWidth={circleStrokeWidth}
            />
            <text
              className={styles['target']}
              x={cx}
              y={lineY}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {number}
            </text>
          </g>
        </Fragment>
      );
    }
  );

  const forwardActions = targets
    .filter((t) => {
      return t.number > stateNumber || t.number === 'acc';
    })
    .map((t) => (t.number === 'acc' ? { number: 'A', input: '$' } : t));

  const forSegLength = virtualHeight / (forwardActions.length + 1);

  const forwardLineCircles = forwardActions.map(
    ({ number, input }, index) => {
      const lineY = forSegLength * (index + 1);
      const cx = xMax - circleRadius - circleStrokeWidth;
      return (
        <Fragment key={number + input}>
          <line
            x1={xMin}
            y1={lineY}
            x2={xMax - circleDiameter}
            y2={lineY}
            stroke="black"
            strokeWidth={2}
            markerEnd="url(#right-arrowhead)"
          />
          <text x={(xMin + xMax - circleDiameter) / 2} y={lineY - 3}>
            {input}
          </text>
          <g
            className={styles['target']}
            onClick={() => {
              handleTargetClick(number);
            }}
            onMouseEnter={() => {
              handleTargetEnter(number);
            }}
            onMouseLeave={() => {
              handleTargetLeave(number);
            }}
          >
            <circle
              cx={cx}
              cy={lineY}
              r={circleRadius}
              stroke="black"
              strokeWidth={circleStrokeWidth}
              fill="beige"
            />
            <text
              x={cx}
              y={lineY}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {number}
            </text>
          </g>
        </Fragment>
      );
    }
  );

  const hasLoop = targets.find((t) => t.number === stateNumber);
  const selfLoopXMax = 60;
  const selfLoopYMax = 30;

  return (
    <div
      className={
        styles['container'] +
        ' ' +
        (isHighlighted ? styles['highlight'] : '')
      }
    >
      <div className={styles['state-graph']}>
        <svg
          width={xMax}
          height={yMax}
          preserveAspectRatio="xMinYMin meet"
          className={styles['backward']}
          viewBox={`${xMin} ${yMin} ${xMax} ${yMax}`}
        >
          <marker
            id="left-arrowhead"
            markerWidth="6"
            markerHeight="4"
            refX="0"
            refY="2"
            markerUnits="strokeWidth"
          >
            <polygon points="6 0, 0 2, 6 4" fill="black" />{' '}
          </marker>
          {backwardLineCircles}
        </svg>
        <State
          stateNumber={stateNumber}
          state={state}
          onRectSpecified={({ height }) => {
            if (height !== yMax) {
              setYMax(height);
            }
          }}
        />
        <svg
          width={xMax}
          height={yMax}
          preserveAspectRatio="xMinYMin meet"
          className={styles['forward']}
          viewBox={`${xMin} ${yMin} ${xMax} ${yMax}`}
        >
          <marker
            id="right-arrowhead"
            markerWidth="6"
            markerHeight="4"
            refX="6"
            refY="2"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 6 2, 0 4" fill="black" />
          </marker>
          {forwardLineCircles}
        </svg>
      </div>

      {hasLoop && (
        <svg
          overflow={'visible'}
          width={selfLoopXMax}
          height={selfLoopYMax}
          viewBox={`0 0 ${selfLoopXMax} ${selfLoopYMax}`}
          className={styles['self-loop']}
        >
          <marker
            id="up-arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="2.5"
            refY="1"
            // orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 6, 2.5 0, 5 6" fill="black" />
          </marker>

          {hasLoop && (
            <>
              <line
                stroke="black"
                strokeWidth={2}
                x1={selfLoopXMax}
                y1={0}
                x2={selfLoopXMax}
                y2={selfLoopYMax}
              />
              <line
                stroke="black"
                strokeWidth={2}
                x1={selfLoopXMax}
                y1={selfLoopYMax - 1}
                x2={0}
                y2={selfLoopYMax - 1}
              />
              <line
                stroke="black"
                strokeWidth={2}
                x1={0}
                y1={selfLoopYMax}
                x2={0}
                y2={0}
                markerEnd="url(#up-arrowhead)"
              />

              <text
                x={selfLoopXMax / 2}
                y={selfLoopYMax - 12}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {targets.find((t) => t.number === stateNumber).input}
              </text>
            </>
          )}
        </svg>
      )}
    </div>
  );
}
