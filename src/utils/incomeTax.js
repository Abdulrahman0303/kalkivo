// Pure income tax and salary estimators. Rules come from data/taxRules.js and can be swapped via the `rules` argument.
import { TAX_RULES } from '../data/taxRules.js';

const round = (n) => Math.round(n);

export function slabTax(income, slabs) {
  let tax = 0;
  let prev = 0;
  for (const { upTo, rate } of slabs) {
    if (income > prev) tax += ((Math.min(income, upTo) - prev) * rate) / 100;
    prev = upTo;
  }
  return tax;
}

function surchargeFor(taxable, tax, r) {
  let idx = -1;
  r.surcharge.forEach((t, i) => { if (taxable > t.above) idx = i; });
  if (idx < 0) return 0;
  const tier = r.surcharge[idx];
  const prevRate = idx > 0 ? r.surcharge[idx - 1].rate : 0;
  let s = (tax * tier.rate) / 100;
  // Marginal relief: tax plus surcharge may not exceed the tax at the threshold plus the income above it.
  const maxTotal = slabTax(tier.above, r.slabs) * (1 + prevRate / 100) + (taxable - tier.above);
  if (tax + s > maxTotal) s = Math.max(0, maxTotal - tax);
  return s;
}

export function calculateTax({ gross, regime, salaried = true, deductions = 0, rules = TAX_RULES }) {
  const r = rules[regime];
  if (!r) throw new RangeError(`Unknown tax regime: ${regime}`);
  if (!Number.isFinite(gross) || gross < 0) throw new RangeError('Income must be 0 or more.');
  const standardDeduction = salaried ? Math.min(r.standardDeduction, gross) : 0;
  const otherDeductions = regime === 'old' ? Math.min(deductions, gross - standardDeduction) : 0;
  const taxable = gross - standardDeduction - otherDeductions;
  const base = slabTax(taxable, r.slabs);

  let rebate = 0;
  if (taxable <= r.rebate.limit) rebate = Math.min(base, r.rebate.max);
  else if (r.rebate.marginalRelief) rebate = Math.max(0, base - (taxable - r.rebate.limit));

  const afterRebate = base - rebate;
  const surcharge = surchargeFor(taxable, afterRebate, r);
  const cess = (afterRebate + surcharge) * rules.cessRate;

  const parts = { slab: round(base), rebate: round(rebate), surcharge: round(surcharge) };
  const cessR = round(cess);
  const total = parts.slab - parts.rebate + parts.surcharge + cessR;
  return {
    regime, gross, standardDeduction, otherDeductions, taxable,
    slabTax: parts.slab, rebate: parts.rebate, surcharge: parts.surcharge, cess: cessR, total,
    effectiveRate: gross > 0 ? Math.round((total / gross) * 10000) / 100 : 0,
  };
}

export function compareRegimes(input) {
  const newR = calculateTax({ ...input, regime: 'new' });
  const oldR = calculateTax({ ...input, regime: 'old' });
  return { new: newR, old: oldR, better: oldR.total < newR.total ? 'old' : 'new' };
}

// Monthly take-home estimate. Assumes employee PF is 12% of basic with no wage ceiling,
// and income tax under the new regime with the salaried standard deduction.
export function estimateSalary({ gross, basicPct, pf, ptMonthly = 0, otherMonthly = 0, includeTax, rules = TAX_RULES }) {
  if (!Number.isFinite(gross) || gross < 0) throw new RangeError('Salary must be 0 or more.');
  const basic = (gross * basicPct) / 100;
  const pfAnnual = pf ? basic * 0.12 : 0;
  const tax = includeTax ? calculateTax({ gross, regime: 'new', salaried: true, rules }).total : 0;
  const net = gross - pfAnnual - ptMonthly * 12 - otherMonthly * 12 - tax;
  if (net < 0) throw new RangeError('Deductions are higher than the salary.');
  return {
    monthly: { gross: gross / 12, basic: basic / 12, allowances: (gross - basic) / 12, pf: pfAnnual / 12, pt: ptMonthly, other: otherMonthly, tax: tax / 12, net: net / 12 },
    annualNet: net,
  };
}
