import type { NumberedProduction } from '../grammar/grammar';
import type ParseTable from './parse-table';
import type { ParseTableShape } from './parse-table';
import type { Action, GotoAction, ReduceAction, ShiftAction } from '../util/types';
import { LAMBDA_SIGN } from '../components/GrammarInfoSection';

type LrTable = {
  [productionNumber: number]: {
    lhs: string;
    rhsl: number;
  };
};

export type ParseTreeNode = {
  symbol: string;
  children: ParseTreeNode[] | null;
  isLambda: boolean;
};

export type ParserBaseStatus = {
  dotPosition: number;
  tokenStream: string[];
  parseStack: number[];
  errorCode?: ParserErrorCodes;
  treeStack: ParseTreeNode[];
};
type ParserDerivedStatus = {
  stateNumber: number;
  progress: string[];
  nextToken?: string;
  isAccepted: boolean;
};

export type ParserStatus = ParserBaseStatus & ParserDerivedStatus;

export type ParserAction =
  | { type: 'shift'; token: string; destination: number }
  | { type: 'reduce'; ruleNumber: number; lhs: string; rhsl: number; gotoDestination?: number }
  | { type: 'goto'; nonTerminal: string; destination: number }
  | { type: 'accept' }
  | { type: 'error'; errorCode: ParserErrorCodes };

export type ParsingStep = {
  stepNumber: number;
  parseStack: number[];
  dotPosition: number;
  nextToken?: string;
  stateNumber: number;
  action: ParserAction;
  errorCode?: ParserErrorCodes;
  progress: string[];
  treeStack: ParseTreeNode[];
};

export type ParseResult = {
  finalStatus: ParserStatus;
  history: ParsingStep[];
};

export default class Parser {
  private _lrTable: LrTable = {};
  readonly parseTableAnalyzer: ParseTable;
  private _overrideTable: ParseTableShape | null = null;

  constructor(
    parseTableAnalyzer: ParseTable,
    productions: Iterable<NumberedProduction>,
    overrideTable?: ParseTableShape | null
  ) {
    this.parseTableAnalyzer = parseTableAnalyzer;
    this._overrideTable = overrideTable || null;
    this.constructLrTable(productions);
  }

  /**
   * Sets the override table
   */
  setOverrideTable(overrideTable: ParseTableShape | null): void {
    this._overrideTable = overrideTable;
  }

  /**
   * Gets the override table
   */
  get overrideTable(): ParseTableShape | null {
    return this._overrideTable;
  }

  /**
   * Gets action from parse table, checking override table first
   */
  private getAction(stateNumber: number, symbol: string): Action | Action[] | undefined {
    // Check override table first
    if (this._overrideTable && 
        this._overrideTable[stateNumber] && 
        this._overrideTable[stateNumber][symbol] !== undefined) {
      return this._overrideTable[stateNumber][symbol];
    }
    
    // Fall back to main parse table
    return this.parseTableAnalyzer.get(stateNumber, symbol);
  }

  /**
   * Checks if action is an error, checking override table first
   */
  private isErrorAction(stateNumber: number, symbol: string): boolean {
    const action = this.getAction(stateNumber, symbol);
    return action === undefined;
  }

  /**
   * Checks if action is a conflict, checking override table first
   */
  private isConflictAction(stateNumber: number, symbol: string): boolean {
    const action = this.getAction(stateNumber, symbol);
    return Array.isArray(action);
  }

  /**
   * Checks if action is accept, checking override table first
   */
  private isAcceptAction(stateNumber: number, symbol: string): boolean {
    const action = this.getAction(stateNumber, symbol);
    if (Array.isArray(action)) return false;
    return action !== undefined && action.type === 'accept';
  }

  /**
   * Checks if action is shift, checking override table first
   */
  private isShiftAction(stateNumber: number, symbol: string): boolean {
    const action = this.getAction(stateNumber, symbol);
    if (Array.isArray(action)) return false;
    return action !== undefined && action.type === 'shift';
  }

  /**
   * Checks if action is reduce, checking override table first
   */
  private isReduceAction(stateNumber: number, symbol: string): boolean {
    const action = this.getAction(stateNumber, symbol);
    if (Array.isArray(action)) return false;
    return action !== undefined && action.type === 'reduce';
  }

  /**
   * Checks if action is goto, checking override table first
   */
  private isGotoAction(stateNumber: number, symbol: string): boolean {
    const action = this.getAction(stateNumber, symbol);
    if (Array.isArray(action)) return false;
    return action !== undefined && action.type === 'goto';
  }

  private constructLrTable(productions: Iterable<NumberedProduction>) {
    [...productions].forEach((production) => {
      this._lrTable[production.productionNumber] = {
        lhs: production.lhs,
        rhsl: production.rhs.length,
      };
    });
  }

