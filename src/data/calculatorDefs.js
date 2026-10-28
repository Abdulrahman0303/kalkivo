// Config-driven calculators. To add one: add an entry here, then add it to calculators.js (search and cards).
import { formatINR } from '../utils/gstEngine.js';
import { TAX_RULES } from './taxRules.js';
import { calculateTax, compareRegimes, estimateSalary } from '../utils/incomeTax.js';
import { amortization, compoundInterest, discount, emi, profitLoss, rd, simpleInterest, sip, toYears, wholeMonths } from '../utils/finance.js';
import { convertLength, LENGTH_UNITS, convertTemperature, TEMP_UNITS } from '../utils/conversions.js';
import { calculatePercentage, calculateAverage, calculateAge, calculateDateDifference, calculateBmi } from '../utils/everyday.js';

const money = (n) => {
  if (!Number.isFinite(n)) throw new RangeError('The result is too large to display.');
  return formatINR(Math.round(n * 100));
};
const pct = (n) => `${n}%`;
const MAX_SCHEDULE_MONTHS = 600;
const UNITS = [{ value: 'years', label: 'Years' }, { value: 'months', label: 'Months' }, { value: 'days', label: 'Days' }];

export const definitions = [
  {
    id: 'simple-interest', name: 'Simple Interest Calculator', category: 'Finance',
    description: 'Find the interest and total amount on a principal at a fixed yearly rate.',
    formula: 'Simple interest = Principal × Rate × Time ÷ 100, with time in years. Months are divided by 12 and days by 365.',
    fields: [
      { name: 'principal', label: 'Principal (₹)' },
      { name: 'rate', label: 'Annual interest rate (%)', max: 100 },
      { name: 'duration', label: 'Duration' },
      { name: 'unit', label: 'Duration unit', type: 'select', options: UNITS },
    ],
    compute: (v) => {
      const years = toYears(v.duration, v.unit);
      const r = simpleInterest({ principal: v.principal, rate: v.rate, years });
      return {
        rows: [['Principal', money(v.principal)], ['Rate', pct(v.rate)], ['Duration', `${v.duration} ${v.unit}`], ['Interest earned', money(r.interest)]],
        total: ['Total amount', money(r.total)],
      };
    },
  },
  {
    id: 'compound-interest', name: 'Compound Interest Calculator', category: 'Finance',
    description: 'See how interest grows when it is added back to the principal at regular intervals.',
    formula: 'Amount = P × (1 + r ÷ n)^(n × t), where r is the yearly rate as a decimal, n is compounding periods per year and t is years.',
    fields: [
      { name: 'principal', label: 'Principal (₹)' },
      { name: 'rate', label: 'Annual interest rate (%)', max: 100 },
      { name: 'years', label: 'Duration (years)', max: 100 },
      { name: 'n', label: 'Compounding', type: 'select', options: [
        { value: '1', label: 'Yearly' }, { value: '2', label: 'Half-yearly' }, { value: '4', label: 'Quarterly' },
        { value: '12', label: 'Monthly' }, { value: '365', label: 'Daily' }] },
    ],
    compute: (v) => {
      const r = compoundInterest({ principal: v.principal, rate: v.rate, years: v.years, n: Number(v.n) });
      return {
        rows: [['Principal', money(v.principal)], ['Rate', pct(v.rate)], ['Duration', `${v.years} years`], ['Interest earned', money(r.interest)]],
        total: ['Total amount', money(r.total)],
      };
    },
  },
  {
    id: 'emi', name: 'EMI Calculator', category: 'Finance',
    description: 'Work out the monthly instalment, total interest and total repayment for a loan.',
    formula: 'EMI = P × i × (1 + i)^n ÷ ((1 + i)^n − 1), where i is the monthly rate (annual rate ÷ 12 ÷ 100) and n is the number of months.',
    fields: [
      { name: 'principal', label: 'Loan amount (₹)' },
      { name: 'rate', label: 'Annual interest rate (%)', max: 100 },
      { name: 'tenure', label: 'Loan tenure' },
      { name: 'unit', label: 'Tenure unit', type: 'select', options: [{ value: 'months', label: 'Months' }, { value: 'years', label: 'Years' }] },
    ],
    compute: (v) => {
      const months = v.unit === 'years' ? v.tenure * 12 : v.tenure;
      if (months > MAX_SCHEDULE_MONTHS) throw new RangeError('Tenure cannot be more than 600 months (50 years).');
      const r = emi({ principal: v.principal, rate: v.rate, months });
      const schedule = amortization({ principal: v.principal, rate: v.rate, months });
      return {
        rows: [['Loan amount', money(v.principal)], ['Rate', pct(v.rate)], ['Tenure', `${months} months`], ['Total interest', money(r.interest)], ['Total repayment', money(r.total)]],
        total: ['Monthly EMI', money(r.emi)],
        breakdown: [
          { label: 'Principal', amount: v.principal, display: money(v.principal) },
          { label: 'Interest', amount: r.interest, display: money(r.interest) },
        ],
        table: {
          title: 'Repayment schedule',
          columns: ['Month', 'EMI', 'Principal', 'Interest', 'Balance'],
          rows: schedule.map((s) => [String(s.month), money(s.emi), money(s.principal), money(s.interest), money(s.balance)]),
        },
      };
    },
  },
  {
    id: 'discount', name: 'Discount Calculator', category: 'Finance',
    description: 'Find the sale price after a discount, with an optional second discount.',
    formula: 'Discount = Price × Discount% ÷ 100. A second discount is applied to the already reduced price.',
    fields: [
      { name: 'price', label: 'Original price (₹)' },
      { name: 'percent', label: 'Discount (%)', max: 100 },
      { name: 'extra', label: 'Additional discount (%), optional', max: 100, optional: true },
    ],
    compute: (v) => {
      const r = discount({ price: v.price, percent: v.percent, extra: v.extra });
      const rows = [['Original price', money(v.price)], ['Discount', money(r.first)]];
      if (v.extra > 0) rows.push(['Additional discount', money(r.second)]);
      rows.push(['You save', money(r.saved)]);
      return { rows, total: ['Final price', money(r.final)] };
    },
  },
  {
    id: 'profit-loss', name: 'Profit and Loss Calculator', category: 'Finance',
    description: 'Compare cost and selling price to see profit or loss, markup and margin.',
    formula: 'Profit = Selling price − Cost price. Markup = Profit ÷ Cost × 100. Margin = Profit ÷ Selling price × 100.',
    fields: [
      { name: 'cost', label: 'Cost price (₹)' },
      { name: 'selling', label: 'Selling price (₹)' },
    ],
    compute: (v) => {
      const r = profitLoss({ cost: v.cost, selling: v.selling });
      const label = r.kind === 'profit' ? 'Profit' : r.kind === 'loss' ? 'Loss' : 'No profit or loss';
      return {
        rows: [['Cost price', money(v.cost)], ['Selling price', money(v.selling)], ['Markup on cost', pct(r.markupPct)], ['Margin on selling price', r.marginPct === null ? 'Not applicable' : pct(r.marginPct)]],
        total: [label, money(r.amount)],
      };
    },
  },
  {
    id: 'sip', name: 'SIP Calculator', category: 'Finance',
    description: 'Estimate what a monthly investment could grow to at an assumed yearly return.',
    formula: 'Final value = P × ((1 + i)^n − 1) ÷ i × (1 + i), where i is the annual return ÷ 12 ÷ 100, n is the number of months, and each instalment is invested at the start of the month. These are projections only. Actual returns vary and are not guaranteed.',
    fields: [
      { name: 'monthly', label: 'Monthly investment (₹)' },
      { name: 'rate', label: 'Expected annual return (%)', max: 100 },
      { name: 'duration', label: 'Investment period' },
      { name: 'unit', label: 'Period unit', type: 'select', options: [{ value: 'years', label: 'Years' }, { value: 'months', label: 'Months' }] },
    ],
    compute: (v) => {
      const months = wholeMonths(v.duration, v.unit);
      const r = sip({ monthly: v.monthly, rate: v.rate, months });
      return {
        rows: [['Monthly investment', money(v.monthly)], ['Expected return', pct(v.rate)], ['Period', `${months} months`], ['Total invested', money(r.invested)], ['Estimated returns', money(r.returns)]],
        total: ['Estimated final value', money(r.value)],
      };
    },
  },
  {
    id: 'fixed-deposit', name: 'Fixed Deposit Calculator', category: 'Finance',
    description: 'Estimate the maturity amount and interest on a fixed deposit.',
    formula: 'Maturity = P × (1 + r ÷ n)^(n × t), where r is the yearly rate as a decimal, n is compounding periods per year and t is the tenure in years. Banks may calculate differently, so check your bank for the exact figure.',
    fields: [
      { name: 'principal', label: 'Deposit amount (₹)' },
      { name: 'rate', label: 'Annual interest rate (%)', max: 100 },
      { name: 'duration', label: 'Tenure' },
      { name: 'unit', label: 'Tenure unit', type: 'select', options: UNITS },
      { name: 'n', label: 'Compounding', type: 'select', options: [
        { value: '4', label: 'Quarterly' }, { value: '12', label: 'Monthly' }, { value: '2', label: 'Half-yearly' }, { value: '1', label: 'Yearly' }] },
    ],
    compute: (v) => {
      const r = compoundInterest({ principal: v.principal, rate: v.rate, years: toYears(v.duration, v.unit), n: Number(v.n) });
      return {
        rows: [['Deposit amount', money(v.principal)], ['Rate', pct(v.rate)], ['Tenure', `${v.duration} ${v.unit}`], ['Interest earned', money(r.interest)]],
        total: ['Maturity amount', money(r.total)],
      };
    },
  },
  {
    id: 'recurring-deposit', name: 'Recurring Deposit Calculator', category: 'Finance',
    description: 'Estimate the maturity value of a monthly recurring deposit.',
    formula: 'Each monthly deposit earns interest compounded quarterly (rate ÷ 4) for the months it stays in the account, and the maturity value is the sum of all deposits with their interest. Banks differ in method, so treat this as an estimate.',
    fields: [
      { name: 'monthly', label: 'Monthly deposit (₹)' },
      { name: 'rate', label: 'Annual interest rate (%)', max: 100 },
      { name: 'duration', label: 'Tenure' },
      { name: 'unit', label: 'Tenure unit', type: 'select', options: [{ value: 'months', label: 'Months' }, { value: 'years', label: 'Years' }] },
    ],
    compute: (v) => {
      const months = wholeMonths(v.duration, v.unit);
      const r = rd({ monthly: v.monthly, rate: v.rate, months });
      return {
        rows: [['Monthly deposit', money(v.monthly)], ['Rate', pct(v.rate)], ['Tenure', `${months} months`], ['Total deposits', money(r.deposits)], ['Interest earned', money(r.interest)]],
        total: ['Maturity value', money(r.value)],
      };
    },
  },
  {
    id: 'income-tax', name: 'Income Tax Calculator', category: 'GST & Tax',
    description: `Estimate income tax for FY ${TAX_RULES.fy} (AY ${TAX_RULES.ay}) under the new and old regimes, and see which is lower.`,
    formula: `Based on the FY ${TAX_RULES.fy} rules for resident individuals below 60, stored in src/data/taxRules.js: slab tax, Section 87A rebate (with marginal relief in the new regime), surcharge with marginal relief, and 4% health and education cess. Published summaries report no slab changes in Budget 2026, but please confirm on the official Income Tax Department website. It does not cover capital gains or other special-rate income, senior citizen slabs, or AMT. The "Deductions" field applies to the old regime only and should be the amount you can actually claim (80C, 80D, HRA and so on).`,
    fields: [
      { name: 'income', label: 'Annual gross income (₹)' },
      { name: 'regime', label: 'Tax regime', type: 'select', options: [{ value: 'new', label: 'New regime' }, { value: 'old', label: 'Old regime' }] },
      { name: 'salaried', label: 'Income type', type: 'select', options: [{ value: 'yes', label: 'Salaried or pensioner' }, { value: 'no', label: 'Other' }] },
      { name: 'deductions', label: 'Deductions, old regime only (₹), optional', optional: true },
    ],
    compute: (v) => {
      const input = { gross: v.income, salaried: v.salaried === 'yes', deductions: v.deductions };
      const cmp = compareRegimes(input);
      const r = cmp[v.regime];
      const other = cmp[v.regime === 'new' ? 'old' : 'new'];
      const rows = [
        ['Gross income', money(r.gross)], ['Standard deduction', money(r.standardDeduction)],
        ['Other deductions', money(r.otherDeductions)], ['Taxable income', money(r.taxable)],
        ['Tax on slabs', money(r.slabTax)], ['Section 87A rebate', money(r.rebate)],
        ['Surcharge', money(r.surcharge)], ['Health and education cess (4%)', money(r.cess)],
        ['Effective tax rate', pct(r.effectiveRate)],
        [`Tax under ${TAX_RULES[other.regime].label.toLowerCase()}`, money(other.total)],
        ['Lower tax under', TAX_RULES[cmp.better].label],
      ];
      return { rows, total: [`Estimated tax, ${TAX_RULES[r.regime].label.toLowerCase()}`, money(r.total)] };
    },
  },
  {
    id: 'salary', name: 'Salary Calculator', category: 'Finance',
    description: 'Estimate your monthly take-home pay from an annual gross salary.',
    formula: `Basic = gross × basic %. Employee PF = 12% of basic with no wage ceiling. Allowances = gross − basic. Take-home = gross − PF − professional tax − other deductions − estimated income tax. Income tax uses the new regime with the salaried standard deduction for FY ${TAX_RULES.fy} (see the Income Tax Calculator). Employer contributions, bonuses and reimbursements are not modelled. Company payslips may differ.`,
    fields: [
      { name: 'annual', label: 'Annual gross salary (₹)' },
      { name: 'basicPct', label: 'Basic salary (% of gross)', max: 100, defaultValue: '50' },
      { name: 'pf', label: 'Employee PF (12% of basic)', type: 'select', options: [{ value: 'yes', label: 'Include' }, { value: 'no', label: 'Skip' }] },
      { name: 'pt', label: 'Professional tax per month (₹), varies by state', optional: true, defaultValue: '200' },
      { name: 'other', label: 'Other monthly deductions (₹), optional', optional: true },
      { name: 'tax', label: 'Estimated income tax', type: 'select', options: [{ value: 'yes', label: 'Include' }, { value: 'no', label: 'Skip' }] },
    ],
    compute: (v) => {
      const r = estimateSalary({ gross: v.annual, basicPct: v.basicPct, pf: v.pf === 'yes', ptMonthly: v.pt, otherMonthly: v.other, includeTax: v.tax === 'yes' });
      const m = r.monthly;
      return {
        rows: [['Gross salary per month', money(m.gross)], ['Basic salary', money(m.basic)], ['Allowances', money(m.allowances)],
          ['Employee PF', money(m.pf)], ['Professional tax', money(m.pt)], ['Other deductions', money(m.other)],
          ['Estimated income tax', money(m.tax)], ['Annual take-home', money(r.annualNet)]],
        total: ['Monthly take-home', money(m.net)],
      };
    },
  },
  {
    id: 'percentage', name: 'Percentage Calculator', category: 'Basic Math',
    description: 'Find a percentage of any number, along with values after increase and decrease.',
    formula: 'Part = (Total × Percent) ÷ 100. Increased = Total + Part. Decreased = Total − Part.',
    fields: [
      { name: 'amount', label: 'Base amount', defaultValue: '1000' },
      { name: 'percent', label: 'Percentage (%)', max: 10000, defaultValue: '15' },
    ],
    compute: (v) => {
      const r = calculatePercentage({ amount: v.amount, percent: v.percent });
      return {
        rows: [
          ['Base amount', String(v.amount)],
          ['Percentage rate', `${v.percent}%`],
          [`Amount with +${v.percent}% added`, String(r.increased)],
          [`Amount with −${v.percent}% subtracted`, String(r.decreased)],
        ],
        total: [`${v.percent}% of ${v.amount}`, String(r.part)],
      };
    },
  },
  {
    id: 'average', name: 'Average Calculator', category: 'Basic Math',
    description: 'Calculate the arithmetic mean, sum, count, min, max, and range of up to 5 values.',
    formula: 'Mean = Sum of numbers ÷ Total count.',
    fields: [
      { name: 'n1', label: 'Number 1', defaultValue: '10' },
      { name: 'n2', label: 'Number 2', defaultValue: '20' },
      { name: 'n3', label: 'Number 3, optional', optional: true },
      { name: 'n4', label: 'Number 4, optional', optional: true },
      { name: 'n5', label: 'Number 5, optional', optional: true },
    ],
    compute: (v) => {
      const active = [v.n1, v.n2];
      if (v.n3) active.push(v.n3);
      if (v.n4) active.push(v.n4);
      if (v.n5) active.push(v.n5);
      const r = calculateAverage(active);
      return {
        rows: [
          ['Count of values', String(r.count)],
          ['Sum of values', String(r.sum)],
          ['Minimum value', String(r.min)],
          ['Maximum value', String(r.max)],
          ['Range (Max − Min)', String(r.range)],
        ],
        total: ['Arithmetic Mean (Average)', String(r.mean)],
      };
    },
  },
  {
    id: 'length', name: 'Length Converter', category: 'Conversions',
    description: 'Convert distance and length across metric and imperial units.',
    formula: 'Conversions use exact standard meter ratios (1 ft = 0.3048 m, 1 in = 0.0254 m, 1 mi = 1609.344 m).',
    fields: [
      { name: 'value', label: 'Length to convert', defaultValue: '10' },
      { name: 'from', label: 'From unit', type: 'select', options: LENGTH_UNITS },
      { name: 'to', label: 'To unit', type: 'select', options: LENGTH_UNITS },
    ],
    compute: (v) => {
      const r = convertLength({ value: v.value, from: v.from, to: v.to });
      const fromLabel = LENGTH_UNITS.find((u) => u.value === v.from)?.label ?? v.from;
      const toLabel = LENGTH_UNITS.find((u) => u.value === v.to)?.label ?? v.to;
      return {
        rows: [
          ['Original length', `${v.value} (${fromLabel})`],
          ['Meters (m)', `${r.all.m} m`],
          ['Kilometers (km)', `${r.all.km} km`],
          ['Centimeters (cm)', `${r.all.cm} cm`],
          ['Inches (in)', `${r.all.in} in`],
          ['Feet (ft)', `${r.all.ft} ft`],
          ['Yards (yd)', `${r.all.yd} yd`],
          ['Miles (mi)', `${r.all.mi} mi`],
        ],
        total: [`Converted to ${toLabel}`, `${r.converted} ${v.to}`],
      };
    },
  },
  {
    id: 'temperature', name: 'Temperature Converter', category: 'Conversions',
    description: 'Convert between Celsius (°C), Fahrenheit (°F), and Kelvin (K).',
    formula: '°F = (°C × 9 ÷ 5) + 32. K = °C + 273.15.',
    fields: [
      { name: 'value', label: 'Temperature value', defaultValue: '37' },
      { name: 'from', label: 'From unit', type: 'select', options: TEMP_UNITS },
      { name: 'to', label: 'To unit', type: 'select', options: TEMP_UNITS },
    ],
    compute: (v) => {
      const r = convertTemperature({ value: v.value, from: v.from, to: v.to });
      return {
        rows: [
          ['Celsius', `${r.c} °C`],
          ['Fahrenheit', `${r.f} °F`],
          ['Kelvin', `${r.k} K`],
        ],
        total: [`Target Temperature (${v.to.toUpperCase()})`, `${r.converted} °${v.to.toUpperCase()}`],
      };
    },
  },
  {
    id: 'age', name: 'Age Calculator', category: 'Everyday Tools',
    description: 'Find your exact age in years, months, days, total days lived, and countdown to your next birthday.',
    formula: 'Exact calendar difference between birth date and current date.',
    fields: [
      { name: 'birth', label: 'Date of birth', type: 'date', defaultValue: '2000-01-01' },
    ],
    compute: (v) => {
      const r = calculateAge(v.birth);
      return {
        rows: [
          ['Exact age', `${r.years} years, ${r.months} months, ${r.days} days`],
          ['Total days lived', `${r.totalDays.toLocaleString('en-IN')} days`],
          ['Total weeks lived', `${r.totalWeeks.toLocaleString('en-IN')} weeks`],
          ['Total hours lived', `${r.totalHours.toLocaleString('en-IN')} hours`],
          ['Next birthday countdown', `${r.nextBirthdayDays} day(s) remaining`],
        ],
        total: ['Age', `${r.years} Years Old`],
      };
    },
  },
  {
    id: 'date-diff', name: 'Date Difference Calculator', category: 'Everyday Tools',
    description: 'Calculate the total days, weeks, months and working days between two dates.',
    formula: 'Calendar duration from start date to end date.',
    fields: [
      { name: 'start', label: 'Start date', type: 'date', defaultValue: '2026-01-01' },
      { name: 'end', label: 'End date', type: 'date', defaultValue: '2026-12-31' },
    ],
    compute: (v) => {
      const r = calculateDateDifference(v.start, v.end);
      return {
        rows: [
          ['Calendar duration', `${r.years} years, ${r.months} months, ${r.days} days`],
          ['Total weeks and days', `${r.totalWeeks} weeks, ${r.remainingDays} days`],
          ['Working days (Mon–Fri)', `${r.workingDays} working days`],
        ],
        total: ['Total difference', `${r.totalDays} Days`],
      };
    },
  },
  {
    id: 'bmi', name: 'BMI Calculator', category: 'Everyday Tools',
    description: 'Calculate Body Mass Index (BMI), health classification and ideal weight range.',
    formula: 'BMI = Weight in kg ÷ (Height in meters)². Standard WHO categories apply.',
    fields: [
      { name: 'weight', label: 'Weight (kg)', min: 1, max: 500, defaultValue: '70' },
      { name: 'height', label: 'Height (cm)', min: 30, max: 300, defaultValue: '175' },
    ],
    compute: (v) => {
      const r = calculateBmi({ weight: v.weight, height: v.height });
      return {
        rows: [
          ['Weight', `${v.weight} kg`],
          ['Height', `${v.height} cm (${r.heightM} m)`],
          ['Health category', r.category],
          ['Normal healthy weight range', r.healthyRange],
        ],
        total: ['BMI Score', `${r.bmi} — ${r.category}`],
      };
    },
  },
];

export const getDefinition = (id) => definitions.find((d) => d.id === id) ?? null;
