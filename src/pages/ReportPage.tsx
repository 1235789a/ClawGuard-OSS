import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Report } from '../types';
import { ArrowRightIcon, CheckIcon, CopyIcon, SparkIcon } from '../components/Icons';
import { ScoreRing } from '../components/ScoreRing';
import { formatDate } from '../lib/utils';

export function ReportPage({ report, onBack, onToast, onEvent }: { report: Report; onBack: () => void; onToast: (message: string) => void; onEvent?: (name: string) => void }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const shareUrl = `${window.location.origin}/report/${report.slug}`;
  const copyLink = async () => { await navigator.clipboard?.writeText(shareUrl); onEvent?.('report_shared'); onToast('Report link copied.'); };
  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes('@') || !consent) return;
    setSending(true);
    try {
      if (import.meta.env.VITE_USE_REMOTE_API === 'true') {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/leads`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, consent: true, source: 'report' }) });
        if (!response.ok) throw new Error('Could not save your email right now.');
      }
      onEvent?.('lead_email_submitted');
      setSent(true);
    } catch (error) { onToast(error instanceof Error ? error.message : 'Could not save your email.'); } finally { setSending(false); }
  };
  return <div className="report-page">
    <header className="report-nav"><button className="report-back" onClick={onBack}>← Back to workspace</button><div className="report-brand"><div className="brand-mark"><SparkIcon size={16} /></div> LocalBiz <i>Copilot</i></div><span className="report-date">Generated {formatDate(report.createdAt)}</span></header>
    <main className="report-main">
      <div className="report-intro"><div className="pill"><span className="pill-dot" /> FREE BUSINESS GROWTH REPORT</div><h1>What’s helping<br /><em>{report.profile.businessName}</em> get discovered?</h1><p>A plain-language snapshot of your online presence, with three practical next steps.</p></div>
      <section className="report-score-card"><div><div className="eyebrow">OVERALL SNAPSHOT</div><h2>{report.profile.businessName}</h2><span className="report-location">{report.profile.industry}{report.profile.location ? ` · ${report.profile.location}` : ''}</span></div><ScoreRing value={report.scores.overall} size="large" label="Growth score" /></section>
      <section className="report-score-strip"><ScoreRing value={report.scores.website} size="small" label="Website" color="blue" /><ScoreRing value={report.scores.reviews} size="small" label="Reviews" color="green" /><ScoreRing value={report.scores.content} size="small" label="Content" color="green" /><ScoreRing value={report.scores.aiVisibility} size="small" label="AI readiness" color="amber" /></section>
      <section className="report-two-col"><div className="report-block"><div className="eyebrow">TOP 3 ISSUES</div><h2>Where to focus next</h2>{report.topIssues.map((issue) => <div className="report-list-item" key={issue}><span>!</span><p>{issue}</p></div>)}</div><div className="report-block"><div className="eyebrow">NEXT 3 ACTIONS</div><h2>Small moves that help</h2>{report.nextActions.map((action) => <div className="report-list-item" key={action}><span className="action-check"><CheckIcon size={14} /></span><p>{action}</p></div>)}</div></section>
      <section className="report-share card"><div><div className="eyebrow">KEEP THIS REPORT</div><h2>Want us to save this report request?</h2><p>Leave your email if you want follow-up recommendations when you choose to opt in.</p></div>{sent ? <div className="sent-state"><CheckIcon size={18} /><strong>Your request is saved.</strong><span>We saved your opt-in for {email}.</span></div> : <form onSubmit={submitLead}><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" required /><label className="consent-row"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> <span>I agree to receive this report and weekly recommendations. Unsubscribe anytime.</span></label><button className="button button-dark" disabled={sending || !consent}>{sending ? 'Saving…' : 'Save request'} <ArrowRightIcon size={15} /></button></form>}</section>
      <div className="report-actions"><button className="button button-light" onClick={copyLink}><CopyIcon size={15} /> Copy {report.isPublic ? 'share' : 'local'} link</button><span>Powered by LocalBiz Copilot</span></div>
      {!report.isPublic && <div className="local-share-note">This local preview link is saved in this browser. Connect D1 to make reports publicly shareable across devices.</div>}
      <div className="report-footer-note">This report is directional and based on the information available at the time of analysis. It is not a guarantee of search or AI recommendations.</div>
    </main>
  </div>;
}
