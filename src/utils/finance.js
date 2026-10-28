// Pure finance maths. Amounts are in rupees and rounded to 2 decimals on output.
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const toYears = (value, unit) => (unit === 'months' ? value / 12 : unit === 'days' ? value / 365 : value);

export function simpleInterest({ principal, rate, years }) {
  const interest = (principal * rate * years) / 100;
  return { interest: r2(interest), total: r2(principal + interest) };
}

export function compoundInterest({ principal, rate, years, n }) {
  const total = principal * Math.pow(1 + rate / 100 / n, n * years);
  return { total: r2(total), interest: r2(total - principal) };
}

export function emi({ principal, rate, months }) {
  if (!Number.isInteger(months) || months < 1) throw new RangeError('Tenure must be a whole number of months, at least 1.');
  const i = rate / 12 / 100;
  const monthly = i === 0 ? principal / months : (principal * i * Math.pow(1 + i, months)) / (Math.pow(1 + i, months) - 1);
  const total = monthly * months;
  return { emi: r2(monthly), total: r2(total), interest: r2(total - principal) };
}

export function discount({ price, percent, extra = 0 }) {
  const first = (price * percent) / 100;
  const after = price - first;
  const second = (after * extra) / 100;
  return { first: r2(first), second: r2(second), saved: r2(first + second), final: r2(after - second) };
}

export function profitLoss({ cost, selling }) {
  if (cost <= 0) throw new RangeError('Cost price must be greater than zero.');
  const diff = selling - cost;
  return {
    kind: diff > 0 ? 'profit' : diff < 0 ? 'loss' : 'even',
    amount: r2(Math.abs(diff)),
    markupPct: r2((diff / cost) * 100),
    marginPct: selling > 0 ? r2((diff / selling) * 100) : null,
  };
}

export function wholeMonths(duration, unit) {
  const months = unit === 'years' ? duration * 12 : duration;
  if (!Number.isInteger(months) || months < 1) throw new RangeError('Duration must be a whole number of months, at least 1.');
  return months;
}

// SIP: investment at the start of each month, monthly rate = annual / 12.
export function sip({ monthly, rate, months }) {
  const i = rate / 12 / 100;
  const value = i === 0 ? monthly * months : monthly * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  const invested = monthly * months;
  return { invested: r2(invested), returns: r2(value - invested), value: r2(value) };
}

// RD: deposit k earns quarterly-compounded interest for its remaining months.
export function rd({ monthly, rate, months }) {
  const q = rate / 400;
  let value = 0;
  for (let k = 1; k <= months; k++) value += monthly * Math.pow(1 + q, (months - k + 1) / 3);
  const deposits = monthly * months;
  return { deposits: r2(deposits), interest: r2(value - deposits), value: r2(value) };
}

// Month-by-month loan schedule. The last row clears the balance exactly.
export function amortization({ principal, rate, months }) {
  if (!Number.isInteger(months) || months < 1) throw new RangeError('Tenure must be a whole number of months, at least 1.');
  const i = rate / 12 / 100;
  const pay = i === 0 ? principal / months : (principal * i * Math.pow(1 + i, months)) / (Math.pow(1 + i, months) - 1);
  let balance = principal;
  const rows = [];
  for (let m = 1; m <= months; m++) {
    const interest = balance * i;
    const paid = m === months ? balance : pay - interest;
    balance = m === months ? 0 : balance - paid;
    rows.push({ month: m, emi: r2(paid + interest), principal: r2(paid), interest: r2(interest), balance: r2(Math.max(0, balance)) });
  }
  return rows;
}
