import test from 'node:test';
import assert from 'node:assert/strict';
import { generateInsights } from './advisorEngine.js';

test('advisorEngine: generates prepayment and health check insights for EMI', () => {
  const insights = generateInsights({
    calculatorId: 'emi',
    values: { principal: 2000000, rate: 8.5, tenure: 20, unit: 'years' },
  });
  assert.ok(insights.length >= 1);
  assert.ok(insights.some((i) => i.title.includes('Save')));
});

test('advisorEngine: generates step-up and inflation insights for SIP', () => {
  const insights = generateInsights({
    calculatorId: 'sip',
    values: { monthly: 10000, rate: 12, duration: 15, unit: 'years' },
  });
  assert.ok(insights.length >= 2);
  assert.ok(insights[0].title.includes('Step-Up'));
});

test('advisorEngine: generates BMI actionable insights for overweight and normal', () => {
  const over = generateInsights({
    calculatorId: 'bmi',
    values: { weight: 85, height: 170 },
  });
  assert.ok(over.length >= 1);
  assert.ok(over[0].title.includes('Lose'));

  const normal = generateInsights({
    calculatorId: 'bmi',
    values: { weight: 65, height: 170 },
  });
  assert.ok(normal.length >= 1);
  assert.ok(normal[0].title.includes('Ideal Health'));
});

test('advisorEngine: handles unknown calculator without errors', () => {
  const res = generateInsights({ calculatorId: 'unknown', values: {} });
  assert.deepEqual(res, []);
});
