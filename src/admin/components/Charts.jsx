/**
 * მარტივი, დამოკიდებულებების გარეშე SVG გრაფიკები.
 * (chart ბიბლიოთეკა განზრახ არ გამოიყენება — პროექტის სტეკი მინიმალურია)
 */
import { useId } from 'react';

const PALETTE = ['#a78bfa', '#f0abfc', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];

/* ─────────── ხაზოვანი / არეალის გრაფიკი ─────────── */
export function AreaChart({ data = [], height = 200, valueKey = 'total', labelKey = 'date', formatValue = (v) => v }) {
  const gid = useId().replace(/:/g, '');
  if (!data.length) return <p className="text-muted text-sm">მონაცემები არ არის</p>;

  const width = 640;
  const pad = { top: 14, right: 10, bottom: 26, left: 10 };
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const points = data.map((d, i) => ({
    x: pad.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
    y: pad.top + innerH - ((Number(d[valueKey]) || 0) / max) * innerH,
    d,
  }));

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${points.at(-1).x.toFixed(1)},${pad.top + innerH} L${points[0].x.toFixed(1)},${pad.top + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="გაყიდვების დინამიკა">
      <defs>
        <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity=".45" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={pad.left} x2={width - pad.right}
          y1={pad.top + innerH * t} y2={pad.top + innerH * t}
          stroke="rgba(160,130,255,.12)" strokeWidth="1"
        />
      ))}

      <path d={area} fill={`url(#area-${gid})`} />
      <path d={line} fill="none" stroke="#a78bfa" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.2" fill="#0a0616" stroke="#a78bfa" strokeWidth="2" />
          <title>{`${p.d[labelKey]}: ${formatValue(p.d[valueKey])}`}</title>
        </g>
      ))}

      {points.map((p, i) => (
        (i % Math.ceil(points.length / 7) === 0 || i === points.length - 1) && (
          <text key={`t-${i}`} x={p.x} y={height - 8} textAnchor="middle" fontSize="10" fill="#6f6890">
            {String(p.d[labelKey]).slice(5)}
          </text>
        )
      ))}
    </svg>
  );
}

/* ─────────── დონატ გრაფიკი ─────────── */
export function DonutChart({ data = [], size = 190, thickness = 26 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <p className="text-muted text-sm">მონაცემები არ არის</p>;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex-center gap-20 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="განაწილება">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={thickness} />
          {data.map((d, i) => {
            const dash = (d.value / total) * circumference;
            const el = (
              <circle
                key={d.label}
                cx={size / 2} cy={size / 2} r={radius}
                fill="none"
                stroke={d.color || PALETTE[i % PALETTE.length]}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              >
                <title>{`${d.label}: ${d.value}`}</title>
              </circle>
            );
            offset += dash;
            return el;
          })}
        </g>
        <text x="50%" y="47%" textAnchor="middle" fontSize="26" fontWeight="800" fill="#f0edfb">{total}</text>
        <text x="50%" y="60%" textAnchor="middle" fontSize="10" fill="#948dba">სულ</text>
      </svg>

      <div className="legend" style={{ flexDirection: 'column', gap: 9 }}>
        {data.map((d, i) => (
          <span key={d.label} className="legend-item">
            <span className="legend-dot" style={{ background: d.color || PALETTE[i % PALETTE.length] }} />
            {d.label} <b style={{ color: 'var(--text)' }}>{d.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────── ჰორიზონტალური ბარები ─────────── */
export function BarList({ data = [], formatValue = (v) => v }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (!data.length) return <p className="text-muted text-sm">მონაცემები არ არის</p>;

  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 11 }}>
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="flex-between text-sm mb-8" style={{ marginBottom: 5 }}>
            <span className="truncate" style={{ maxWidth: '70%' }}>{d.label}</span>
            <b>{formatValue(d.value)}</b>
          </div>
          <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
            <div style={{
              width: `${(d.value / max) * 100}%`,
              height: '100%',
              borderRadius: 4,
              background: `linear-gradient(90deg, ${PALETTE[i % PALETTE.length]}, ${PALETTE[(i + 1) % PALETTE.length]})`,
              transition: 'width .6s cubic-bezier(.22,1,.36,1)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
