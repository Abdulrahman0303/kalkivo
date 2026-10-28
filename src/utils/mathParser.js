// Safe expression evaluator (recursive descent). No eval(), no Function().
// Supports + - * / ^ mod ! % ( ), constants pi e ans, and sin cos tan asin acos atan ln log sqrt abs.
// "%" divides by 100 (50% = 0.5). A missing ")" at the very end is closed automatically.
export class MathError extends Error {}
const fail = (m) => { throw new MathError(m); };
const check = (v) => (Number.isFinite(v) ? v : fail('The result is undefined or too large.'));
const clean = (v) => (Math.abs(v) < 1e-12 ? 0 : Math.round(v * 1e12) / 1e12);

function factorial(n) {
  if (!Number.isInteger(n) || n < 0) fail('Factorial needs a whole number, 0 or more.');
  if (n > 170) fail('Factorial is too large (maximum is 170!).');
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function tokenize(src) {
  const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/π/g, 'pi').trim();
  const re = /\s*(?:(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+(?:e[+-]?\d+)?)|([a-z]+)|(.))/iy;
  const out = [];
  while (re.lastIndex < s.length) {
    const m = re.exec(s);
    if (!m) break;
    if (m[1] !== undefined) out.push({ t: 'num', v: parseFloat(m[1]) });
    else if (m[2]) out.push({ t: 'id', v: m[2].toLowerCase() });
    else if ('+-*/^()!%'.includes(m[3])) out.push({ t: 'op', v: m[3] });
    else fail(`Unexpected "${m[3]}".`);
  }
  return out;
}

export function evaluate(input, { angle = 'deg', ans = 0 } = {}) {
  const tk = tokenize(String(input ?? ''));
  if (tk.length === 0) fail('Enter an expression.');
  const toRad = (x) => (angle === 'deg' ? (x * Math.PI) / 180 : x);
  const fromRad = (x) => (angle === 'deg' ? (x * 180) / Math.PI : x);
  const FN = {
    sin: (x) => clean(Math.sin(toRad(x))),
    cos: (x) => clean(Math.cos(toRad(x))),
    tan: (x) => (Math.abs(Math.cos(toRad(x))) < 1e-12 ? fail('tan is undefined at this angle.') : clean(Math.tan(toRad(x)))),
    asin: (x) => (Math.abs(x) > 1 ? fail('asin needs a value from -1 to 1.') : clean(fromRad(Math.asin(x)))),
    acos: (x) => (Math.abs(x) > 1 ? fail('acos needs a value from -1 to 1.') : clean(fromRad(Math.acos(x)))),
    atan: (x) => clean(fromRad(Math.atan(x))),
    ln: (x) => (x <= 0 ? fail('ln needs a number greater than 0.') : Math.log(x)),
    log: (x) => (x <= 0 ? fail('log needs a number greater than 0.') : Math.log10(x)),
    sqrt: (x) => (x < 0 ? fail('Square root needs 0 or a positive number.') : Math.sqrt(x)),
    abs: Math.abs,
  };
  let p = 0;
  const isOp = (v) => tk[p]?.t === 'op' && tk[p].v === v;
  const close = () => { if (isOp(')')) p++; else if (p < tk.length) fail('Missing ")".'); };

  function expr() {
    let v = term();
    while (isOp('+') || isOp('-')) {
      const op = tk[p++].v;
      const r = term();
      v = op === '+' ? v + r : v - r;
    }
    return check(v);
  }
  function term() {
    let v = unary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = tk[p++].v;
        const r = unary();
        if (op === '/') { if (r === 0) fail('Cannot divide by zero.'); v /= r; } else v *= r;
      } else if (tk[p]?.t === 'id' && tk[p].v === 'mod') {
        p++;
        const r = unary();
        if (r === 0) fail('Cannot take modulo by zero.');
        v %= r;
      } else break;
      check(v);
    }
    return v;
  }
  function unary() {
    if (isOp('-')) { p++; return -unary(); }
    if (isOp('+')) { p++; return unary(); }
    return power();
  }
  function power() {
    const base = postfix();
    if (isOp('^')) { p++; return check(Math.pow(base, unary())); }
    return base;
  }
  function postfix() {
    let v = primary();
    for (;;) {
      if (isOp('!')) { p++; v = factorial(v); }
      else if (isOp('%')) { p++; v /= 100; }
      else break;
    }
    return v;
  }
  function primary() {
    const t = tk[p++];
    if (!t) fail('The expression is incomplete.');
    if (t.t === 'num') return t.v;
    if (t.t === 'op' && t.v === '(') { const v = expr(); close(); return v; }
    if (t.t === 'id') {
      if (t.v === 'pi') return Math.PI;
      if (t.v === 'e') return Math.E;
      if (t.v === 'ans') return ans;
      const fn = FN[t.v];
      if (!fn) fail(`Unknown name "${t.v}".`);
      if (!isOp('(')) fail(`${t.v} needs brackets, for example ${t.v}(30).`);
      p++;
      const a = expr();
      close();
      return fn(a);
    }
    return fail(`Unexpected "${t.v}".`);
  }

  const v = expr();
  if (p < tk.length) fail(`Unexpected "${tk[p].v}". Put × between values.`);
  return v;
}

export function formatResult(n) {
  if (n === 0 || Object.is(n, -0)) return '0';
  const a = Math.abs(n);
  if (a >= 1e15 || a < 1e-9) return n.toExponential(9).replace(/\.?0+e/, 'e').replace('e+', 'e');
  return String(parseFloat(n.toPrecision(12)));
}
