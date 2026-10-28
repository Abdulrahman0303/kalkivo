// Everyday math, date, and health calculation utilities for Kalkivo.

const roundSmart = (n, decimals = 2) => {
  if (!Number.isFinite(n)) return 0;
  const factor = 10 ** decimals;
  return Math.round((n + Number.EPSILON) * factor) / factor;
};

export function calculatePercentage({ amount, percent }) {
  if (!Number.isFinite(amount) || !Number.isFinite(percent)) {
    throw new RangeError('Amount and percentage must be valid numbers.');
  }
  const part = roundSmart((amount * percent) / 100, 2);
  const increased = roundSmart(amount + part, 2);
  const decreased = roundSmart(amount - part, 2);
  return {
    amount,
    percent,
    part,
    increased,
    decreased,
  };
}

export function calculateAverage(numbers) {
  const valid = numbers.filter((n) => typeof n === 'number' && Number.isFinite(n));
  if (valid.length === 0) {
    throw new RangeError('At least one valid number is required to calculate average.');
  }
  const count = valid.length;
  const sum = valid.reduce((a, b) => a + b, 0);
  const mean = roundSmart(sum / count, 2);
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = roundSmart(max - min, 2);
  return { count, sum: roundSmart(sum, 2), mean, min, max, range };
}

export function calculateAge(birthDateStr, targetDateStr) {
  const birth = new Date(birthDateStr);
  const target = targetDateStr ? new Date(targetDateStr) : new Date();

  if (isNaN(birth.getTime())) throw new RangeError('Enter a valid birth date.');
  if (isNaN(target.getTime())) throw new RangeError('Enter a valid comparison date.');
  if (birth > target) throw new RangeError('Birth date cannot be in the future.');

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // Days in the previous month of target
    const prevMonthDays = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffMs = target.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;

  // Next birthday calculation
  let nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBday < target) {
    nextBday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  const nextDiffMs = nextBday.getTime() - target.getTime();
  const nextBdayDays = Math.ceil(nextDiffMs / (1000 * 60 * 60 * 24));

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalHours,
    nextBirthdayDays: nextBdayDays === 0 ? 0 : nextBdayDays,
  };
}

export function calculateDateDifference(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new RangeError('Both start and end dates must be valid.');
  }

  const isReversed = start > end;
  const from = isReversed ? end : start;
  const to = isReversed ? start : end;

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffMs = to.getTime() - from.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  // Working days (Monday to Friday)
  let workingDays = 0;
  const cur = new Date(from);
  while (cur < to) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) workingDays++;
    cur.setDate(cur.getDate() + 1);
  }

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    remainingDays,
    workingDays,
    isReversed,
  };
}

export function calculateBmi({ weight, height, heightUnit = 'cm', weightUnit = 'kg' }) {
  if (!Number.isFinite(weight) || weight <= 0) throw new RangeError('Weight must be greater than 0.');
  if (!Number.isFinite(height) || height <= 0) throw new RangeError('Height must be greater than 0.');

  const weightKg = weightUnit === 'lbs' ? weight * 0.45359237 : weight;
  let heightM = height;
  if (heightUnit === 'cm') heightM = height / 100;
  else if (heightUnit === 'in') heightM = height * 0.0254;
  else if (heightUnit === 'ft') heightM = height * 0.3048;

  if (heightM < 0.3 || heightM > 3.0) throw new RangeError('Height must be between 30 cm and 300 cm.');
  if (weightKg < 2 || weightKg > 500) throw new RangeError('Weight must be between 2 kg and 500 kg.');

  const bmi = roundSmart(weightKg / (heightM * heightM), 1);

  let category = 'Normal weight';
  let color = '#0E9F6E';
  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#2F4BFF';
  } else if (bmi >= 25 && bmi < 29.9) {
    category = 'Overweight';
    color = '#D97706';
  } else if (bmi >= 30) {
    category = 'Obesity';
    color = '#DC2626';
  }

  const minNormalKg = roundSmart(18.5 * heightM * heightM, 1);
  const maxNormalKg = roundSmart(24.9 * heightM * heightM, 1);

  return {
    bmi,
    category,
    color,
    weightKg: roundSmart(weightKg, 1),
    heightM: roundSmart(heightM, 2),
    healthyRange: `${minNormalKg} kg – ${maxNormalKg} kg`,
  };
}
