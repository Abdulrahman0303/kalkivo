import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTax, compareRegimes, estimateSalary, slabTax } from './incomeTax.js';
import { TAX_RULES } from '../data/taxRules.js';

test('new regime: ₹12.75 lakh salaried is tax-free (taxable ₹12 lakh)', () => {
  assert.equal(calculateTax({ gross: 1275000, regime: 'new' }).total, 0);
  assert.equal(calculateTax({ gross: 1200000, regime: 'new' }).total, 0);
});
test('new regime: marginal relief just above the rebate limit', () => {
  const r = calculateTax({ gross: 1300000, regime: 'new' });
  assert.equal(r.taxable, 1225000);
  assert.equal(r.slabTax, 63750);
  assert.equal(r.rebate, 38750);
  assert.equal(r.cess, 1000);
  assert.equal(r.total, 26000);
});
test('new regime: ₹24 lakh salaried', () => {
  const r = calculateTax({ gross: 2400000, regime: 'new' });
  assert.equal(r.slabTax, 281250);
  assert.equal(r.total, 292500);
});
test('old regime: ₹10 lakh with ₹1.5 lakh deductions', () => {
  const r = calculateTax({ gross: 1000000, regime: 'old', deductions: 150000 });
  assert.equal(r.taxable, 800000);
  assert.equal(r.total, 75400);
});
test('old regime: rebate makes ₹5 lakh taxable income tax-free', () => {
  assert.equal(calculateTax({ gross: 550000, regime: 'old' }).total, 0);
  assert.equal(calculateTax({ gross: 600000, regime: 'old' }).total > 0, true);
});
test('deductions are ignored under the new regime; standard deduction only when salaried', () => {
  assert.equal(calculateTax({ gross: 1500000, regime: 'new', deductions: 500000 }).otherDeductions, 0);
  assert.equal(calculateTax({ gross: 1500000, regime: 'new', salaried: false }).standardDeduction, 0);
});
test('surcharge with marginal relief just above ₹50 lakh', () => {
  const r = calculateTax({ gross: 5010000, regime: 'new', salaried: false });
  assert.equal(r.slabTax, 1083000);
  assert.equal(r.surcharge, 7000);
  assert.equal(r.cess, 43600);
  const big = calculateTax({ gross: 6000000, regime: 'new', salaried: false });
  assert.equal(big.surcharge, 138000);
});
test('zero income and bad input', () => {
  assert.equal(calculateTax({ gross: 0, regime: 'new' }).total, 0);
  assert.throws(() => calculateTax({ gross: -1, regime: 'new' }), RangeError);
  assert.throws(() => calculateTax({ gross: NaN, regime: 'new' }), RangeError);
  assert.throws(() => calculateTax({ gross: 1000, regime: 'x' }), RangeError);
});
test('compareRegimes picks the lower tax', () => {
  assert.equal(compareRegimes({ gross: 1500000, deductions: 150000 }).better, 'new');
  const c = compareRegimes({ gross: 3000000, deductions: 1000000 });
  assert.equal(c.better, 'old');
  assert.equal(c.old.total, 413400);
  assert.equal(c.new.total, 475800);
  assert.equal(compareRegimes({ gross: 1000000, deductions: 600000 }).better, 'new'); // both zero: tie goes to new
});
test('slab tax helper and editable rules', () => {
  assert.equal(slabTax(800000, TAX_RULES.new.slabs), 20000);
  const custom = { ...TAX_RULES, new: { ...TAX_RULES.new, slabs: [{ upTo: Infinity, rate: 10 }] } };
  assert.equal(slabTax(100000, custom.new.slabs), 10000);
});
test('salary: ₹12 lakh, 50% basic, PF on, ₹200 PT, tax included', () => {
  const r = estimateSalary({ gross: 1200000, basicPct: 50, pf: true, ptMonthly: 200, includeTax: true });
  assert.equal(r.monthly.net, 93800);
  assert.equal(r.annualNet, 1125600);
  assert.equal(r.monthly.allowances, 50000);
  assert.throws(() => estimateSalary({ gross: 1000, basicPct: 50, pf: false, ptMonthly: 500, includeTax: false }), RangeError);
});
