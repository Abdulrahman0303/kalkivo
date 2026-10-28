import test from 'node:test';
import assert from 'node:assert/strict';
import { simpleInterest, compoundInterest, emi, discount, profitLoss, toYears } from './finance.js';
import { sip, rd, wholeMonths } from './finance.js';
import { readValues } from './calcForm.js';
import { definitions } from '../data/calculatorDefs.js';

test('simple interest: ₹10,000 at 10% for 2 years', () => {
  assert.deepEqual(simpleInterest({ principal: 10000, rate: 10, years: 2 }), { interest: 2000, total: 12000 });
});
test('duration units convert to years', () => {
  assert.equal(toYears(24, 'months'), 2);
  assert.equal(toYears(730, 'days'), 2);
});
test('compound interest: ₹10,000 at 10% for 2 years, yearly', () => {
  assert.deepEqual(compoundInterest({ principal: 10000, rate: 10, years: 2, n: 1 }), { total: 12100, interest: 2100 });
});
test('EMI: ₹1,00,000 at 12% for 12 months is ₹8,884.88', () => {
  const r = emi({ principal: 100000, rate: 12, months: 12 });
  assert.equal(r.emi, 8884.88);
  assert.equal(r.total, 106618.55);
});
test('EMI with 0% rate divides evenly; bad tenure throws', () => {
  assert.equal(emi({ principal: 1200, rate: 0, months: 12 }).emi, 100);
  assert.throws(() => emi({ principal: 1000, rate: 5, months: 0 }), RangeError);
  assert.throws(() => emi({ principal: 1000, rate: 5, months: 2.5 }), RangeError);
});
test('discount: ₹1,000 at 20% gives ₹200 off and ₹800', () => {
  const r = discount({ price: 1000, percent: 20 });
  assert.equal(r.saved, 200);
  assert.equal(r.final, 800);
});
test('additional discount applies to the reduced price', () => {
  const r = discount({ price: 1000, percent: 20, extra: 10 });
  assert.equal(r.final, 720);
  assert.equal(r.saved, 280);
});
test('profit and loss', () => {
  assert.deepEqual(profitLoss({ cost: 800, selling: 1000 }), { kind: 'profit', amount: 200, markupPct: 25, marginPct: 20 });
  assert.equal(profitLoss({ cost: 1000, selling: 800 }).kind, 'loss');
  assert.equal(profitLoss({ cost: 500, selling: 500 }).kind, 'even');
  assert.throws(() => profitLoss({ cost: 0, selling: 10 }), RangeError);
});
test('readValues: empty, negative, junk, optional, commas', () => {
  const fields = [{ name: 'a', label: 'A' }, { name: 'b', label: 'B', optional: true, max: 100 }];
  assert.equal(readValues(fields, { a: '', b: '' }).status, 'empty');
  assert.equal(readValues(fields, { a: '-1', b: '' }).status, 'error');
  assert.equal(readValues(fields, { a: 'abc', b: '' }).status, 'error');
  assert.equal(readValues(fields, { a: '1', b: '101' }).status, 'error');
  assert.deepEqual(readValues(fields, { a: '1,000.5', b: '' }), { status: 'ok', values: { a: 1000.5, b: 0 } });
});
test('every definition computes finite values from sample input', () => {
  const sample = {
    principal: 50000, rate: 8, duration: 3, unit: 'years', years: 3, n: '4', tenure: 24,
    price: 999, percent: 15, extra: 5, cost: 400, selling: 520, monthly: 5000,
    income: 1500000, annual: 1200000, basicPct: 50, pt: 200, other: 0, deductions: 0,
    amount: 1000, n1: 10, n2: 20, n3: 30, n4: 40, n5: 50, value: 10, from: 'm', to: 'ft',
    birth: '2000-01-01', start: '2026-01-01', end: '2026-12-31', weight: 70, height: 175,
  };
  for (const d of definitions) {
    const raw = Object.fromEntries(d.fields.map((f) => [f.name, f.type === 'select' ? f.options[0].value : String(sample[f.name])]));
    const read = readValues(d.fields, raw);
    assert.equal(read.status, 'ok', d.id);
    const out = d.compute(read.values);
    const text = [...out.rows.flat(), ...out.total].join(' ');
    assert.doesNotMatch(text, /NaN|Infinity|undefined/, d.id);
  }
});

test('SIP: ₹5,000/month at 12% for 10 years is about ₹11.62 lakh', () => {
  const r = sip({ monthly: 5000, rate: 12, months: 120 });
  assert.equal(r.invested, 600000);
  assert.ok(Math.abs(r.value - 1161695) < 2, String(r.value));
  assert.equal(sip({ monthly: 1000, rate: 0, months: 12 }).value, 12000);
});
test('RD matches the closed-form quarterly formula', () => {
  const r = rd({ monthly: 1000, rate: 12, months: 3 });
  const i = 0.03;
  const closed = (1000 * (Math.pow(1 + i, 1) - 1)) / (1 - Math.pow(1 + i, -1 / 3));
  assert.ok(Math.abs(r.value - closed) < 0.01);
  assert.equal(r.deposits, 3000);
  assert.equal(rd({ monthly: 500, rate: 0, months: 10 }).value, 5000);
});
test('wholeMonths accepts years and rejects fractions of a month', () => {
  assert.equal(wholeMonths(2.5, 'years'), 30);
  assert.throws(() => wholeMonths(0.1, 'years'), RangeError);
  assert.throws(() => wholeMonths(0, 'months'), RangeError);
});

import { amortization } from './finance.js';
test('amortization: ₹1,00,000 at 12% for 12 months', () => {
  const rows = amortization({ principal: 100000, rate: 12, months: 12 });
  assert.equal(rows.length, 12);
  assert.equal(rows[0].interest, 1000);
  assert.equal(rows[0].emi, 8884.88);
  assert.equal(rows[11].balance, 0);
  const paid = rows.reduce((s, r) => s + r.principal, 0);
  assert.ok(Math.abs(paid - 100000) <= 12 * 0.005 + 0.01);
  assert.ok(rows[11].interest < rows[0].interest);
});
test('amortization: 0% rate and long tenure stay consistent', () => {
  const flat = amortization({ principal: 1200, rate: 0, months: 12 });
  assert.ok(flat.every((r) => r.interest === 0 && r.emi === 100));
  const long = amortization({ principal: 5000000, rate: 8.5, months: 360 });
  assert.equal(long.length, 360);
  assert.equal(long[359].balance, 0);
  assert.ok(long.every((r) => Number.isFinite(r.emi) && r.balance >= 0));
});
test('EMI definition returns a schedule and a principal/interest breakdown', async () => {
  const { getDefinition } = await import('../data/calculatorDefs.js');
  const out = getDefinition('emi').compute({ principal: 100000, rate: 12, tenure: 12, unit: 'months' });
  assert.equal(out.table.rows.length, 12);
  assert.equal(out.table.rows[0][0], '1');
  assert.equal(out.breakdown.length, 2);
  assert.throws(() => getDefinition('emi').compute({ principal: 1000, rate: 5, tenure: 51, unit: 'years' }), RangeError);
});
