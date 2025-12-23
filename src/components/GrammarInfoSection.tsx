import {
  useCompatibleParserTypes,
  useFirst,
  useFollow,
  useIsNullable,
  useNonTerminals,
  useProductions,
  useTerminals,
} from '../contexts/AppContext';
import type { NumberedProduction } from '../grammar/grammar';
import styles from '../styles/grammar-info-section.module.css';
import type { ParserType } from '../util/types';

const CHECKMARK = '✔';
const CROSS = '✖';
export const SPACED_ARROW = ' -> ';
export const LAMBDA_SIGN = 'λ';

type ProductionsTableProps = {
  productions: NumberedProduction[];
};
type NonTerminalsTableProps = {
  nonTerminals: string[];
  getFirst: (nonTerminal: string) => Iterable<string>;
  getFollow: (nonTerminal: string) => Iterable<string>;
  isNullable: (nonTerminal: string) => boolean;
};
type TerminalsTableProps = {
  terminals: string[];
};
type CompatibilityTableProps = {
  compatibles: ParserType[];
};

export default function GrammarInfoSection() {
  const productions = useProductions();
  const terminals = useTerminals();
  const nonTerminals = useNonTerminals();
  const getFirst = useFirst;
  const getFollow = useFollow;
  const isNullable = useIsNullable;
  const compatibleTypes = useCompatibleParserTypes();

  return (
    <section className={styles['grammar-info-section']}>
      <h2 className={styles['heading']}>Grammar info:</h2>
      <div className={styles['tables']}>
        <ProductionsTable productions={[...productions]} />
        <TerminalsTable terminals={[...terminals]} />
        <NonTerminalsTable
          getFirst={getFirst}
          getFollow={getFollow}
          isNullable={isNullable}
          nonTerminals={[...nonTerminals]}
        />
        <CompatibilityTable compatibles={compatibleTypes} />
      </div>
    </section>
  );
}

function ProductionsTable({ productions }: ProductionsTableProps) {
  return (
    <table className={styles['rules']}>
      <thead>
        <tr>
          <th colSpan={2}>Productions</th>
        </tr>
        <tr>
          <th>Number</th>
          <th>Production</th>
        </tr>
      </thead>
      <tbody>
        {productions.map((production) => {
          return (
            <tr key={production.productionNumber}>
              <td>{production.productionNumber}</td>
              <td>
                {production.lhs}
                {SPACED_ARROW}
                {production.isLambdaProduction()
                  ? LAMBDA_SIGN
                  : production.rhs.join(' ')}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function NonTerminalsTable({
  nonTerminals,
  getFirst,
  getFollow,
  isNullable,
}: NonTerminalsTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th colSpan={4}>Non Terminals</th>
        </tr>
        <tr>
          <th>Non Terminal</th>
          <th>Nullable</th>
          <th>First</th>
          <th>Follow</th>
        </tr>
      </thead>
      <tbody>
        {nonTerminals.map((nonTerminal, index) => {
          return (
            <tr key={index}>
              <td>{nonTerminal}</td>
              <td>{isNullable(nonTerminal) ? CHECKMARK : CROSS}</td>
              <td>{[...getFirst(nonTerminal)].join(', ')}</td>
              <td>{[...getFollow(nonTerminal)].join(', ')}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TerminalsTable({ terminals }: TerminalsTableProps) {
  return (
    <table className={styles['terminals']}>
      <thead>
        <tr>
          <th>Terminals</th>
        </tr>
      </thead>
      <tbody>
        {terminals.map((terminal, index) => (
          <tr key={index}>
            <td>{terminal}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CompatibilityTable({ compatibles }: CompatibilityTableProps) {
  return (
    <table className={styles['compatibles']}>
      <thead>
        <tr>
          <th colSpan={2}>Compatibility</th>
        </tr>
        <tr>
          <th>Parser</th>
          <th>Supported</th>
        </tr>
      </thead>
      <tbody>
        {['lr0', 'slr1', 'lalr1', 'lr1'].map((parserType) => (
          <tr key={parserType}>
            <td>{parserType.toUpperCase()}</td>
            <td>
              {compatibles.includes(parserType as ParserType)
                ? CHECKMARK
                : CROSS}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
