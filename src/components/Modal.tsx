import type { ReactNode } from 'react';
import { SkipIcon } from './Icons';

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-card" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><SkipIcon size={19} /></button></div>
      {children}
    </div>
  </div>;
}
