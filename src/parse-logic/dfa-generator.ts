import type Grammar from './grammar';
import {
  type Transition,
  GotoTransition,
  ShiftTransition,
} from './transition';
import HashSet from './hashset';
import Item from './item';
import Production from './production';
import State from './state';
import StateGenerator from './state-generator';
import DFA from './dfa';
import type { ParserType } from './types';

const acceptAction = { type: 'accept' as const, hash: () => 'accept' };
type Accept = typeof acceptAction;

export default class DfaGenerator {
  readonly grammar: Grammar;
  readonly endMarker: string;
  private readonly stateGenerator: StateGenerator;
  constructor(grammar: Grammar, endMarker: string) {
    this.grammar = grammar;
    this.endMarker = endMarker;
    this.stateGenerator = new StateGenerator(grammar);
  }

  private generateArtificialStartSymbol(): string {
    let startSymbol = this.grammar.startSymbol + "'";
    while (
      this.grammar.isNonTerminal(startSymbol) ||
      this.grammar.isTerminal(startSymbol)
    ) {
      startSymbol = startSymbol + "'";
    }
    return startSymbol;
  }

  getTransitionsForState(state: State): HashSet<Transition | Accept> {
    const transitions = new HashSet<Transition | Accept>();
    const symbolsAfterDot = new Set<string>();
    [...state.baseItems, ...state.derivedItems].forEach((item) => {
      if (item.symbolAfterDot) {
        symbolsAfterDot.add(item.symbolAfterDot);
      }
    });

    symbolsAfterDot.forEach((symbol) => {
      const correspondingItems = [
        ...state.baseItems,
        ...state.derivedItems,
      ].filter((item) => item.symbolAfterDot === symbol);

      if (symbol === this.endMarker) {
        transitions.add(acceptAction);
        return;
      }

      const destinationStateBaseItems = correspondingItems.map(
        (item) =>
          new Item(
            item.production,
            item.dotPosition + 1,
            new Set([...item.lookahead])
          )
      );
      const destinationState = this.stateGenerator.generate(
        'lr1',
        new HashSet([...destinationStateBaseItems])
      );

      const isGoto = this.grammar.isNonTerminal(symbol);
      const transition = isGoto
        ? new GotoTransition(
            state,
            destinationState,
            symbol,
            correspondingItems
          )
        : new ShiftTransition(
            state,
            destinationState,
            symbol,
            correspondingItems
          );
      transitions.add(transition);
    });

    return transitions;
  }

  generate(type: ParserType = 'lr1') {
    const dfaStates = new HashSet<State>();
    const dfaTransitions = new HashSet<Transition>();

    const artificialStartSymbol = this.generateArtificialStartSymbol();
    const artificialProduction = new Production(artificialStartSymbol, [
      this.grammar.startSymbol,
      this.endMarker,
    ]);
    const baseItem = new Item(artificialProduction, 0);
    const initialState = this.stateGenerator.generate(
      'lr1',
      new HashSet([baseItem])
    );
    let acceptState: State;

    dfaStates.add(initialState);
    const processedStates = new HashSet<State>();
    const statesToProcess = [initialState];
    const isStateInQueue = (state: State) => {
      return !!statesToProcess.find((s) => s.hash() === state.hash());
    };

    while (statesToProcess.length > 0) {
      const stateToProcess = statesToProcess.shift()!;
      const transitions = this.getTransitionsForState(stateToProcess);

      transitions.forEach((transition) => {
        if (transition.type !== 'accept') {
          const newState = transition.destination;
          if (
            !processedStates.has(newState) &&
            !isStateInQueue(newState)
          ) {
            statesToProcess.push(newState);
          }
          dfaStates.add(newState);
          dfaTransitions.add(transition);
        } else {
          acceptState = stateToProcess;
        }
      });

      processedStates.add(stateToProcess);
    }

    const lr1Dfa = new DFA(
      dfaStates,
      initialState,
      dfaTransitions,
      acceptState!
    );

    if (type === 'lr1') {
      return lr1Dfa;
    }
  }
}
