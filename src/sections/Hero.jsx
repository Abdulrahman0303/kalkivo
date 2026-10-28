import SearchBar from '../components/SearchBar.jsx';
import StandardCalculator from '../components/calculator/StandardCalculator.jsx';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content', padding: '0.35rem 0.85rem', borderRadius: '99px', background: 'var(--op)', border: '1px solid color-mix(in srgb, var(--accent) 30%, var(--line))', color: 'var(--accent)', fontSize: '0.86rem', fontWeight: 600 }}>
            <span>⚡</span> Free All-in-One Calculation Suite
          </div>
          <h1>Every calculation, in <span className="gradient-text">one clean place.</span></h1>
          <p>Work out sums, loans, GST, health and conversions without hunting through ten different sites. Fast, accurate, and completely free.</p>
          <SearchBar />
        </div>
        <StandardCalculator />
      </div>
    </section>
  );
}
