// Accessible radio group styled as a segmented control.
export default function SegmentedControl({ legend, name, options, value, onChange }) {
  return (
    <fieldset className="seg">
      <legend>{legend}</legend>
      <div className="seg__options">
        {options.map((o) => (
          <label key={o.value} className={`seg__opt ${value === o.value ? 'is-selected' : ''}`}>
            <input type="radio" name={name} value={String(o.value)} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
