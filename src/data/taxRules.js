// Editable Indian income tax rules for resident individuals below 60. Amounts are in rupees.
// Update this file each Budget; the calculators read everything from here.
// Last checked 13 Oct 2026 against published summaries, which report that Budget 2026 left the
// slabs, standard deductions and the Section 87A rebate unchanged for FY 2026-27.
// Confirm against the official Income Tax Department website before relying on the figures.
export const TAX_RULES = {
  fy: '2026-27',
  ay: '2027-28',
  cessRate: 0.04,
  new: {
    label: 'New regime',
    standardDeduction: 75000,
    slabs: [
      { upTo: 400000, rate: 0 }, { upTo: 800000, rate: 5 }, { upTo: 1200000, rate: 10 },
      { upTo: 1600000, rate: 15 }, { upTo: 2000000, rate: 20 }, { upTo: 2400000, rate: 25 },
      { upTo: Infinity, rate: 30 },
    ],
    rebate: { limit: 1200000, max: 60000, marginalRelief: true },
    surcharge: [{ above: 5000000, rate: 10 }, { above: 10000000, rate: 15 }, { above: 20000000, rate: 25 }],
  },
  old: {
    label: 'Old regime',
    standardDeduction: 50000,
    slabs: [
      { upTo: 250000, rate: 0 }, { upTo: 500000, rate: 5 }, { upTo: 1000000, rate: 20 }, { upTo: Infinity, rate: 30 },
    ],
    rebate: { limit: 500000, max: 12500, marginalRelief: false },
    surcharge: [{ above: 5000000, rate: 10 }, { above: 10000000, rate: 15 }, { above: 20000000, rate: 25 }, { above: 50000000, rate: 37 }],
  },
};
