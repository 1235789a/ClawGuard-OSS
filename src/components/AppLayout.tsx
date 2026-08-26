import type { ReactNode } from 'react';
import type { BusinessProfile, ViewName } from '../types';
import { Logo } from './Logo';
import { EditIcon, HomeIcon, StarIcon, TrendingIcon, UserIcon } from './Icons';

const navItems: Array<{ id: ViewName; label: string; icon: ReactNode }> = [
  { id: 'today', label: 'Today', icon: <HomeIcon size={19} /> },
  { id: 'reviews', label: 'Reviews', icon: <StarIcon size={19} /> },
  { id: 'content', label: 'Content', icon: <EditIcon size={19} /> },
  { id: 'growth', label: 'Growth', icon: <TrendingIcon size={19} /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon size={19} /> },
];

export function AppLayout({ active, onNavigate, profile, children, isDemo = false }: { active: ViewName; onNavigate: (view: ViewName) => void; profile: BusinessProfile; children: ReactNode; isDemo?: boolean }) {
  return <div className="app-shell">
    <aside className="desktop-sidebar">
      <Logo />
      <div className="sidebar-kicker">YOUR DAILY DESK</div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map((item) => <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}>{item.icon}<span>{item.label}</span>{item.id === 'growth' && <span className="nav-dot" />}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip"><div className="tip-icon">✦</div><strong>Small steps add up.</strong><span>Keep your online presence fresh in 3 minutes a day.</span></div>
        <button className="profile-mini" onClick={() => onNavigate('profile')}><div className="avatar">{profile.businessName.slice(0, 1)}</div><div><strong>{profile.businessName}</strong><span>{profile.industry}</span></div><span className="more">•••</span></button>
      </div>
    </aside>
    <main className="main-content">
      {isDemo && <div className="demo-banner"><span>Demo data</span> You’re exploring Joe’s Coffee. Analyze your own website to make this workspace yours.</div>}
      {children}
    </main>
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navItems.map((item) => <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}>{item.icon}<span>{item.label}</span></button>)}
    </nav>
  </div>;
}
