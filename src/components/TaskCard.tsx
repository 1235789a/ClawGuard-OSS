import type { Task } from '../types';
import { ArrowRightIcon, CheckIcon, EditIcon, SkipIcon, SparkIcon, TrendingIcon } from './Icons';

const taskIcon = { review: <EditIcon size={19} />, content: <SparkIcon size={19} />, improve: <TrendingIcon size={19} /> };
const taskClass = { review: 'peach', content: 'lavender', improve: 'mint' };

export function TaskCard({ task, onAction, onDone, onSkip }: { task: Task; onAction: () => void; onDone: () => void; onSkip: () => void }) {
  const complete = task.status !== 'open';
  return <article className={`task-card ${taskClass[task.kind]} ${complete ? 'is-complete' : ''}`}>
    <div className="task-icon">{taskIcon[task.kind]}</div>
    <div className="task-copy">
      <div className="eyebrow">{task.kind === 'review' ? 'REPLY' : task.kind === 'content' ? 'SHOW UP' : 'IMPROVE'}</div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div className="task-why"><span>Why it matters</span> {task.why}</div>
      {complete && <div className="completed-label"><CheckIcon size={15} /> {task.status === 'done' ? 'Done for today' : 'Skipped for today'}</div>}
    </div>
    <div className="task-actions">
      {!complete && <>
        <button className="button button-dark button-small" onClick={onAction}>{task.actionLabel}<ArrowRightIcon size={15} /></button>
        <div className="quiet-actions"><button onClick={onDone}><CheckIcon size={15} /> Done</button><button onClick={onSkip}><SkipIcon size={15} /> Skip</button></div>
      </>}
    </div>
  </article>;
}
