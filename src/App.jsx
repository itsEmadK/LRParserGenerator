import './App.css';
import Production from './parse-logic/prod.js';
import Grammar from './parse-logic/grammar.js';
import LALR1DFA from './parse-logic/lalr1dfa.js';
import LR0DFA from './parse-logic/lr0dfa.js';
import LR1DFA from './parse-logic/lr1dfa.js';
import ParseTable from './parse-logic/parse-table.js';
import SLR1DFA from './parse-logic/slr1dfa.js';
import Item from './components/Item.jsx';
import PageHeader from './components/PageHeader.jsx';
import GrammarInputSection from './components/GrammarInputSection.jsx';
import { useState } from 'react';
import GrammarInfoSection from './components/GrammarInfoSection.jsx';
import ParserTablesSection from './components/ParserTablesSection.jsx';

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

function App() {
  const [grammar, setGrammar] = useState(initialGrammar);
  const [parseTable, setParseTable] = useState(initialPT);
  function handleRulesSubmission(rules) {
    const gr = new Grammar(rules);
    const dfa = new LR1DFA(gr);
    const pt = new ParseTable(dfa, false);
    setGrammar(gr);
    setParseTable(pt);
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
          <GrammarInfoSection grammar={grammar} />
          <ParserTablesSection parseTable={parseTable} grammar={grammar} />
        </>
      )}
    </>
  );
}

export default App;
