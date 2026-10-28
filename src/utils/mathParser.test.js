import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, formatResult, MathError } from './mathParser.js';

const calc = (s, o) => formatResult(evaluate(s, o));

test('order of operations and brackets', () => {
  assert.equal(calc('2+3*4'), '14');
  assert.equal(calc('(2+3)*4'), '20');
  assert.equal(calc('-2^2'), '-4');
  assert.equal(calc('2^3^2'), '512');
  assert.equal(calc('2^-2'), '0.25');
  assert.equal(calc('10-4-3'), '3');
  assert.equal(calc('8/4/2'), '1');
});
test('decimals avoid float noise', () => {
  assert.equal(calc('0.1+0.2'), '0.3');
  assert.equal(calc('1.1*3'), '3.3');
});
test('percent, modulo, factorial, unicode operators', () => {
  assert.equal(calc('50%'), '0.5');
  assert.equal(calc('10 mod 3'), '1');
  assert.equal(calc('5!'), '120');
  assert.equal(calc('0!'), '1');
  assert.equal(calc('6×7÷2−1'), '20');
});
test('trig in degrees and radians', () => {
  assert.equal(calc('sin(30)'), '0.5');
  assert.equal(calc('cos(90)'), '0');
  assert.equal(calc('tan(45)'), '1');
  assert.equal(calc('asin(1)'), '90');
  assert.equal(calc('sin(pi/2)', { angle: 'rad' }), '1');
  assert.equal(calc('acos(1)', { angle: 'rad' }), '0');
});
test('logs, roots, constants, ans, auto-closed bracket', () => {
  assert.equal(calc('ln(e)'), '1');
  assert.equal(calc('log(1000)'), '3');
  assert.equal(calc('sqrt(16)'), '4');
  assert.equal(calc('pi'), '3.14159265359');
  assert.equal(calc('ans*2', { ans: 21 }), '42');
  assert.equal(calc('sqrt(16'), '4');
  assert.equal(calc('1e3+1'), '1001');
});
test('errors are MathError with clear messages, never NaN or Infinity', () => {
  for (const bad of ['1/0', '5 mod 0', 'sqrt(-1)', 'ln(0)', 'log(-5)', '2+', '', 'abc', '(1+2))', '171!', '2.5!', 'tan(90)', 'asin(2)', '10^1000', '0^-1', 'sin', '2pi', '3 $ 4']) {
    assert.throws(() => evaluate(bad), MathError, bad);
  }
});
test('formatResult handles big and tiny numbers', () => {
  assert.equal(formatResult(1e21), '1e21');
  assert.equal(formatResult(1.5e-10), '1.5e-10');
  assert.equal(formatResult(-0), '0');
  assert.equal(calc('170!'), '7.257415615e306');
});
test('evaluator is not eval: code strings are rejected', () => {
  assert.throws(() => evaluate('process.exit()'), MathError);
  assert.throws(() => evaluate('alert(1)'), MathError);
});