  parse(tokenStream: string[]): ParseResult;
  parse(currentParserStatus: ParserBaseStatus): ParseResult;
  parse(
    tokenStreamOrParserStatus: string[] | ParserBaseStatus
  ): ParseResult {
    let status: ParserBaseStatus;
    if (Array.isArray(tokenStreamOrParserStatus)) {
      const tokenStream = tokenStreamOrParserStatus;
      status = {
        dotPosition: 0,
        parseStack: [1],
        tokenStream: tokenStream,
        treeStack: [],
      };
    } else {
      // If status is already completed (accepted or has error), reset to initial state
      const parserStatus = tokenStreamOrParserStatus as ParserStatus;
      if (parserStatus.isAccepted || parserStatus.errorCode) {
        // Reset to initial state
        status = {
          dotPosition: 0,
          parseStack: [1],
          tokenStream: parserStatus.tokenStream,
          treeStack: [],
        };
      } else {
        status = tokenStreamOrParserStatus;
      }
    }

    const history: ParsingStep[] = [];
    let stepNumber = 0;
    let currentStatus: ParserBaseStatus = status;
    let newStatus: ParserStatus;
    
    while (true) {
      const stepResult = this.stepWithHistory(currentStatus, stepNumber);
      history.push(stepResult.step);
      newStatus = stepResult.status;
      currentStatus = newStatus;
      stepNumber++;
      
      if (newStatus.isAccepted) {
        break;
      }
      if (newStatus.errorCode) {
        break;
      }
    }

    return {
      finalStatus: newStatus,
      history,
    };
  }

  stepWithHistory(
    status: ParserBaseStatus,
    stepNumber: number
  ): { status: ParserStatus; step: ParsingStep } {
    const nextToken = status.tokenStream.at(status.dotPosition);
    const currentStateNumber = status.parseStack.at(-1) || -1;
    let action: ParserAction;
    let newStatus: ParserBaseStatus = status;

    if (!currentStateNumber || currentStateNumber === -1) {
      action = {
        type: 'error',
        errorCode: ParserErrorCodes.EMPTY_PARSE_STACK,
      };
      newStatus = {
        ...status,
        errorCode: ParserErrorCodes.EMPTY_PARSE_STACK,
      };
    } else if (!nextToken) {
      action = {
        type: 'error',
        errorCode: ParserErrorCodes.NO_MORE_TOKENS,
      };
      newStatus = {
        ...status,
        errorCode: ParserErrorCodes.NO_MORE_TOKENS,
      };
    } else if (
      this.isErrorAction(currentStateNumber, nextToken)
    ) {
      action = {
        type: 'error',
        errorCode: ParserErrorCodes.NO_ACTIONS,
      };
      newStatus = {
        ...status,
        errorCode: ParserErrorCodes.NO_ACTIONS,
      };
    } else if (
      this.isConflictAction(currentStateNumber, nextToken)
    ) {
      action = {
        type: 'error',
        errorCode: ParserErrorCodes.CONFLICTING_ACTIONS,
      };
      newStatus = {
        ...status,
        errorCode: ParserErrorCodes.CONFLICTING_ACTIONS,
      };
    } else if (
      this.isAcceptAction(currentStateNumber, nextToken)
    ) {
      action = { type: 'accept' };
      newStatus = {
        ...status,
        errorCode: undefined,
      };
    } else if (
      this.isShiftAction(currentStateNumber, nextToken)
    ) {
      const shiftAction = this.getAction(
        currentStateNumber,
        nextToken
      ) as ShiftAction;
      const newParseStack = [
        ...status.parseStack,
        shiftAction.destination,
      ];
      const newDotPosition = status.dotPosition + 1;
      const treeNode: ParseTreeNode = {
        children: null,
        symbol: nextToken,
        isLambda: false,
      };
      const newTreeStack = status.treeStack.slice();
      newTreeStack.push(treeNode);

      action = {
        type: 'shift',
        token: nextToken,
        destination: shiftAction.destination,
      };
      newStatus = {
        ...status,
        parseStack: newParseStack,
        dotPosition: newDotPosition,
        errorCode: undefined,
        treeStack: newTreeStack,
      };
    } else if (
      this.isReduceAction(currentStateNumber, nextToken)
    ) {
      const reduceAction = this.getAction(
        currentStateNumber,
        nextToken
      ) as ReduceAction;
      const newParseStack = status.parseStack.slice();
      const { lhs, rhsl } = this._lrTable[reduceAction.ruleNumber];
      if (rhsl > 0) {
        newParseStack.splice(-rhsl);
      }
      const newStateNumber = newParseStack.at(-1);

      const newTreeStack = status.treeStack.slice();
      const treeNodeChildren =
        rhsl === 0
          ? [{ symbol: LAMBDA_SIGN, children: null, isLambda: true }]
          : newTreeStack.splice(-rhsl);
      const treeNode: ParseTreeNode = {
        symbol: lhs,
        children: treeNodeChildren,
        isLambda: false,
      };
      newTreeStack.push(treeNode);

      if (!newStateNumber) {
        action = {
          type: 'reduce',
          ruleNumber: reduceAction.ruleNumber,
          lhs,
          rhsl,
        };
        newStatus = {
          ...status,
          errorCode: ParserErrorCodes.EMPTY_PARSE_STACK_AFTER_REDUCING,
          treeStack: newTreeStack,
        };
      } else {
        if (!this.isGotoAction(newStateNumber, lhs)) {
          action = {
            type: 'reduce',
            ruleNumber: reduceAction.ruleNumber,
            lhs,
            rhsl,
          };
          newStatus = {
            ...status,
            errorCode: ParserErrorCodes.NO_WHERE_TO_GOTO,
            treeStack: newTreeStack,
          };
        } else {
          const gotoAction = this.getAction(
            newStateNumber,
            lhs
          ) as GotoAction;

          newParseStack.push(gotoAction.destination);

          action = {
            type: 'reduce',
            ruleNumber: reduceAction.ruleNumber,
            lhs,
            rhsl,
            gotoDestination: gotoAction.destination,
          };

          newStatus = {
            ...status,
            parseStack: newParseStack,
            treeStack: newTreeStack,
            errorCode: undefined,
          };
        }
      }
    } else {
      // Fallback case (should not happen)
      action = {
        type: 'error',
        errorCode: ParserErrorCodes.NO_ACTIONS,
      };
      newStatus = {
        ...status,
        errorCode: ParserErrorCodes.NO_ACTIONS,
      };
    }

    const progress = newStatus.tokenStream.slice();
    const finalStateNumber = newStatus.parseStack.at(-1) || -1;
    const finalNextToken = newStatus.tokenStream.at(newStatus.dotPosition);
    const isAccepted = finalNextToken
      ? this.isAcceptAction(finalStateNumber, finalNextToken)
      : false;
    progress.splice(
      isAccepted ? newStatus.dotPosition + 1 : newStatus.dotPosition,
      0,
      '•'
    );

    const finalStatus: ParserStatus = {
      ...newStatus,
      progress,
      isAccepted,
      stateNumber: finalStateNumber,
      nextToken: isAccepted ? undefined : finalNextToken,
    };

    const step: ParsingStep = {
      stepNumber,
      parseStack: [...status.parseStack],
      dotPosition: status.dotPosition,
      nextToken: status.tokenStream.at(status.dotPosition),
      stateNumber: currentStateNumber,
      action,
      errorCode: newStatus.errorCode,
      progress: [...progress],
      treeStack: [...newStatus.treeStack],
    };

    return { status: finalStatus, step };
  }

