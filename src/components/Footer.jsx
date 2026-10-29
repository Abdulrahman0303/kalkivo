import Logo from './Logo.jsx';
import { categories } from '../data/categories.js';

export default function Footer() {
  return (
    <footer className="footer" id="about">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo />
          <p>Free, fast calculators for school, work and daily life. No sign-up needed.</p>
        </div>
        <div>
          <h3>Categories</h3>
          <ul>
            {categories.map((c) => (
              <li key={c.id}><a href="#categories">{c.name}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Kalkivo</h3>
          <ul>
            <li><a href="#about">About</a></li>
            <li><a href="/privacy.html">Privacy Policy</a></li>
            <li><a href="https://github.com/Abdulrahman0303/kalkivo" target="_blank" rel="noopener">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">© {new Date().getFullYear()} Kalkivo. Results are for guidance only.</div>
    </footer>
  );
}
