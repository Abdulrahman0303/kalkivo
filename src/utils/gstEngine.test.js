// Run with: npm test   (uses Node's built-in test runner, no extra dependencies)
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRate } from './gstEngine.js';
import { calculateGst, parseAmount, formatINR, GST_RATES, buildSummaryText } from './gstEngine.js';

const run = (amount, mode, rate, supplyType) => {
  const p = parseAmount(amount);
  assert.equal(p.status, 'ok');
  return calculateGst({ amountPaise: p.paise, mode, rate, supplyType });
};

test('add GST, intra-state: ₹1,000 at 18%', () => {
  const r = run('1000', 'add', 18, 'intra');
  assert.deepEqual(
    [r.gstPaise, r.cgstPaise, r.sgstPaise, r.igstPaise, r.totalPaise],
    [18000, 9000, 9000, 0, 118000]
  );
});

test('add GST, inter-state: ₹1,000 at 18%', () => {
  const r = run('1000', 'add', 18, 'inter');
  assert.deepEqual([r.gstPaise, r.cgstPaise, r.sgstPaise, r.igstPaise, r.totalPaise], [18000, 0, 0, 18000, 118000]);
});

test('remove GST: ₹1,180 at 18%', () => {
  const r = run('1180', 'remove', 18, 'intra');
  assert.equal(r.taxablePaise, 100000);
  assert.equal(r.gstPaise, 18000);
  assert.equal(r.totalPaise, 118000);
});

test('0% rate adds nothing', () => {
  const r = run('250.75', 'add', 0, 'inter');
  assert.equal(r.gstPaise, 0);
  assert.equal(r.totalPaise, 25075);
});

test('taxable + GST always equals total, and CGST + SGST equals GST', () => {
  for (const rate of GST_RATES) {
    for (const amount of ['0.01', '1', '99.99', '1234.56', '999999.99']) {
      for (const mode of ['add', 'remove']) {
        const r = run(amount, mode, rate, 'intra');
        assert.equal(r.taxablePaise + r.gstPaise, r.totalPaise);
        assert.equal(r.cgstPaise + r.sgstPaise, r.gstPaise);
      }
    }
  }
});

test('parseAmount handles empty, negative, junk, decimals and commas', () => {
  assert.equal(parseAmount('').status, 'empty');
  assert.equal(parseAmount('   ').status, 'empty');
  assert.equal(parseAmount(undefined).status, 'empty');
  assert.equal(parseAmount('-5').status, 'invalid');
  assert.equal(parseAmount('abc').status, 'invalid');
  assert.equal(parseAmount('1e5').status, 'invalid');
  assert.equal(parseAmount('.').status, 'invalid');
  assert.equal(parseAmount('1.234').status, 'invalid');
  assert.equal(parseAmount('99999999999999').status, 'invalid');
  assert.equal(parseAmount('₹1,00,000.50').paise, 10000050);
  assert.equal(parseAmount('.5').paise, 50);
  assert.equal(parseAmount('0').paise, 0);
});

test('calculateGst rejects bad input instead of returning NaN', () => {
  assert.throws(() => calculateGst({ amountPaise: NaN, mode: 'add', rate: 18, supplyType: 'intra' }));
  assert.throws(() => calculateGst({ amountPaise: -1, mode: 'add', rate: 18, supplyType: 'intra' }));
  assert.throws(() => calculateGst({ amountPaise: 100, mode: 'add', rate: 101, supplyType: 'intra' }));
});

test('formatINR uses rupee sign, Indian grouping and 2 decimals', () => {
  assert.equal(formatINR(118000), '₹1,180.00');
  assert.equal(formatINR(12345678900), '₹12,34,56,789.00');
});

test('summary text contains the key lines', () => {
  const text = buildSummaryText(run('1000', 'add', 18, 'intra'));
  assert.match(text, /CGST \(9%\): ₹90\.00/);
  assert.match(text, /Final amount: ₹1,180\.00/);
});

test('custom rate: 7.5% on ₹1,000, both directions', () => {
  const add = run('1000', 'add', 7.5, 'intra');
  assert.deepEqual([add.gstPaise, add.cgstPaise, add.sgstPaise, add.totalPaise], [7500, 3750, 3750, 107500]);
  const rem = run('1075', 'remove', 7.5, 'inter');
  assert.deepEqual([rem.taxablePaise, rem.gstPaise, rem.igstPaise], [100000, 7500, 7500]);
  assert.match(buildSummaryText(add), /CGST \(3\.75%\): ₹37\.50/);
});
test('parseRate validates custom rates', () => {
  assert.equal(parseRate('').status, 'empty');
  assert.equal(parseRate('7.5%').value, 7.5);
  assert.equal(parseRate('.5').value, 0.5);
  assert.equal(parseRate('100').value, 100);
  for (const bad of ['-1', '101', 'abc', '7.555', '1e2', '.']) assert.equal(parseRate(bad).status, 'invalid', bad);
});
test('calculateGst accepts any rate from 0 to 100 and rejects others', () => {
  assert.doesNotThrow(() => calculateGst({ amountPaise: 100, mode: 'add', rate: 0.25, supplyType: 'intra' }));
  assert.throws(() => calculateGst({ amountPaise: 100, mode: 'add', rate: -1, supplyType: 'intra' }), RangeError);
  assert.throws(() => calculateGst({ amountPaise: 100, mode: 'add', rate: NaN, supplyType: 'intra' }), RangeError);
});
