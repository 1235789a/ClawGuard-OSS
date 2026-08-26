import type { ReactNode } from 'react';

export function ScoreRing({ value, label, caption, size = 'medium', color = 'blue' }: { value: number | null; label?: string; caption?: ReactNode; size?: 'small' | 'medium' | 'large'; color?: 'blue' | 'green' | 'amber' }) {
  const radius = size === 'large' ? 43 : size === 'small' ? 25 : 34;
  const circumference = 2 * Math.PI * radius;
  const progress = value === null ? 0 : (value / 100) * circumference;
  return <div className={`score-ring-wrap ${size}`}>
    <div className={`score-ring ${color}`}>
      <svg viewBox="0 0 100 100" aria-label={value === null ? `${label ?? 'Score'} not enough data` : `${label ?? 'Score'} ${value} out of 100`}>
        <circle className="score-track" cx="50" cy="50" r={radius} />
        <circle className="score-progress" cx="50" cy="50" r={radius} style={{ strokeDasharray: `${progress} ${circumference}` }} />
      </svg>
      <div className="score-ring-value">{value === null ? '—' : value}<small>{value === null ? '' : '/100'}</small></div>
    </div>
    {label && <div className="score-ring-label">{label}</div>}
    {caption && <div className="score-ring-caption">{caption}</div>}
  </div>;
}
