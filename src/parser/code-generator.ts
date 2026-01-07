import type ParseTable from './parse-table';
import type { NumberedProduction } from '../grammar/grammar';
import type { Action } from '../util/types';

export type ParseTableJson = {
  [stateNumber: number]: {
    [symbol: string]: ActionJson | ActionJson[];
  };
};

export type ActionJson =
  | { type: 'shift'; destination: number }
  | { type: 'reduce'; ruleNumber: number }
  | { type: 'goto'; destination: number }
  | { type: 'accept' };

export type LrTableJson = {
  [productionNumber: number]: {
    lhs: string;
    rhsl: number;
  };
};

export type ParserConfigJson = {
  parseTable: ParseTableJson;
  lrTable: LrTableJson;
  endMarker: string;
  overrideTable?: ParseTableJson;
};

/**
 * Converts a ParseTable to JSON format
 */
export function parseTableToJson(parseTable: ParseTable): ParseTableJson {
  const json: ParseTableJson = {};
  const table = parseTable.table;
  
  Object.keys(table).forEach((stateNumber) => {
    const state = +stateNumber;
    json[state] = {};
    Object.keys(table[state]).forEach((symbol) => {
      const cell = table[state][symbol];
      if (cell) {
        if (Array.isArray(cell)) {
          json[state][symbol] = cell.map(actionToJson);
        } else {
          json[state][symbol] = actionToJson(cell);
        }
      }
    });
  });
  
  return json;
}

/**
 * Converts an Action to JSON format
 */
function actionToJson(action: Action): ActionJson {
  switch (action.type) {
    case 'shift':
      return { type: 'shift', destination: action.destination };
    case 'reduce':
      return { type: 'reduce', ruleNumber: action.ruleNumber };
    case 'goto':
      return { type: 'goto', destination: action.destination };
    case 'accept':
      return { type: 'accept' };
  }
}

/**
 * Converts LR table (productions) to JSON format
 */
export function lrTableToJson(
  productions: Iterable<NumberedProduction>
): LrTableJson {
  const json: LrTableJson = {};
  for (const prod of productions) {
    json[prod.productionNumber] = {
      lhs: prod.lhs,
      rhsl: prod.rhs.length,
    };
  }
  return json;
}

/**
 * Generates a standalone parser program as a string
 */
