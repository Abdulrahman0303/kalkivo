import { useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import SegmentedControl from '../SegmentedControl.jsx';
import { MathError, evaluate, formatResult } from '../../utils/mathParser.js';
import { copyText } from '../../utils/clipboard.js';

const f = (label, ins, aria) => ({ label, ins, kind: 'fn', aria });
const o = (label, ins, aria) => ({ label, ins, kind: 'op', aria });
const d = (label) => ({ label, ins: label, kind: 'num' });
const a = (label, act, kind = 'fn', aria) => ({ label, act, kind, aria });

const KEYS = [
  f('sin', 'sin('), f('cos', 'cos('), f('tan', 'tan('), f('ln', 'ln('), f('log', 'log('),
  f('asin', 'asin('), f('acos', 'acos('), f('atan', 'atan('), f('√', 'sqrt(', 'Square root'), f('x²', '^2', 'Square'),
  f('(', '('), f(')', ')'), f('xʸ', '^', 'Power'), f('n!', '!', 'Factorial'), f('1/x', '1/(', 'Reciprocal'),
  f('π', 'pi', 'Pi'), f('e', 'e', 'Euler number'), f('mod', ' mod '), f('%', '%', 'Percent'), a('⌫', 'back', 'fn', 'Backspace'),
  d('7'), d('8'), d('9'), o('÷', '/', 'Divide'), a('AC', 'clear', 'fn', 'All clear'),
  d('4'), d('5'), d('6'), o('×', '*', 'Multiply'), a('MC', 'mc', 'fn', 'Memory clear'),
  d('1'), d('2'), d('3'), o('−', '-', 'Subtract'), a('MR', 'mr', 'fn', 'Memory recall'),
  d('0'), d('.'), f('Ans', 'ans', 'Previous answer'), o('+', '+', 'Add'), a('M+', 'mplus', 'fn', 'Add to memory'),
  a('=', 'equals', 'eq wide', 'Equals'), a('M−', 'mminus', 'fn', 'Subtract from memory'),
];

export default function ScientificCalculator() {
  const [expr, setExpr] = useState('');
  const [angle, setAngle] = useState('deg');
  const [ans, setAns] = useState(0);
  const [memory, setMemory] = useState(0);
  const [error, setError] = useState('');
  const [justDone, setJustDone] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('kalkivo_sci_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('kalkivo_sci_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  const value = useMemo(() => {
    if (expr.trim() === '') return null;
    try { return evaluate(expr, { angle, ans }); } catch { return null; }
  }, [expr, angle, ans]);
  const preview = value === null ? '' : formatResult(value);
  const copyValue = justDone ? expr : preview;

  const edit = (next, done = false) => { setExpr(next); setError(''); setJustDone(done); setCopied(false); };
  const insert = (text) => edit(justDone && !/^[\s+\-*/^%!]/.test(text) ? text : expr + text);

  const equals = () => {
    try {
      const v = evaluate(expr, { angle, ans });
      const r = formatResult(v);
      setAns(v);
      setHistory((h) => [{ expr, result: r }, ...h].slice(0, 8));
      edit(r, true);
    } catch (e) {
      setError(e instanceof MathError ? e.message : 'This expression cannot be calculated.');
    }
  };

  const press = (k) => {
    if (k.ins !== undefined) return insert(k.ins);
    if (k.act === 'clear') return edit('');
    if (k.act === 'back') return edit(expr.slice(0, -1));
    if (k.act === 'equals') return equals();
    if (k.act === 'mc') return setMemory(0);
    if (k.act === 'mr') { const r = formatResult(memory); return insert(memory < 0 ? `(${r})` : r); }
    if (value === null) return setError('Enter a valid number or expression first.');
    setMemory((m) => m + (k.act === 'mplus' ? value : -value));
  };

  const copy = async () => {
    const ok = await copyText(copyValue);
    setCopied(ok);
    setCopyFailed(!ok);
  };

  return (
    <div className="sci">
      <SegmentedControl legend="Angle mode" name="sci-angle" options={[{ value: 'deg', label: 'Degrees' }, { value: 'rad', label: 'Radians' }]} value={angle} onChange={setAngle} />

      <div className="sci__screen">
        <input
          aria-label="Expression"
          value={expr}
          onChange={(e) => edit(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); equals(); } }}
          placeholder="Type or tap, e.g. sin(30)+2^3"
          autoComplete="off"
          spellCheck="false"
          inputMode="text"
        />
        <output aria-live="polite">{preview && !justDone ? `= ${preview}` : '\u00A0'}</output>
        {error && <p className="field__error" role="alert">{error}</p>}
        <div className="sci__meta">
          <span>{memory !== 0 ? `Memory: ${formatResult(memory)}` : 'Memory empty'}</span>
          <button type="button" className="btn btn--ghost" onClick={copy} disabled={!copyValue}>
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy result'}
          </button>
        </div>
        {copyFailed && <p className="gst__status" role="status">Copy was blocked by your browser.</p>}
      </div>

      <div className="sci__keys">
        {KEYS.map((k) => (
          <button key={k.label} type="button" className={`key ${k.kind.split(' ').map((c) => `key--${c}`).join(' ')}`} aria-label={k.aria} onClick={() => press(k)}>
            {k.label}
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <section className="sci__history" aria-label="Calculation history">
          <div className="sci__meta">
            <h2>History</h2>
            <button type="button" className="btn btn--ghost" onClick={() => setHistory([])}>Clear history</button>
          </div>
          <ul>
            {history.map((h, i) => (
              <li key={i}><button type="button" onClick={() => edit(h.expr)}><span>{h.expr}</span><strong>= {h.result}</strong></button></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
