// Stacked bar showing how parts (e.g. principal vs interest) make up a total.
export default function Breakdown({ parts }) {
  const total = parts.reduce((s, p) => s + p.amount, 0);
  if (!(total > 0)) return null;
  const share = (p) => Math.round((p.amount / total) * 100);
  return (
    <div className="split">
      <div className="split__bar" role="img" aria-label={parts.map((p) => `${p.label} ${share(p)}%`).join(', ')}>
        {parts.map((p, i) => <span key={p.label} className={`split__seg split__seg--${i}`} style={{ width: `${(p.amount / total) * 100}%` }} />)}
      </div>
      <ul className="split__legend">
        {parts.map((p, i) => (
          <li key={p.label}><i className={`split__dot split__seg--${i}`} aria-hidden="true" />{p.label}: {p.display} ({share(p)}%)</li>
        ))}
      </ul>
    </div>
  );
}