export function generateParserCode(
  config: ParserConfigJson,
  includeOverrideTable: boolean = false
): string {
  const parseTableStr = JSON.stringify(config.parseTable, null, 2);
  const lrTableStr = JSON.stringify(config.lrTable, null, 2);
  const endMarkerStr = JSON.stringify(config.endMarker);
  const overrideTableStr = config.overrideTable
    ? JSON.stringify(config.overrideTable, null, 2)
    : 'null';

  return `#!/usr/bin/env node
/**
 * Generated LR Parser
 * This parser was automatically generated from a parse table.
 * 
 * Usage:
 *   node parser.js <token1> <token2> ... <tokenN>
 * 
 * Or with override table (JSON file):
 *   node parser.js --override override.json <token1> <token2> ... <tokenN>
 */

const fs = require('fs');

// Parse table
const PARSE_TABLE = ${parseTableStr};

// LR table (production rules)
const LR_TABLE = ${lrTableStr};

// End marker
const END_MARKER = ${endMarkerStr};

${includeOverrideTable ? `// Override table (optional)
let OVERRIDE_TABLE = ${overrideTableStr};

// Load override table from file if provided (overrides default)
if (process.argv.includes('--override')) {
  const overrideIndex = process.argv.indexOf('--override');
  if (overrideIndex + 1 < process.argv.length) {
    const overrideFile = process.argv[overrideIndex + 1];
    try {
      const overrideData = fs.readFileSync(overrideFile, 'utf8');
      OVERRIDE_TABLE = JSON.parse(overrideData);
      console.log('Loaded override table from:', overrideFile);
    } catch (error) {
      console.error('Error loading override table:', error.message);
      process.exit(1);
    }
  }
}` : ''}

/**
 * Get action from parse table (checks override table first if available)
 */
function getAction(stateNumber, symbol) {
  ${includeOverrideTable ? `// Check override table first
  if (OVERRIDE_TABLE && OVERRIDE_TABLE[stateNumber] && OVERRIDE_TABLE[stateNumber][symbol] !== undefined) {
    return OVERRIDE_TABLE[stateNumber][symbol];
  }` : ''}
  
  // Fall back to main parse table
  if (PARSE_TABLE[stateNumber] && PARSE_TABLE[stateNumber][symbol] !== undefined) {
    return PARSE_TABLE[stateNumber][symbol];
  }
  
  return undefined;
}

/**
 * Check if action is an error (undefined)
 */
function isError(stateNumber, symbol) {
  return getAction(stateNumber, symbol) === undefined;
}

/**
 * Check if action is a conflict (array of actions)
 */
function isConflict(stateNumber, symbol) {
  const action = getAction(stateNumber, symbol);
  return Array.isArray(action);
}

/**
 * Check if action is accept
 */
function isAccept(stateNumber, symbol) {
  const action = getAction(stateNumber, symbol);
  if (Array.isArray(action)) return false;
  return action && action.type === 'accept';
}

/**
 * Check if action is shift
 */
function isShift(stateNumber, symbol) {
  const action = getAction(stateNumber, symbol);
  if (Array.isArray(action)) return false;
  return action && action.type === 'shift';
}

/**
 * Check if action is reduce
 */
function isReduce(stateNumber, symbol) {
  const action = getAction(stateNumber, symbol);
  if (Array.isArray(action)) return false;
  return action && action.type === 'reduce';
}

/**
 * Check if action is goto
 */
function isGoto(stateNumber, symbol) {
  const action = getAction(stateNumber, symbol);
  if (Array.isArray(action)) return false;
  return action && action.type === 'goto';
}

/**
 * Parse a token stream
 */
function parse(tokenStream) {
  const parseStack = [1]; // Start with state 1
  let dotPosition = 0;
  const history = [];
  
  while (true) {
    const currentStateNumber = parseStack[parseStack.length - 1];
    const nextToken = tokenStream[dotPosition];
    
    // Build progress string
    const progress = [...tokenStream];
    progress.splice(dotPosition, 0, '•');
    
    const step = {
      stepNumber: history.length,
      parseStack: [...parseStack],
      dotPosition: dotPosition,
      nextToken: nextToken,
      stateNumber: currentStateNumber,
      progress: progress,
    };
    
    // Check for errors
    if (!currentStateNumber) {
      step.error = 'Parse stack is empty';
      history.push(step);
      return { success: false, history, error: step.error };
    }
    
    if (!nextToken) {
      step.error = 'No more tokens';
      history.push(step);
      return { success: false, history, error: step.error };
    }
    
    if (isError(currentStateNumber, nextToken)) {
      step.error = \`No action for state \${currentStateNumber} and token \${nextToken}\`;
      history.push(step);
      return { success: false, history, error: step.error };
    }
    
    if (isConflict(currentStateNumber, nextToken)) {
      step.error = \`Conflict in state \${currentStateNumber} for token \${nextToken}\`;
      history.push(step);
      return { success: false, history, error: step.error };
    }
    
    // Handle accept
    if (isAccept(currentStateNumber, nextToken)) {
      step.action = { type: 'accept' };
      step.success = true;
      history.push(step);
      return { success: true, history };
    }
    
    // Handle shift
    if (isShift(currentStateNumber, nextToken)) {
      const action = getAction(currentStateNumber, nextToken);
      parseStack.push(action.destination);
      dotPosition++;
      step.action = action;
      history.push(step);
      continue;
    }
    
    // Handle reduce
    if (isReduce(currentStateNumber, nextToken)) {
      const action = getAction(currentStateNumber, nextToken);
      const { lhs, rhsl } = LR_TABLE[action.ruleNumber];
      
      // Pop rhsl states from stack
      if (rhsl > 0) {
        parseStack.splice(-rhsl);
      }
      
      const newStateNumber = parseStack[parseStack.length - 1];
      
      if (!newStateNumber) {
        step.error = 'Parse stack empty after reduce';
        history.push(step);
        return { success: false, history, error: step.error };
      }
      
      // Goto after reduce
      if (!isGoto(newStateNumber, lhs)) {
        step.error = \`No goto for state \${newStateNumber} and non-terminal \${lhs}\`;
        history.push(step);
        return { success: false, history, error: step.error };
      }
      
      const gotoAction = getAction(newStateNumber, lhs);
      parseStack.push(gotoAction.destination);
      
      step.action = { ...action, lhs, rhsl, gotoDestination: gotoAction.destination };
      history.push(step);
      continue;
    }
    
    // Fallback error
    step.error = 'Unknown action type';
    history.push(step);
    return { success: false, history, error: step.error };
  }
}

// Main execution
function main() {
  ${includeOverrideTable ? `// Filter out --override flag and its argument
  const args = process.argv.slice(2);
  const overrideIndex = args.indexOf('--override');
  if (overrideIndex !== -1) {
    args.splice(overrideIndex, 2); // Remove --override and filename
  }
  const tokenStream = args;` : `const tokenStream = process.argv.slice(2);`}
  
  if (tokenStream.length === 0) {
    console.error('Usage: node parser.js <token1> <token2> ... <tokenN>');
    ${includeOverrideTable ? `console.error('Or: node parser.js --override <override.json> <token1> <token2> ... <tokenN>');` : ''}
    process.exit(1);
  }
  
  // Add end marker
  const fullTokenStream = [...tokenStream, END_MARKER];
  
  console.log('Parsing token stream:', tokenStream.join(' '));
  console.log('\\n--- Parsing Steps ---\\n');
  
  const result = parse(fullTokenStream);
  
  // Print history
  result.history.forEach((step) => {
    console.log(\`Step \${step.stepNumber}:\`);
    console.log(\`  State: \${step.stateNumber}\`);
    console.log(\`  Stack: [\${step.parseStack.join(', ')}]\`);
    console.log(\`  Progress: \${step.progress.join(' ')}\`);
    if (step.action) {
      const actionStr = JSON.stringify(step.action, null, 2).split('\\n').map(l => '    ' + l).join('\\n');
      console.log(\`  Action:\\n\${actionStr}\`);
    }
    if (step.error) {
      console.log(\`  Error: \${step.error}\`);
    }
    console.log();
  });
  
  // Print result
  if (result.success) {
    console.log('✓ Parse successful!');
    process.exit(0);
  } else {
    console.error('✗ Parse failed:', result.error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { parse, PARSE_TABLE, LR_TABLE, END_MARKER${includeOverrideTable ? ', OVERRIDE_TABLE' : ''} };
`;
}

