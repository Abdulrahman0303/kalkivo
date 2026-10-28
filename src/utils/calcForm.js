// Turns raw form text into validated numbers. Returns { status: 'empty' | 'error' | 'ok', ... }.
export function readValues(fields, raw) {
  const values = {};
  for (const f of fields) {
    if (f.type === 'select') { values[f.name] = raw[f.name]; continue; }
    if (f.type === 'date') {
      const text = String(raw[f.name] ?? '').trim();
      if (text === '') {
        if (f.optional) { values[f.name] = ''; continue; }
        return { status: 'empty' };
      }
      if (isNaN(Date.parse(text))) return { status: 'error', message: `${f.label}: enter a valid date.` };
      values[f.name] = text;
      continue;
    }
    const text = String(raw[f.name] ?? '').replace(/,/g, '').trim();
    if (text === '') {
      if (f.optional) { values[f.name] = 0; continue; }
      return { status: 'empty' };
    }
    if (!/^-?\d*\.?\d+$/.test(text)) return { status: 'error', message: `${f.label}: enter a valid number.` };
    const n = Number(text);
    if (!Number.isFinite(n)) return { status: 'error', message: `${f.label}: that number is too large.` };
    if (n < (f.min ?? 0)) return { status: 'error', message: `${f.label} cannot be less than ${f.min ?? 0}.` };
    if (f.max !== undefined && n > f.max) return { status: 'error', message: `${f.label} cannot be more than ${f.max}.` };
    values[f.name] = n;
  }
  return { status: 'ok', values };
}
