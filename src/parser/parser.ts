import type { NumberedProduction } from '../grammar/grammar';
import type ParseTable from './parse-table';
import type { GotoAction, ReduceAction, ShiftAction } from '../util/types';
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
type ParseTableOverride = {
  [state: number]: {
    [symbol: string]: any;
  };
};
export type ParserStatus = ParserBaseStatus & ParserDerivedStatus;

export type ParserStepHistoryItem = ParserStatus;

export default class Parser {
  private _lrTable: LrTable = {};
  readonly parseTableAnalyzer: ParseTable;
  readonly parseTableOverrideAnalyzer: ParseTableOverride;
  public history: ParserStepHistoryItem[] = [];
  constructor(
    parseTableAnalyzer: ParseTable,
    parseTableOverrideAnalyzer: ParseTableOverride,
    productions: Iterable<NumberedProduction>,
  ) {
    this.parseTableAnalyzer = parseTableAnalyzer;
    this.parseTableOverrideAnalyzer = parseTableOverrideAnalyzer;
    this.constructLrTable(productions);
  }

  private constructLrTable(productions: Iterable<NumberedProduction>) {
    [...productions].forEach((production) => {
      this._lrTable[production.productionNumber] = {
        lhs: production.lhs,
        rhsl: production.rhs.length,
      };
    });
  }

  parse(tokenStream: string[]): ParserStatus;
  parse(currentParserStatus: ParserBaseStatus): ParserStatus;
  parse(
    tokenStreamOrParserStatus: string[] | ParserBaseStatus
  ): ParserStatus {
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
      status = tokenStreamOrParserStatus;
    }

    let newStatus;
    while (true) {
      newStatus = this.step(newStatus || status);
      if (newStatus.isAccepted) {
        break;
      }
      if (newStatus.errorCode) {
        break;
      }
    }

    return newStatus;
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
      this.parseTableOverrideAnalyzer?.[currentStateNumber]?.[nextToken]
    ) {
      const overrideAction =
        this.parseTableOverrideAnalyzer[currentStateNumber][nextToken];

      if (overrideAction.type === 'accept') {
        status = {
          ...status,
          errorCode: undefined,
        };

      } else if (overrideAction.type === 'shift') {
        const newParseStack = [
          ...status.parseStack,
          overrideAction.destination,
        ];

        const treeNode: ParseTreeNode = {
          symbol: nextToken,
          children: null,
          isLambda: false,
        };

        const newTreeStack = status.treeStack.slice();
        newTreeStack.push(treeNode);

        status = {
          ...status,
          parseStack: newParseStack,
          dotPosition: status.dotPosition + 1,
          treeStack: newTreeStack,
          errorCode: undefined,
        };

      } else if (overrideAction.type === 'reduce') {
        const { lhs, rhsl } = this._lrTable[overrideAction.ruleNumber];

        const newParseStack = status.parseStack.slice();
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
        } else if (!this.parseTableAnalyzer.isGoto(newStateNumber, lhs)) {
          status = {
            ...status,
            errorCode: ParserErrorCodes.NO_WHERE_TO_GOTO,
            treeStack: newTreeStack,
          };
        } else {
          const gotoAction = this.parseTableAnalyzer.get(
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

      } else if (overrideAction.type === 'shift_reduce') {
        const newParseStack = [
          ...status.parseStack,
          overrideAction.destination,
        ];

        const treeNode: ParseTreeNode = {
          symbol: nextToken,
          children: null,
          isLambda: false,
        };

        const newTreeStack = status.treeStack.slice();
        newTreeStack.push(treeNode);

        status = {
          ...status,
          parseStack: newParseStack,
          dotPosition: status.dotPosition + 1,
          treeStack: newTreeStack,
          errorCode: undefined,
        };
      }
    }
    else if (
      this.parseTableAnalyzer.isError(currentStateNumber, nextToken)
    ) {
      status = {
        ...status,
        errorCode: ParserErrorCodes.NO_ACTIONS,
      };
    } else if (
      this.parseTableAnalyzer.isConflict(currentStateNumber, nextToken)
    ) {
      status = {
        ...status,
        errorCode: ParserErrorCodes.CONFLICTING_ACTIONS,
      };
    } else if (
      this.parseTableAnalyzer.isAccept(currentStateNumber, nextToken)
    ) {
      status = {
        ...status,
        errorCode: undefined,
      };
    } else if (
      this.parseTableAnalyzer.isShift(currentStateNumber, nextToken)
    ) {
      const shiftAction = this.parseTableAnalyzer.get(
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
      this.parseTableAnalyzer.isReduce(currentStateNumber, nextToken)
    ) {
      const reduceAction = this.parseTableAnalyzer.get(
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
        if (!this.parseTableAnalyzer.isGoto(newStateNumber, lhs)) {
          status = {
            ...status,
            errorCode: ParserErrorCodes.NO_WHERE_TO_GOTO,
            treeStack: newTreeStack,
          };
        } else {
          const gotoAction = this.parseTableAnalyzer.get(
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
      ? this.parseTableAnalyzer.isAccept(newStateNumber, newNextToken)
      : false;
    progress.splice(
      isAccepted ? status.dotPosition + 1 : status.dotPosition,
      0,
      '•'
    );
    const parserStatus: ParserStatus = { ...status, progress, isAccepted, stateNumber: newStateNumber, nextToken: isAccepted ? undefined : newNextToken };
    const last = this.history[this.history.length - 1];
    if (!last || last.stateNumber !== parserStatus.stateNumber || last.dotPosition !== parserStatus.dotPosition) {
      this.history.push(parserStatus);
    } return parserStatus;
  }

  back(): ParserStatus | undefined {
    if (this.history.length <= 1) return undefined;
    this.history.pop();
    return this.history[this.history.length - 1];
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