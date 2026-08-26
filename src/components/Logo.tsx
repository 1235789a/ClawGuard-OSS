import { SparkIcon } from './Icons';

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="brand-lockup">
    <div className="brand-mark"><SparkIcon size={18} /></div>
    {!compact && <div><strong>LocalBiz</strong><span>Copilot</span></div>}
  </div>;
}
