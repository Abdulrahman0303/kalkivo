// Pure GST logic: no React, no DOM. All money is handled in integer paise
// so results never suffer from floating-point drift.

export const GST_RATES = [0, 3, 5, 12, 18, 28];
export const MAX_PAISE = 999999999999; // ₹9,999,999,999.99

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatINR = (paise) => inr.format(paise / 100);
export const fmtRate = (n) => String(parseFloat(n.toFixed(3)));

/** Parse a custom GST rate: 0 to 100, up to 2 decimals. */
export function parseRate(input) {
  const raw = String(input ?? '').replace(/[%\s]/g, '');
  if (raw === '') return { status: 'empty' };
  if (raw.startsWith('-')) return { status: 'invalid', error: 'Rate cannot be negative.' };
  if (!/^(\d+(\.\d{1,2})?|\.\d{1,2})$/.test(raw)) return { status: 'invalid', error: 'Enter a rate like 7.5 (up to 2 decimals).' };
  const value = Number(raw);
  return value > 100 ? { status: 'invalid', error: 'Rate cannot be more than 100%.' } : { status: 'ok', value };
}

/**
 * Parse user text into paise without using floats.
 * Returns { status: 'empty' } | { status: 'invalid', error } | { status: 'ok', paise }
 */
export function parseAmount(input) {
  const raw = String(input ?? '').replace(/[₹,\s]/g, '');
  if (raw === '') return { status: 'empty' };
  if (raw.startsWith('-')) return { status: 'invalid', error: 'Amount cannot be negative.' };
  if (raw === '.' || !/^\d*\.?\d*$/.test(raw)) {
    return { status: 'invalid', error: 'Enter numbers only, for example 1250.50.' };
  }
  const [whole, frac = ''] = raw.split('.');
  if (frac.length > 2) return { status: 'invalid', error: 'Use at most 2 decimal places.' };
  const tooBig = { status: 'invalid', error: `Enter an amount up to ${formatINR(MAX_PAISE)}.` };
  if (whole.replace(/^0+/, '').length > 10) return tooBig;
  const paise = Number(whole || '0') * 100 + Number(frac.padEnd(2, '0'));
  return paise > MAX_PAISE ? tooBig : { status: 'ok', paise };
}

/**
 * mode: 'add' (amount is pre-tax) or 'remove' (amount includes GST)
 * supplyType: 'intra' (CGST + SGST) or 'inter' (IGST)
 * When GST is an odd number of paise, SGST gets the lower half so CGST + SGST always equals GST.
 */
export function calculateGst({ amountPaise, mode, rate, supplyType }) {
  if (!Number.isInteger(amountPaise) || amountPaise < 0 || amountPaise > MAX_PAISE) {
    throw new RangeError('amountPaise must be a whole number between 0 and the maximum');
  }
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) throw new RangeError(`Unsupported GST rate: ${rate}`);
  if (mode !== 'add' && mode !== 'remove') throw new RangeError(`Unknown mode: ${mode}`);
  if (supplyType !== 'intra' && supplyType !== 'inter') throw new RangeError(`Unknown supply type: ${supplyType}`);

  let taxablePaise;
  let gstPaise;
  let totalPaise;
  if (mode === 'add') {
    taxablePaise = amountPaise;
    gstPaise = Math.round((taxablePaise * rate) / 100);
    totalPaise = taxablePaise + gstPaise;
  } else {
    totalPaise = amountPaise;
    taxablePaise = Math.round((totalPaise * 100) / (100 + rate));
    gstPaise = totalPaise - taxablePaise;
  }

  const intra = supplyType === 'intra';
  const sgstPaise = intra ? Math.floor(gstPaise / 2) : 0;
  const cgstPaise = intra ? gstPaise - sgstPaise : 0;
  const igstPaise = intra ? 0 : gstPaise;

  return { mode, rate, supplyType, originalPaise: amountPaise, taxablePaise, gstPaise, cgstPaise, sgstPaise, igstPaise, totalPaise };
}

export function buildSummaryText(r) {
  const lines = [
    'Kalkivo GST Calculator',
    r.mode === 'add' ? 'Mode: Add GST' : 'Mode: Remove GST',
    r.supplyType === 'intra' ? 'Supply: Intra-state (CGST + SGST)' : 'Supply: Inter-state (IGST)',
    `Original amount: ${formatINR(r.originalPaise)}`,
    `Taxable amount: ${formatINR(r.taxablePaise)}`,
    `GST rate: ${r.rate}%`,
    `GST amount: ${formatINR(r.gstPaise)}`,
  ];
  if (r.supplyType === 'intra') {
    lines.push(`CGST (${fmtRate(r.rate / 2)}%): ${formatINR(r.cgstPaise)}`, `SGST (${fmtRate(r.rate / 2)}%): ${formatINR(r.sgstPaise)}`);
  } else {
    lines.push(`IGST (${r.rate}%): ${formatINR(r.igstPaise)}`);
  }
  lines.push(`Final amount: ${formatINR(r.totalPaise)}`);
  return lines.join('\n');
}
