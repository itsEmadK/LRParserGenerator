import type Grammar from '../grammar/grammar';
import { Transition } from './transition';
import HashSet from '../util/hashset';
import Item from './item';
import Production from '../grammar/production';
import State from './state';
import StateGenerator from './state-generator';
import DFA from './dfa';
import type { ParserType } from '../util/types';
import { NumberedProduction } from '../grammar/grammar';

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

  private getOutgoingTransitions(
    state: State
  ): HashSet<Transition | Accept> {
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
            new Set([...(item.lookahead || [])])
          )
      );
      const destinationState = this.stateGenerator.generate(
        destinationStateBaseItems
      );

      const isGoto = this.grammar.isNonTerminal(symbol);
      const transition = new Transition(
        isGoto ? 'goto' : 'shift',
        state,
        destinationState,
        symbol,
        correspondingItems
      );
      transitions.add(transition);
    });

    return transitions;
  }

  private mergeSimilarDfaStates(dfa: DFA): DFA {
    const mergedStates = new HashSet<State>();
    const pools = dfa.findStatesWithSimilarItems();
    pools.forEach((pool) => {
      let mergedState = this.stateGenerator.mergeStates(...pool);
      mergedState = new State(
        new HashSet([...mergedState.baseItems]),
        new HashSet([...mergedState.derivedItems])
      );
      mergedStates.add(mergedState);
    });

    const initialState = mergedStates.values.find(
      (state) =>
        state.withoutLookaheads().hash() ===
        dfa.initialState.withoutLookaheads().hash()
    );
    const acceptState = mergedStates.values.find(
      (state) =>
        state.withoutLookaheads().hash() ===
        dfa.acceptState.withoutLookaheads().hash()
    );

    const newTransitions = dfa.transitions.values.map((transition) => {
      const source = mergedStates.values.find(
        (state) =>
          state.withoutLookaheads().hash() ===
          transition.source.withoutLookaheads().hash()
      );
      const destination = mergedStates.values.find(
        (state) =>
          state.withoutLookaheads().hash() ===
          transition.destination.withoutLookaheads().hash()
      );
      const newTransition = new Transition(
        transition.type,
        source!,
        destination!,
        transition.symbol,
        transition.originatingItems
      );

      return newTransition;
    });

    return new DFA(
      mergedStates,
      initialState!,
      new HashSet([...newTransitions]),
      acceptState!
    );
  }

  private removeAllLookaheads(dfa: DFA): DFA {
    const slr1States = dfa.states.values.map((state) =>
      state.withoutLookaheads()
    );
    const slr1Transitions = dfa.transitions.values.map((transition) => {
      return new Transition(
        transition.type,
        transition.source.withoutLookaheads(),
        transition.destination.withoutLookaheads(),
        transition.symbol,
        transition.originatingItems
      );
    });
    const slr1Dfa = new DFA(
      slr1States,
      dfa.initialState.withoutLookaheads(),
      slr1Transitions,
      dfa.acceptState.withoutLookaheads()
    );
    return slr1Dfa;
  }

  generate(parserType: ParserType) {
    const dfaStates = new HashSet<State>();
    const dfaTransitions = new HashSet<Transition>();

    const artificialStartSymbol = this.generateArtificialStartSymbol();
    const artificialProduction = new NumberedProduction(
      -1,
      new Production(artificialStartSymbol, [
        this.grammar.startSymbol,
        this.endMarker,
      ])
    );
    const baseItem = new Item(artificialProduction, 0, []);
    const initialState = this.stateGenerator.generate([baseItem]);
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
    const lalr1Dfa = this.mergeSimilarDfaStates(lr1Dfa);
    const slr1Dfa = this.removeAllLookaheads(lalr1Dfa);
    const lr0Dfa = slr1Dfa;

    switch (parserType) {
      case 'lr1': {
        return lr1Dfa;
      }
      case 'lalr1': {
        return lalr1Dfa;
      }
      case 'slr1': {
        return slr1Dfa;
      }
      case 'lr0': {
        return lr0Dfa;
      }
    }
  }
}
