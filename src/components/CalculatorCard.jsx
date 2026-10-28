export default function CalculatorCard({ calculator }) {
  const { name, category, blurb, icon: Icon, color, target } = calculator;
  return (
    <a className="tool" href={target} style={{ '--c': color }}>
      <span className="cat__icon"><Icon size={26} aria-hidden="true" /></span>
      <h3>{name}</h3>
      <p>{blurb}</p>
      <small>
        <span>{category}</span>
        <span style={{ fontWeight: 700, letterSpacing: '0.02em' }}>Calculate &rarr;</span>
      </small>
    </a>
  );
}
