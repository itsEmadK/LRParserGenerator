import AutomataSection from './components/AutomataSection.tsx';
import GrammarInfoSection from './components/GrammarInfoSection.tsx';
import GrammarInputSection from './components/GrammarInputSection.tsx';
import PageHeader from './components/PageHeader.tsx';
import ParserSection from './components/ParserSection.tsx';
import ParserTablesSection from './components/ParserTablesSection.tsx';
import AppProvider from './contexts/AppContext.tsx';

export default function App() {
  return (
    <AppProvider>
      <PageHeader />
      <GrammarInputSection />
      <GrammarInfoSection />
      <ParserTablesSection />
      <AutomataSection />
      <ParserSection />
    </AppProvider>
  );
}
