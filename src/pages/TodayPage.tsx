import type { BusinessProfile, Scores, Task, ViewName } from '../types';
import { PageHeader } from '../components/PageHeader';
import { ScoreRing } from '../components/ScoreRing';
import { TaskCard } from '../components/TaskCard';
import { ArrowRightIcon, RefreshIcon } from '../components/Icons';
import { todayKey } from '../lib/utils';

export function TodayPage({ profile, scores, tasks, onNavigate, onAction, onDone, onSkip, onRefresh }: { profile: BusinessProfile; scores: Scores; tasks: Task[]; onNavigate: (view: ViewName) => void; onAction: (task: Task) => void; onDone: (task: Task) => void; onSkip: (task: Task) => void; onRefresh: () => void }) {
  const firstName = profile.businessName.replace(/['’].*$/, '').split(' ')[0] || profile.businessName;
  const completed = tasks.filter((task) => task.status !== 'open').length;
  return <div className="page page-today"><PageHeader eyebrow={todayKey() === profile.lastAnalyzedAt.slice(0, 10) ? 'YOUR DAILY DESK' : 'YOUR DAILY DESK'} title={<>Good morning, {firstName} <span className="wave">✦</span></>} description="A few useful things to keep your business moving forward." action={<button className="button button-light" onClick={onRefresh}><RefreshIcon size={16} /> Refresh today</button>} />
    <section className="today-summary"><div className="today-score"><ScoreRing value={scores.overall} size="large" label="Growth score" caption={<button className="inline-link" onClick={() => onNavigate('growth')}>See what’s behind it <ArrowRightIcon size={13} /></button>} /></div><div className="summary-copy"><div className="eyebrow">A LITTLE MOMENTUM</div><h2>You’re building a stronger<br />online presence.</h2><p>Three small actions are ready for you. Do what feels useful today—there’s no perfect way to market a small business.</p><div className="progress-line"><span><b>{completed}</b> of 3 done</span><div><i style={{ width: `${(completed / 3) * 100}%` }} /></div></div></div><div className="summary-illustration"><span>☼</span><i /><b>One step<br />at a time</b></div></section>
    <div className="section-heading"><div><div className="eyebrow">{completed === 3 ? 'NICE WORK' : 'YOUR FOCUS FOR TODAY'}</div><h2>{completed === 3 ? 'You’ve done today’s three.' : '3 things to do today'}</h2></div><span className="section-date">{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}</span></div>
    <section className="task-list">{tasks.map((task) => <TaskCard key={task.id} task={task} onAction={() => onAction(task)} onDone={() => onDone(task)} onSkip={() => onSkip(task)} />)}</section>
    <section className="today-bottom"><div><div className="today-bottom-icon">☼</div><div><strong>Not sure where to start?</strong><span>Start with the task that feels easiest. Consistency beats complexity.</span></div></div><button className="text-button" onClick={() => onNavigate('growth')}>View your growth <ArrowRightIcon size={15} /></button></section>
  </div>;
}
