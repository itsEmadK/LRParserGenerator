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

  getOutgoingTransitions(state: State): HashSet<Transition | Accept> {
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

  private convertLr1DfaToLalr1(dfa: DFA): DFA {
    const lalr1States = new HashSet<State>();
    const pools = dfa.getSimilarLalr1States();
    pools.forEach((pool) => {
      let mergedState = this.stateGenerator.mergeStates(...pool);
      mergedState = new State(
        'lalr1',
        new HashSet([...mergedState.baseItems]),
        new HashSet([...mergedState.derivedItems])
      );
      lalr1States.add(mergedState);
    });

    const initialState = lalr1States.values.find(
      (state) => state.hash(false) === dfa.initialState.hash(false)
    );
    const acceptState = lalr1States.values.find(
      (state) => state.hash(false) === dfa.acceptState.hash(false)
    );

    const newTransitions = dfa.transitions.values.map((transition) => {
      const source = lalr1States.values.find(
        (state) => state.hash(false) === transition.source.hash(false)
      );
      const destination = lalr1States.values.find(
        (state) => state.hash(false) === transition.destination.hash(false)
      );
      const newTransition =
        transition.type === 'goto'
          ? new GotoTransition(
              source!,
              destination!,
              transition.nonTerminal,
              transition.originatingItems
            )
          : new ShiftTransition(
              source!,
              destination!,
              transition.terminal,
              transition.originatingItems
            );
      return newTransition;
    });

    return new DFA(
      lalr1States,
      initialState!,
      new HashSet([...newTransitions]),
      acceptState!
    );
  }

  private stripLookaheadsSlr1(dfa: DFA): DFA {
    const slr1States = dfa.states.values.map((state) =>
      this.stateGenerator.generate(
        'slr1',
        new HashSet([...state.baseItems])
      )
    );
    const slr1Dfa = new DFA(
      new HashSet(slr1States),
      dfa.initialState,
      new HashSet([...dfa.transitions]),
      dfa.acceptState
    );
    return slr1Dfa;
  }

  private stripLookaheadsToLr0(dfa: DFA): DFA {
    const lr0States = dfa.states.values.map((state) =>
      this.stateGenerator.generate(
        'lr0',
        new HashSet([...state.baseItems])
      )
    );
    const lr0Dfa = new DFA(
      new HashSet(lr0States),
      dfa.initialState,
      new HashSet([...dfa.transitions]),
      dfa.acceptState
    );
    return lr0Dfa;
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
      const transitions = this.getOutgoingTransitions(stateToProcess);

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
    const lalr1Dfa = this.convertLr1DfaToLalr1(lr1Dfa);
    const slr1Dfa = this.stripLookaheadsSlr1(lalr1Dfa);
    const lr0Dfa = this.stripLookaheadsToLr0(lalr1Dfa);

    if (type === 'lr0') {
      return lr0Dfa;
    } else if (type === 'slr1') {
      return slr1Dfa;
    } else if (type === 'lalr1') {
      return lalr1Dfa;
    } else {
      return lr1Dfa;
    }
  }
}
