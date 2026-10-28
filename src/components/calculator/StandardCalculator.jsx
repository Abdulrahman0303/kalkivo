import { useEffect, useReducer, useRef, useState } from 'react';
import { Delete, History, Trash2 } from 'lucide-react';
import { reducer, initialState, formatNumber } from '../../utils/calculatorEngine.js';

const digit = (d) => ({ label: d, action: { type: 'digit', value: d } });
const op = (symbol, aria) => ({ label: symbol, action: { type: 'operator', value: symbol }, kind: 'op', aria });

const KEYS = [
  { label: 'AC', action: { type: 'clear' }, kind: 'fn', aria: 'All clear' },
  { label: <Delete size={20} />, action: { type: 'backspace' }, kind: 'fn', aria: 'Backspace' },
  { label: '%', action: { type: 'percent' }, kind: 'fn', aria: 'Percent' },
  op('÷', 'Divide'),
  digit('7'), digit('8'), digit('9'), op('×', 'Multiply'),
  digit('4'), digit('5'), digit('6'), op('−', 'Subtract'),
  digit('1'), digit('2'), digit('3'), op('+', 'Add'),
  { label: '±', action: { type: 'negate' }, kind: 'fn', aria: 'Toggle sign' },
  digit('0'),
  { label: '.', action: { type: 'decimal' }, aria: 'Decimal point' },
  { label: '=', action: { type: 'equals' }, kind: 'eq', aria: 'Equals' },
];

const OPERATOR_KEYS = { '+': '+', '-': '−', '*': '×', '/': '÷' };

export default function StandardCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('kalkivo_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const lastRecordedRef = useRef('');

  useEffect(() => {
    if (state.expression && state.expression.includes('=') && state.expression !== lastRecordedRef.current) {
      lastRecordedRef.current = state.expression;
      const item = { expr: state.expression, result: formatNumber(state.current), timestamp: Date.now() };
      setHistory((prev) => {
        const next = [item, ...prev].slice(0, 10);
        try { localStorage.setItem('kalkivo_calc_history', JSON.stringify(next)); } catch {}
        return next;
      });
    }
  }, [state.expression, state.current]);

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem('kalkivo_calc_history'); } catch {}
  };

  // Keyboard support works while focus is inside the calculator,
  // so typing in the search bar is never hijacked.
  const onKeyDown = (e) => {
    const k = e.key;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^\d$/.test(k)) dispatch({ type: 'digit', value: k });
    else if (k === '.') dispatch({ type: 'decimal' });
    else if (OPERATOR_KEYS[k]) dispatch({ type: 'operator', value: OPERATOR_KEYS[k] });
    else if (k === '%') dispatch({ type: 'percent' });
    else if (k === 'Enter' || k === '=') { e.preventDefault(); dispatch({ type: 'equals' }); }
    else if (k === 'Backspace') dispatch({ type: 'backspace' });
    else if (k === 'Escape' || k === 'Delete') dispatch({ type: 'clear' });
  };

  const shown = formatNumber(state.current);
  const size = shown.length > 14 ? 'xs' : shown.length > 10 ? 'sm' : 'md';

  return (
    <section id="calculator" className="calc" aria-label="Standard calculator" tabIndex={-1} onKeyDown={onKeyDown}>
      <div className="calc__screen" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowHistory((s) => !s)}
            style={{
              background: 'transparent',
              border: 0,
              color: showHistory ? 'var(--accent)' : 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.82rem',
              padding: '0.2rem 0.4rem',
              borderRadius: '6px',
            }}
            title="Toggle calculation history"
          >
            <History size={16} /> {history.length > 0 ? history.length : ''}
          </button>
          <div className="calc__expr" aria-hidden="true">{state.expression || '\u00A0'}</div>
        </div>
        <output className={`calc__value calc__value--${size}`} aria-live="polite">{shown}</output>
      </div>

      {showHistory && (
        <div style={{
          background: 'var(--key)',
          borderRadius: '16px',
          padding: '0.8rem',
          marginBottom: '0.8rem',
          maxHeight: '160px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Recent Calculations</span>
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                style={{ background: 'transparent', border: 0, color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: '0.5rem 0' }}>No history yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.3rem' }}>
              {history.map((h, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => {
                      const cleanNum = String(h.result).replace(/,/g, '');
                      dispatch({ type: 'set', value: cleanNum });
                      setShowHistory(false);
                    }}
                    style={{
                      width: '100%',
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      padding: '0.3rem 0.6rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: 'var(--ink)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ color: 'var(--muted)' }}>{h.expr}</span>
                    <strong>{h.result}</strong>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="calc__keys">
        {KEYS.map((k, i) => {
          const active = k.kind === 'op' && state.overwrite && state.operator === k.action.value;
          return (
            <button key={i} type="button" className={`key ${k.kind ? `key--${k.kind}` : ''} ${active ? 'is-active' : ''}`} aria-label={k.aria} onClick={() => dispatch(k.action)}>
              {k.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
