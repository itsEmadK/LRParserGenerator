import './App.css';
import Production from './parse-logic/prod.js';
import Grammar from './parse-logic/grammar.js';
import LALR1DFA from './parse-logic/lalr1dfa.js';
import LR0DFA from './parse-logic/lr0dfa.js';
import LR1DFA from './parse-logic/lr1dfa.js';
import ParseTable from './parse-logic/parse-table.js';
import SLR1DFA from './parse-logic/slr1dfa.js';
import PageHeader from './components/PageHeader.jsx';
import GrammarInputSection from './components/GrammarInputSection.jsx';
import { useState } from 'react';
import GrammarInfoSection from './components/GrammarInfoSection.jsx';
import ParserTablesSection from './components/ParserTablesSection.jsx';
import AutomataSection from './components/AutomataSection.jsx';
import ParserSection from './components/ParserSection.jsx';
import Parser from './parse-logic/parser.js';

const initialRulesStr = `E -> T E'
E' ->
E' -> + T E'
T -> F T'
T' ->
T' -> * F T'
F -> id
F -> ( E )`;

const initialGrammar = new Grammar(
  initialRulesStr.split('\n').map((r) => Production.fromString(r))
);
const initialDFA = new LALR1DFA(initialGrammar);
const initialPT = new ParseTable(initialDFA);
const initialParser = new Parser(initialPT, initialGrammar);
initialParser.setInput('id + id * id');
initialParser.run();

function App() {
  const [grammar, setGrammar] = useState(initialGrammar);
  const [parseTable, setParseTable] = useState(initialPT);
  const [parserType, setParserType] = useState('LALR1');
  const [dfa, setDfa] = useState(initialDFA);
  const [parser, setParser] = useState(initialParser);

  function handleRulesSubmission(rules) {
    const gr = new Grammar(rules);
    let newDFA;
    switch (parserType) {
      case 'LR0':
        newDFA = new LR0DFA(gr);
        break;
      case 'SLR1':
        newDFA = new SLR1DFA(gr);
        break;
      case 'LALR1':
        newDFA = new LALR1DFA(gr);
        break;
      case 'LR1':
        newDFA = new LR1DFA(gr);
        break;
    }
    const pt = new ParseTable(newDFA, parserType === 'LR1');
    const parser = new Parser(pt);
    setGrammar(gr);
    setParseTable(pt);
    setDfa(newDFA);
    setParser(parser);
  }
  function handleParserTypeChange(newType) {
    let newDFA;
    switch (newType) {
      case 'LR0':
        newDFA = new LR0DFA(grammar);
        break;
      case 'SLR1':
        newDFA = new SLR1DFA(grammar);
        break;
      case 'LALR1':
        newDFA = new LALR1DFA(grammar);
        break;
      case 'LR1':
        newDFA = new LR1DFA(grammar);
        break;
    }
    let newParseTable = new ParseTable(newDFA, newType === 'LR1');
    const parser = new Parser(newParseTable);
    setParserType(newType);
    setParseTable(newParseTable);
    setParser(parser);
    setDfa(newDFA);
  }

  return (
    <>
      <PageHeader />
      <GrammarInputSection
        initialRules={initialRulesStr}
        onSubmit={handleRulesSubmission}
      />
      {grammar && (
        <>
          {
            // TODO: Optimization; should fix the keys on the table cells and table rows
          }
          <GrammarInfoSection key={grammar.toString()} grammar={grammar} />
          <ParserTablesSection
            key={parseTable.toString()}
            parserType={parserType}
            parseTable={parseTable}
            grammar={grammar}
            onParserTypeChange={handleParserTypeChange}
          />
          <AutomataSection dfa={dfa} />
          <ParserSection parser={parser} />
        </>
      )}
    </>
  );
}

export default App;
