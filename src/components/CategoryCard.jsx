export default function CategoryCard({ category }) {
  const { name, icon: Icon, color, blurb, examples, span } = category;
  return (
    <article className={`cat cat--span${span}`} style={{ '--c': color }}>
      <span className="cat__icon"><Icon size={26} aria-hidden="true" /></span>
      <h3>{name}</h3>
      <p>{blurb}</p>
      <ul className="cat__tags">
        {examples.map((e) => <li key={e}>{e}</li>)}
      </ul>
    </article>
  );
}
