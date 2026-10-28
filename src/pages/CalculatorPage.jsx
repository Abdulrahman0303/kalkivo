import { ChevronLeft } from 'lucide-react';
import GenericCalculator from '../components/calculator/GenericCalculator.jsx';

export default function CalculatorPage({ def }) {
  return (
    <section className="page">
      <div className="container">
        <a className="back" href="#/"><ChevronLeft size={18} aria-hidden="true" /> Back to home</a>
        <header className="page__head">
          <h1>{def.name}</h1>
          <p>{def.description}</p>
        </header>
        <GenericCalculator def={def} />
        <p className="page__note"><strong>How it is calculated.</strong> {def.formula} Results are estimates for guidance, not financial advice.</p>
      </div>
    </section>
  );
}
