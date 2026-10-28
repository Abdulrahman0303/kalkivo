export default function Logo() {
  return (
    <a href="#top" className="logo" aria-label="Kalkivo home">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--accent)" />
        <path d="M10 8v16M22 8l-9 8 9 8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Kalkivo</span>
    </a>
  );
}
