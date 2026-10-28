import test from 'node:test';
import assert from 'node:assert/strict';
import { convertLength, convertTemperature } from './conversions.js';
import { calculatePercentage, calculateAverage, calculateAge, calculateDateDifference, calculateBmi } from './everyday.js';

test('convertLength: 10 meters converts to feet, cm, and km accurately', () => {
  const r = convertLength({ value: 10, from: 'm', to: 'ft' });
  assert.equal(r.converted, 32.8084);
  assert.equal(r.all.cm, 1000);
  assert.equal(r.all.km, 0.01);
  assert.throws(() => convertLength({ value: -5, from: 'm', to: 'ft' }), RangeError);
});

test('convertTemperature: 100C to 212F and 373.15K', () => {
  const r = convertTemperature({ value: 100, from: 'c', to: 'f' });
  assert.equal(r.converted, 212);
  assert.equal(r.k, 373.15);
  const zeroK = convertTemperature({ value: -273.15, from: 'c', to: 'k' });
  assert.equal(zeroK.converted, 0);
  assert.throws(() => convertTemperature({ value: -300, from: 'c', to: 'k' }), RangeError);
});

test('calculatePercentage: 20% of 500', () => {
  const r = calculatePercentage({ amount: 500, percent: 20 });
  assert.equal(r.part, 100);
  assert.equal(r.increased, 600);
  assert.equal(r.decreased, 400);
});

test('calculateAverage: [10, 20, 30, 40]', () => {
  const r = calculateAverage([10, 20, 30, 40]);
  assert.equal(r.count, 4);
  assert.equal(r.sum, 100);
  assert.equal(r.mean, 25);
  assert.equal(r.min, 10);
  assert.equal(r.max, 40);
  assert.equal(r.range, 30);
});

test('calculateAge: calculates years, months, days', () => {
  const r = calculateAge('2000-01-01', '2026-01-01');
  assert.equal(r.years, 26);
  assert.equal(r.months, 0);
  assert.equal(r.days, 0);
  assert.ok(r.totalDays > 9400);
  assert.throws(() => calculateAge('2030-01-01', '2026-01-01'), RangeError);
});

test('calculateDateDifference: 2026-01-01 to 2026-01-11', () => {
  const r = calculateDateDifference('2026-01-01', '2026-01-11');
  assert.equal(r.totalDays, 10);
  assert.equal(r.totalWeeks, 1);
  assert.equal(r.remainingDays, 3);
  assert.ok(r.workingDays > 0);
});

test('calculateBmi: 70kg and 175cm', () => {
  const r = calculateBmi({ weight: 70, height: 175, heightUnit: 'cm', weightUnit: 'kg' });
  assert.equal(r.bmi, 22.9);
  assert.equal(r.category, 'Normal weight');
  assert.throws(() => calculateBmi({ weight: -10, height: 170 }), RangeError);
});
