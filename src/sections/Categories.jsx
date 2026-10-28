import CategoryCard from '../components/CategoryCard.jsx';
import { categories } from '../data/categories.js';

export default function Categories() {
  return (
    <section className="section" id="categories">
      <div className="container">
        <h2>Browse by category</h2>
        <p className="section__sub">Calculators are being added category by category. The ones that are ready to use are listed above.</p>
        <div className="cat-grid">
          {categories.map((c) => <CategoryCard key={c.id} category={c} />)}
        </div>
      </div>
    </section>
  );
}
