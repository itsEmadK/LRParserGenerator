import AutomataSection from './components/AutomataSection.tsx';
import CodeGenerationSection from './components/CodeGenerationSection.tsx';
import GrammarInfoSection from './components/GrammarInfoSection.tsx';
import GrammarInputSection from './components/GrammarInputSection.tsx';
import OverrideTableSection from './components/OverrideTableSection.tsx';
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
      <OverrideTableSection />
      <AutomataSection />
      <ParserSection />
      <CodeGenerationSection />
    </AppProvider>
  );
}
