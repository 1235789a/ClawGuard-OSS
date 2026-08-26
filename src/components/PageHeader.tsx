import type { ReactNode } from 'react';
import { MenuIcon } from './Icons';

export function PageHeader({ eyebrow, title, description, action, mobileMenu }: { eyebrow?: string; title: ReactNode; description?: string; action?: ReactNode; mobileMenu?: () => void }) {
  return <div className="page-header">
    <div className="page-header-copy"><div className="mobile-header-top"><span className="mobile-wordmark">LocalBiz <i>Copilot</i></span>{mobileMenu && <button className="mobile-menu" onClick={mobileMenu} aria-label="Open menu"><MenuIcon size={21} /></button>}</div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>
    {action && <div className="page-header-action">{action}</div>}
  </div>;
}