  step(tokenStream: string[]): ParserStatus;
  step(status: ParserBaseStatus): ParserStatus;
  step(statusOrTokenStream: string[] | ParserBaseStatus): ParserStatus {
    let status: ParserBaseStatus;
    if (Array.isArray(statusOrTokenStream)) {
      status = {
        dotPosition: 0,
        parseStack: [1],
        tokenStream: statusOrTokenStream,
        treeStack: [],
      };
    } else {
      status = statusOrTokenStream;
    }
    const nextToken = status.tokenStream.at(status.dotPosition);

    const currentStateNumber = status.parseStack.at(-1);

    if (!currentStateNumber) {
      status = {
        ...status,
        errorCode: ParserErrorCodes.EMPTY_PARSE_STACK,
      };
    } else if (!nextToken) {
      status = {
        ...status,
        errorCode: ParserErrorCodes.NO_MORE_TOKENS,
      };
    } else if (
      this.isErrorAction(currentStateNumber, nextToken)
    ) {
      status = {
        ...status,
        errorCode: ParserErrorCodes.NO_ACTIONS,
      };
    } else if (
      this.isConflictAction(currentStateNumber, nextToken)
    ) {
      status = {
        ...status,
        errorCode: ParserErrorCodes.CONFLICTING_ACTIONS,
      };
    } else if (
      this.isAcceptAction(currentStateNumber, nextToken)
    ) {
      status = {
        ...status,
        errorCode: undefined,
      };
    } else if (
      this.isShiftAction(currentStateNumber, nextToken)
    ) {
      const shiftAction = this.getAction(
        currentStateNumber,
        nextToken
      ) as ShiftAction;
      const newParseStack = [
        ...status.parseStack,
        shiftAction.destination,
      ];
      const newDotPosition = status.dotPosition + 1;
      const treeNode: ParseTreeNode = {
        children: null,
        symbol: nextToken,
        isLambda: false,
      };
      const newTreeStack = status.treeStack.slice();
      newTreeStack.push(treeNode);

      status = {
        ...status,
        parseStack: newParseStack,
        dotPosition: newDotPosition,
        errorCode: undefined,
        treeStack: newTreeStack,
      };
    } else if (
      this.isReduceAction(currentStateNumber, nextToken)
    ) {
      const reduceAction = this.getAction(
        currentStateNumber,
        nextToken
      ) as ReduceAction;
      const newParseStack = status.parseStack.slice();
      const { lhs, rhsl } = this._lrTable[reduceAction.ruleNumber];
      if (rhsl > 0) {
        newParseStack.splice(-rhsl);
      }
      const newStateNumber = newParseStack.at(-1);

      const newTreeStack = status.treeStack.slice();
      const treeNodeChildren =
        rhsl === 0
          ? [{ symbol: LAMBDA_SIGN, children: null, isLambda: true }]
          : newTreeStack.splice(-rhsl);
      const treeNode: ParseTreeNode = {
        symbol: lhs,
        children: treeNodeChildren,
        isLambda: false,
      };
      newTreeStack.push(treeNode);

      if (!newStateNumber) {
        status = {
          ...status,
          errorCode: ParserErrorCodes.EMPTY_PARSE_STACK_AFTER_REDUCING,
          treeStack: newTreeStack,
        };
      } else {
        if (!this.isGotoAction(newStateNumber, lhs)) {
          status = {
            ...status,
            errorCode: ParserErrorCodes.NO_WHERE_TO_GOTO,
            treeStack: newTreeStack,
          };
        } else {
          const gotoAction = this.getAction(
            newStateNumber,
            lhs
          ) as GotoAction;

          newParseStack.push(gotoAction.destination);

          status = {
            ...status,
            parseStack: newParseStack,
            treeStack: newTreeStack,
            errorCode: undefined,
          };
        }
      }
    }

    const progress = status.tokenStream.slice();
    const newStateNumber = status.parseStack.at(-1) || -1;
    const newNextToken = status.tokenStream.at(status.dotPosition);
    const isAccepted = newNextToken
      ? this.isAcceptAction(newStateNumber, newNextToken)
      : false;
    progress.splice(
      isAccepted ? status.dotPosition + 1 : status.dotPosition,
      0,
      '•'
    );
    return {
      ...status,
      progress,
      isAccepted,
      stateNumber: newStateNumber,
      nextToken: isAccepted ? undefined : newNextToken,
    };
  }

