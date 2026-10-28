export const initialState = { current: '0', previous: null, operator: null, overwrite: false, expression: '' };

const tidy = (n) => String(parseFloat(n.toPrecision(12)));

function compute(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  switch (op) {
    case '+': return tidy(x + y);
    case '−': return tidy(x - y);
    case '×': return tidy(x * y);
    case '÷': return y === 0 ? 'Error' : tidy(x / y);
    default: return b;
  }
}

export function reducer(state, action) {
  let s = state;
  if (s.current === 'Error' && action.type !== 'clear') s = initialState;

  switch (action.type) {
    case 'digit':
      if (s.overwrite) return { ...s, current: action.value, overwrite: false, expression: s.operator ? s.expression : '' };
      if (s.current.replace(/[-.]/g, '').length >= 15) return s;
      return { ...s, current: s.current === '0' ? action.value : s.current + action.value };

    case 'decimal':
      if (s.overwrite) return { ...s, current: '0.', overwrite: false, expression: s.operator ? s.expression : '' };
      return s.current.includes('.') ? s : { ...s, current: s.current + '.' };

    case 'operator': {
      let previous = s.current;
      if (s.operator && !s.overwrite) previous = compute(s.previous, s.current, s.operator);
      return { current: previous, previous, operator: action.value, overwrite: true, expression: `${previous} ${action.value}` };
    }

    case 'equals': {
      if (!s.operator) return s;
      const result = compute(s.previous, s.current, s.operator);
      return { current: result, previous: null, operator: null, overwrite: true, expression: `${s.previous} ${s.operator} ${s.current} =` };
    }

    case 'percent':
      return { ...s, current: tidy(parseFloat(s.current) / 100), overwrite: true };

    case 'negate':
      if (s.current === '0') return s;
      return { ...s, current: s.current.startsWith('-') ? s.current.slice(1) : '-' + s.current };

    case 'backspace': {
      if (s.overwrite) return s;
      const c = s.current;
      return { ...s, current: c.length > 1 && !(c.length === 2 && c[0] === '-') ? c.slice(0, -1) : '0' };
    }

    case 'clear':
      return initialState;

    case 'set':
      return { ...initialState, current: String(action.value), overwrite: true };

    default:
      return s;
  }
}

// 1234567.5 -> "1,234,567.5" (keeps a trailing dot while typing)
export function formatNumber(str) {
  if (str === 'Error') return str;
  const [int, dec] = str.split('.');
  const sign = int.startsWith('-') ? '-' : '';
  const grouped = Number(int.replace('-', '')).toLocaleString('en-US');
  return sign + grouped + (dec !== undefined ? '.' + dec : '');
}
