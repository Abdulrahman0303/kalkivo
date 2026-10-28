import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const LINKS = [
  { label: 'Calculator', href: '#calculator' },
  { label: 'GST', href: '#/gst-calculator' },
  { label: 'Categories', href: '#categories' },
  { label: 'About', href: '#about' },
];

export default function Navbar({ theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="nav" id="top">
      <div className="container nav__inner">
        <Logo />
        <nav className={`nav__links ${open ? 'is-open' : ''}`} aria-label="Main">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
          ))}
        </nav>
        <div className="nav__actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button type="button" className="icon-btn nav__burger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
