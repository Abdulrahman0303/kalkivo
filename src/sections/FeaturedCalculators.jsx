import CalculatorCard from '../components/CalculatorCard.jsx';
import { calculators } from '../data/calculators.js';

export default function FeaturedCalculators() {
  const live = calculators.filter((c) => c.status === 'live');
  return (
    <section className="section" id="calculators">
      <div className="container">
        <h2>Ready to use</h2>
        <div className="tool-grid">
          {live.map((c) => <CalculatorCard key={c.id} calculator={c} />)}
        </div>
      </div>
    </section>
  );
}
