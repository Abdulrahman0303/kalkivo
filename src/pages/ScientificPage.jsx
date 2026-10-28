import { ChevronLeft } from 'lucide-react';
import ScientificCalculator from '../components/calculator/ScientificCalculator.jsx';

export default function ScientificPage() {
  return (
    <section className="page">
      <div className="container">
        <a className="back" href="#/"><ChevronLeft size={18} aria-hidden="true" /> Back to home</a>
        <header className="page__head">
          <h1>Scientific Calculator</h1>
          <p>Brackets, powers, roots, logarithms, trigonometry and memory, with degree and radian modes.</p>
        </header>
        <ScientificCalculator />
        <p className="page__note">
          Calculations follow the usual order of operations. The % key divides by 100, so 200+10% gives 200.1. Type × between values (2×π, not 2π). Trigonometry uses the angle mode selected above, and an open bracket at the end is closed for you.
        </p>
      </div>
    </section>
  );
}
