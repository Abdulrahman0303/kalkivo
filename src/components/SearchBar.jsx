import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { calculators } from '../data/calculators.js';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setFocused(true);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
        setFocused(true);
      } else if (e.key === 'Escape' && focused) {
        setFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focused]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return calculators.filter((c) => `${c.name} ${c.category}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const showList = focused && query.trim().length > 0;

  return (
    <div className="search" onFocus={() => setFocused(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
      <label className="search__field">
        <Search size={20} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search calculators, e.g. EMI, Age or GST"
          aria-label="Search calculators"
        />
        <kbd style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem', borderRadius: '6px', background: 'var(--key)', color: 'var(--muted)', fontWeight: 600, border: '1px solid var(--line)' }}>
          Ctrl K
        </kbd>
      </label>
      {showList && (
        <ul className="search__list">
          {results.length === 0 && <li className="search__empty">No calculator matches "{query}". Try a different word.</li>}
          {results.map((c) => (
            <li key={c.id}>
              {c.status === 'live' ? (
                <a href={c.target} onClick={() => { setFocused(false); setQuery(''); }}>
                  <span>{c.name}</span><small>{c.category}</small>
                </a>
              ) : (
                <div className="is-soon" aria-disabled="true">
                  <span>{c.name}</span><small>Coming soon</small>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
