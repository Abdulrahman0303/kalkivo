import { useMemo, useRef, useState } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';
import SegmentedControl from '../SegmentedControl.jsx';
import SmartAdvisor from '../SmartAdvisor.jsx';
import { GST_RATES, buildSummaryText, calculateGst, fmtRate, formatINR, parseAmount, parseRate } from '../../utils/gstEngine.js';
import { copyText } from '../../utils/clipboard.js';

const MODES = [
  { value: 'add', label: 'Add GST' },
  { value: 'remove', label: 'Remove GST' },
];
const SUPPLY = [
  { value: 'intra', label: 'Intra-state' },
  { value: 'inter', label: 'Inter-state' },
];
const RATE_OPTIONS = [...GST_RATES.map((r) => ({ value: r, label: `${r}%` })), { value: 'custom', label: 'Custom' }];
const DEFAULTS = { mode: 'add', rate: 18, supplyType: 'intra' };

export default function GstCalculator() {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [supplyType, setSupplyType] = useState(DEFAULTS.supplyType);
  const [customRate, setCustomRate] = useState('');
  const [copiedText, setCopiedText] = useState('');
  const [copyFailed, setCopyFailed] = useState(false);
  const inputRef = useRef(null);

  const parsed = useMemo(() => parseAmount(amount), [amount]);
  const rateInfo = useMemo(() => (rate === 'custom' ? parseRate(customRate) : { status: 'ok', value: rate }), [rate, customRate]);
  const result = useMemo(
    () => (parsed.status === 'ok' && rateInfo.status === 'ok' ? calculateGst({ amountPaise: parsed.paise, mode, rate: rateInfo.value, supplyType }) : null),
    [parsed, rateInfo, mode, supplyType]
  );
  const summaryText = result ? buildSummaryText(result) : '';
  const copied = summaryText !== '' && copiedText === summaryText;

  const reset = () => {
    setAmount('');
    setMode(DEFAULTS.mode);
    setRate(DEFAULTS.rate);
    setCustomRate('');
    setSupplyType(DEFAULTS.supplyType);
    setCopiedText('');
    setCopyFailed(false);
    inputRef.current?.focus();
  };

  const copy = async () => {
    if (!summaryText) return;
    const ok = await copyText(summaryText);
    setCopyFailed(!ok);
    setCopiedText(ok ? summaryText : '');
  };

  const rows = result && [
    { label: 'Original amount', value: formatINR(result.originalPaise), note: mode === 'add' ? 'Before GST' : 'Including GST' },
    { label: 'Taxable amount', value: formatINR(result.taxablePaise) },
    { label: 'GST rate', value: `${result.rate}%` },
    { label: 'GST amount', value: formatINR(result.gstPaise) },
    ...(supplyType === 'intra'
      ? [
          { label: `CGST (${fmtRate(result.rate / 2)}%)`, value: formatINR(result.cgstPaise) },
          { label: `SGST (${fmtRate(result.rate / 2)}%)`, value: formatINR(result.sgstPaise) },
        ]
      : [{ label: `IGST (${result.rate}%)`, value: formatINR(result.igstPaise) }]),
  ];

  const invalid = parsed.status === 'invalid';
  const rateInvalid = rateInfo.status === 'invalid';

  return (
    <div className="gst">
      <form className="gst__form" onSubmit={(e) => e.preventDefault()} noValidate>
        <SegmentedControl legend="Calculation" name="gst-mode" options={MODES} value={mode} onChange={setMode} />

        <div className="field">
          <label htmlFor="gst-amount">{mode === 'add' ? 'Amount before GST' : 'Amount including GST'}</label>
          <div className={`field__box ${invalid ? 'is-invalid' : ''}`}>
            <span aria-hidden="true">₹</span>
            <input
              id="gst-amount"
              ref={inputRef}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={invalid}
              aria-describedby={invalid ? 'gst-error' : undefined}
            />
          </div>
          {invalid && <p id="gst-error" className="field__error" role="alert">{parsed.error}</p>}
        </div>

        <SegmentedControl legend="GST rate" name="gst-rate" options={RATE_OPTIONS} value={rate} onChange={setRate} />
        {rate === 'custom' && (
          <div className="field">
            <label htmlFor="gst-custom-rate">Custom GST rate</label>
            <div className={`field__box ${rateInvalid ? 'is-invalid' : ''}`}>
              <input id="gst-custom-rate" type="text" inputMode="decimal" autoComplete="off" placeholder="e.g. 7.5" value={customRate} onChange={(e) => setCustomRate(e.target.value)} aria-invalid={rateInvalid} aria-describedby={rateInvalid ? 'gst-rate-error' : undefined} />
              <span aria-hidden="true">%</span>
            </div>
            {rateInvalid && <p id="gst-rate-error" className="field__error" role="alert">{rateInfo.error}</p>}
          </div>
        )}
        <SegmentedControl legend="Supply type" name="gst-supply" options={SUPPLY} value={supplyType} onChange={setSupplyType} />

        <button type="button" className="btn btn--ghost" onClick={reset}>
          <RotateCcw size={18} aria-hidden="true" /> Reset
        </button>
      </form>

      <section className="gst__summary" aria-label="Calculation summary">
        {result ? (
          <>
            <dl className="gst__rows">
              {rows.map((r) => (
                <div key={r.label} className="gst__row">
                  <dt>{r.label}{r.note && <small>{r.note}</small>}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
            <div className="gst__total">
              <span>Final amount</span>
              <output aria-live="polite">{formatINR(result.totalPaise)}</output>
            </div>
            <SmartAdvisor calculatorId="gst" result={result} values={{ amount: parsed.amount, rate: rateInfo.rate, mode, supplyType }} />
            <button type="button" className="btn" onClick={copy}>
              {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
              {copied ? 'Copied' : 'Copy result'}
            </button>
            <p className="gst__status" role="status">
              {copied ? 'Result copied to clipboard.' : copyFailed ? 'Copy was blocked by your browser. Select the text and copy it manually.' : ''}
            </p>
          </>
        ) : (
          <p className="gst__empty">
            {invalid || rateInvalid ? 'Fix the highlighted value to see the breakdown.' : parsed.status === 'ok' && rateInfo.status === 'empty' ? 'Enter a custom rate to see the breakdown.' : 'Enter an amount to see the GST breakdown.'}
          </p>
        )}
      </section>
    </div>
  );
}
