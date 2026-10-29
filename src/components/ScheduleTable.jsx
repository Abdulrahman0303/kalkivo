import { Download } from 'lucide-react';

// Scrollable, keyboard-reachable table for schedules such as loan amortization.
export default function ScheduleTable({ table }) {
  const downloadCSV = () => {
    const header = table.columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(',');
    const body = table.rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(table.title || 'schedule').toLowerCase().replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className="gst__table" aria-label={table.title}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <h2>{table.title}</h2>
        <button type="button" className="btn btn--ghost" onClick={downloadCSV} style={{ padding: '0.4rem 0.9rem', minHeight: '38px', fontSize: '0.9rem' }}>
          <Download size={16} aria-hidden="true" /> Export CSV
        </button>
      </div>
      <div className="table-wrap" tabIndex={0} role="region" aria-label={`${table.title}, scrollable`}>
        <table>
          <thead><tr>{table.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
          <tbody>
            {table.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