  /**
   * Restores parser status from a parsing step.
   * This allows undoing/going back to a previous state.
   * The step contains the state BEFORE the action was taken.
   */
  restoreFromStep(step: ParsingStep, tokenStream: string[]): ParserStatus {
    // Reconstruct progress with dot at the step's dot position (before action)
    const progress = tokenStream.slice();
    progress.splice(step.dotPosition, 0, '•');
    
    // Reconstruct treeStack by undoing the action
    let restoredTreeStack: ParseTreeNode[] = [...step.treeStack];
    
    // Undo the action to restore treeStack to before state
    if (step.action.type === 'shift') {
      // Remove the last node that was added
      restoredTreeStack = restoredTreeStack.slice(0, -1);
    } else if (step.action.type === 'reduce') {
      // Remove the reduced node and restore its children
      const reducedNode = restoredTreeStack[restoredTreeStack.length - 1];
      restoredTreeStack = restoredTreeStack.slice(0, -1);
      if (reducedNode.children) {
        restoredTreeStack = [...restoredTreeStack, ...reducedNode.children];
      }
    }
    
    // The state before action should not be accepted and have no error
    // (unless there was a pre-existing error, but we'll set to undefined for undo)
    const isAccepted = false;
    const errorCode = undefined;
    
    return {
      dotPosition: step.dotPosition,
      tokenStream: tokenStream,
      parseStack: [...step.parseStack],
      errorCode: errorCode,
      treeStack: restoredTreeStack,
      stateNumber: step.stateNumber,
      progress: progress,
      nextToken: step.nextToken,
      isAccepted: isAccepted,
    };
  }

  get lrTable(): Readonly<LrTable> {
    return this._lrTable;
  }
}

enum ParserErrorCodes {
  EMPTY_PARSE_STACK = 'parse stack can not be empty.',
  NO_MORE_TOKENS = 'there are no more tokens to parse.',
  CONFLICTING_ACTIONS = 'there are more than one action for the current state with next token.',
  EMPTY_PARSE_STACK_AFTER_REDUCING = 'parse stack is empty after popping the last #rhsl states.',
  NO_WHERE_TO_GOTO = 'goto action for this non-terminal does not exist.',
  NO_ACTIONS = 'no actions exist for the next token at the current state.',
}
