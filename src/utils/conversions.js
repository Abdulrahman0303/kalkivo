// Length and Temperature unit conversion engines for Kalkivo.

export const LENGTH_UNITS = [
  { value: 'm', label: 'Meters (m)', factor: 1 },
  { value: 'km', label: 'Kilometers (km)', factor: 1000 },
  { value: 'cm', label: 'Centimeters (cm)', factor: 0.01 },
  { value: 'mm', label: 'Millimeters (mm)', factor: 0.001 },
  { value: 'in', label: 'Inches (in)', factor: 0.0254 },
  { value: 'ft', label: 'Feet (ft)', factor: 0.3048 },
  { value: 'yd', label: 'Yards (yd)', factor: 0.9144 },
  { value: 'mi', label: 'Miles (mi)', factor: 1609.344 },
];

const LENGTH_FACTORS = Object.fromEntries(LENGTH_UNITS.map((u) => [u.value, u.factor]));

const roundSmart = (n, decimals = 4) => {
  if (!Number.isFinite(n)) return 0;
  const factor = 10 ** decimals;
  return Math.round((n + Number.EPSILON) * factor) / factor;
};

export function convertLength({ value, from = 'm', to = 'ft' }) {
  const fromFactor = LENGTH_FACTORS[from];
  const toFactor = LENGTH_FACTORS[to];
  if (!fromFactor || !toFactor) throw new RangeError('Unsupported length unit.');
  if (value < 0) throw new RangeError('Length cannot be negative.');

  const inMeters = value * fromFactor;
  const converted = inMeters / toFactor;

  const conversions = {};
  for (const u of LENGTH_UNITS) {
    conversions[u.value] = roundSmart(inMeters / u.factor, 4);
  }

  return {
    value,
    from,
    to,
    converted: roundSmart(converted, 4),
    inMeters: roundSmart(inMeters, 4),
    all: conversions,
  };
}

export const TEMP_UNITS = [
  { value: 'c', label: 'Celsius (°C)' },
  { value: 'f', label: 'Fahrenheit (°F)' },
  { value: 'k', label: 'Kelvin (K)' },
];

export function convertTemperature({ value, from = 'c', to = 'f' }) {
  if (!Number.isFinite(value)) throw new RangeError('Invalid temperature value.');

  // Convert to Celsius first
  let c = value;
  if (from === 'f') c = (value - 32) * (5 / 9);
  else if (from === 'k') c = value - 273.15;
  else if (from !== 'c') throw new RangeError('Unsupported temperature unit.');

  if (c < -273.15) throw new RangeError('Temperature cannot be below absolute zero (-273.15°C / 0K).');

  // Convert from Celsius to all
  const resultC = roundSmart(c, 2);
  const resultF = roundSmart((c * 9) / 5 + 32, 2);
  const resultK = roundSmart(c + 273.15, 2);

  let target = resultC;
  if (to === 'f') target = resultF;
  else if (to === 'k') target = resultK;

  return {
    c: resultC,
    f: resultF,
    k: resultK,
    converted: target,
  };
}
