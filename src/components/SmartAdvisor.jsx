import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { generateInsights } from '../utils/advisorEngine.js';
import { copyText } from '../utils/clipboard.js';

export default function SmartAdvisor({ calculatorId, values = {}, result = {} }) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const insights = generateInsights({ calculatorId, values, result });
  if (!insights || insights.length === 0) return null;

  const copyInsights = async () => {
    const text = [
      '💡 Kalkivo AI Smart Insights:',
      ...insights.map((i) => `• ${i.badge}\n  ${i.title}\n  ${i.text}`),
    ].join('\n\n');
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        marginTop: '1.25rem',
        padding: '1.15rem 1.25rem',
        background: 'color-mix(in srgb, var(--accent) 7%, var(--surface))',
        border: '1.5px solid color-mix(in srgb, var(--accent) 26%, var(--line))',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.25s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.8rem',
          flexWrap: 'wrap',
          marginBottom: collapsed ? '0' : '0.9rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'var(--accent)',
              color: '#ffffff',
              boxShadow: '0 4px 10px color-mix(in srgb, var(--accent) 40%, transparent)',
            }}
          >
            <Sparkles size={18} />
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            AI Smart Advisor Insights
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={copyInsights}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              padding: '0.3rem 0.6rem',
              color: 'var(--muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            title="Copy insights to share on WhatsApp"
          >
            {copied ? <Check size={14} color="#0E9F6E" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Share'}
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'transparent',
              border: 0,
              color: 'var(--muted)',
              padding: '0.3rem',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
            aria-label={collapsed ? 'Expand insights' : 'Collapse insights'}
          >
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {insights.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.85rem 1rem',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '99px',
                    background: 'var(--key)',
                    color: 'var(--ink)',
                  }}
                >
                  {item.badge}
                </span>
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--ink)' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '0.92rem', color: 'var(--muted)', margin: 0, lineHeight: 1.55 }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
