import React from 'react';

const NODE_WIDTH = 30;
const NODE_HEIGHT = NODE_WIDTH;
const NODE_BORDER_RADIUS = NODE_WIDTH / 2;
const HORIZONTAL_SPACING = 20;
const VERTICAL_SPACING = 60;

/**
 * Recursive function to calculate subtree width.
 * This is needed for positioning children.
 */
function calculateSubtreeWidth(node) {
  if (!node.children || node.children.length === 0) {
    return NODE_WIDTH;
  }
  return (
    node.children.reduce(
      (sum, child) => sum + calculateSubtreeWidth(child),
      0
    ) +
    HORIZONTAL_SPACING * (node.children.length - 1)
  );
}

function calculateMaxDepth(node) {
  if (!node.children || node.children.length === 0) {
    return 1;
  }
  return (
    1 + Math.max(...node.children.map((child) => calculateMaxDepth(child)))
  );
}

/**
 * Recursive component to render each tree node and its children
 * @param {Object} props
 * @param {Object} props.node - The tree node {symbol, children}
 * @param {number} props.x - x position of the node's center
 * @param {number} props.y - y position of the node's top
 */
function TreeNodeSVG({ node, x, y }) {
  const children = node.children || [];
  const isLeaf = children.length === 0;
  const subtreeWidths = children.map(calculateSubtreeWidth);

  // total width for centering children
  const totalWidth =
    subtreeWidths.reduce((a, b) => a + b, 0) +
    HORIZONTAL_SPACING * Math.max(children.length - 1, 0);

  let currentX = x - totalWidth / 2;

  return (
    <>
      {/* Node rectangle with different fill for leaves */}
      <rect
        x={x - NODE_WIDTH / 2}
        y={y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        fill={isLeaf ? '#90EE90' : '#87CEEB'} // lightgreen leaves, skyblue others
        stroke="#333"
        rx={NODE_BORDER_RADIUS}
        ry={NODE_BORDER_RADIUS}
      />
      {/* Node symbol */}
      <text
        x={x}
        y={y + NODE_HEIGHT / 2 + 5}
        fontFamily="Arial"
        fontSize={14}
        fill="#000"
        textAnchor="middle"
      >
        {node.symbol}
      </text>

      {/* Lines and children */}
      {children.map((child, i) => {
        const childWidth = subtreeWidths[i];
        const childX = currentX + childWidth / 2;
        const childY = y + NODE_HEIGHT + VERTICAL_SPACING;

        const line = (
          <line
            key={`line-${i}`}
            x1={x}
            y1={y + NODE_HEIGHT}
            x2={childX}
            y2={childY}
            stroke="#555"
            strokeWidth={2}
          />
        );

        currentX += childWidth + HORIZONTAL_SPACING;

        return (
          <React.Fragment key={`node-${i}`}>
            {line}
            <TreeNodeSVG node={child} x={childX} y={childY} />
          </React.Fragment>
        );
      })}
    </>
  );
}
/**
 * The main component to render the full forest (treeStack)
 * @param {{ treeStack: array }} props
 */
export default function ParseTree({ treeStack, parseTreeClassName }) {
  // Calculate total width for all trees side-by-side
  const forestWidth =
    treeStack.reduce((sum, tree) => sum + calculateSubtreeWidth(tree), 0) +
    HORIZONTAL_SPACING * (treeStack.length - 1);

  // Calculate max depth to set height dynamically
  const maxDepth = Math.max(...treeStack.map(calculateMaxDepth));

  const forestHeight =
    maxDepth * (NODE_BORDER_RADIUS * 2 + VERTICAL_SPACING) + 40; // 40 for padding

  let currentX = 0;

  return (
    <svg
      className={parseTreeClassName}
      width={forestWidth + 40}
      height={forestHeight}
    >
      {treeStack.map((tree, i) => {
        const treeWidth = calculateSubtreeWidth(tree);
        const x = currentX + treeWidth / 2 + 20;
        currentX += treeWidth + HORIZONTAL_SPACING;

        return <TreeNodeSVG key={i} node={tree} x={x} y={20} />;
      })}
    </svg>
  );
}
