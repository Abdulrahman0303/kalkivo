import { useMemo, useState } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';
import SegmentedControl from '../SegmentedControl.jsx';
import Breakdown from '../Breakdown.jsx';
import ScheduleTable from '../ScheduleTable.jsx';
import SmartAdvisor from '../SmartAdvisor.jsx';
import { readValues } from '../../utils/calcForm.js';
import { copyText } from '../../utils/clipboard.js';

const initial = (fields) => Object.fromEntries(fields.map((f) => [f.name, f.type === 'select' ? f.options[0].value : f.defaultValue ?? '']));

export default function GenericCalculator({ def }) {
  const [raw, setRaw] = useState(() => initial(def.fields));
  const [copiedText, setCopiedText] = useState('');
  const [copyFailed, setCopyFailed] = useState(false);

  const outcome = useMemo(() => {
    const read = readValues(def.fields, raw);
    if (read.status !== 'ok') return read;
    try {
      return { status: 'ok', result: def.compute(read.values), values: read.values };
    } catch (e) {
      return { status: 'error', message: e instanceof RangeError ? e.message : 'These values cannot be calculated.' };
    }
  }, [def, raw]);

  const result = outcome.status === 'ok' ? outcome.result : null;
  const text = result
    ? [def.name, ...result.rows.map(([l, v]) => `${l}: ${v}`), `${result.total[0]}: ${result.total[1]}`].join('\n')
    : '';
  const copied = text !== '' && copiedText === text;

  const copy = async () => {
    const ok = await copyText(text);
    setCopyFailed(!ok);
    setCopiedText(ok ? text : '');
  };

  return (
    <div className="gst">
      <form className="gst__form" onSubmit={(e) => e.preventDefault()} noValidate>
        {def.fields.map((f) =>
          f.type === 'select' ? (
            <SegmentedControl key={f.name} legend={f.label} name={`${def.id}-${f.name}`} options={f.options} value={raw[f.name]} onChange={(v) => setRaw({ ...raw, [f.name]: v })} />
          ) : (
            <div className="field" key={f.name}>
              <label htmlFor={`${def.id}-${f.name}`}>{f.label}</label>
              <div className="field__box">
                <input
                  id={`${def.id}-${f.name}`}
                  type={f.type === 'date' ? 'date' : 'text'}
                  inputMode={f.type === 'date' ? undefined : 'decimal'}
                  autoComplete="off"
                  placeholder={f.type === 'date' ? undefined : (f.placeholder ?? '0')}
                  value={raw[f.name]}
                  onChange={(e) => setRaw({ ...raw, [f.name]: e.target.value })}
                />
              </div>
            </div>
          )
        )}
        {outcome.status === 'error' && <p className="field__error" role="alert">{outcome.message}</p>}
        <button type="button" className="btn btn--ghost" onClick={() => { setRaw(initial(def.fields)); setCopiedText(''); setCopyFailed(false); }}>
          <RotateCcw size={18} aria-hidden="true" /> Reset
        </button>
      </form>

      <section className="gst__summary" aria-label="Calculation summary">
        {result ? (
          <>
            <dl className="gst__rows">
              {result.rows.map(([l, v]) => (
                <div key={l} className="gst__row"><dt>{l}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <div className="gst__total"><span>{result.total[0]}</span><output aria-live="polite">{result.total[1]}</output></div>
            {result.breakdown && <Breakdown parts={result.breakdown} />}
            <SmartAdvisor calculatorId={def.id} values={outcome.values} result={result} />
            <button type="button" className="btn" onClick={copy}>
              {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
              {copied ? 'Copied' : 'Copy result'}
            </button>
            <p className="gst__status" role="status">{copied ? 'Result copied to clipboard.' : copyFailed ? 'Copy was blocked by your browser. Select the text and copy it manually.' : ''}</p>
          </>
        ) : (
          <p className="gst__empty">{outcome.status === 'error' ? 'Fix the highlighted value to see the result.' : 'Fill in the fields to see the result.'}</p>
        )}
      </section>
      {result?.table && <ScheduleTable table={result.table} />}
    </div>
  );
}
