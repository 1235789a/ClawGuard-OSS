import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
const icon = (path: ReactNode) => ({ size = 22, ...props }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{path}</svg>;

export const HomeIcon = icon(<><path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></>);
export const StarIcon = icon(<><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></>);
export const EditIcon = icon(<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>);
export const TrendingIcon = icon(<><path d="M3 17 9 11l4 4 7-8"/><path d="M15 7h5v5"/></>);
export const UserIcon = icon(<><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></>);
export const ArrowRightIcon = icon(<><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>);
export const CheckIcon = icon(<><path d="m5 12 4 4L19 6"/></>);
export const SkipIcon = icon(<><path d="m6 7 10 10"/><path d="m16 7-10 10"/></>);
export const RefreshIcon = icon(<><path d="M20 11a8 8 0 0 0-14.7-4L3 10"/><path d="M3 4v6h6"/><path d="M4 13a8 8 0 0 0 14.7 4L21 14"/><path d="M21 20v-6h-6"/></>);
export const CopyIcon = icon(<><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>);
export const QrIcon = icon(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14v2"/></>);
export const ExternalIcon = icon(<><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>);
export const MenuIcon = icon(<><path d="M4 6h16M4 12h16M4 18h16"/></>);
export const SparkIcon = icon(<><path d="m12 3-1.4 5.6L5 10l5.6 1.4L12 17l1.4-5.6L19 10l-5.6-1.4L12 3Z"/><path d="m19 16-.6 2.4L16 19l2.4.6L19 22l.6-2.4L22 19l-2.4-.6L19 16Z"/></>);
export const ChevronDownIcon = icon(<path d="m6 9 6 6 6-6"/>);
export const ChevronRightIcon = icon(<path d="m9 18 6-6-6-6"/>);
export const LockIcon = icon(<><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>);
export const InfoIcon = icon(<><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></>);
export const GlobeIcon = icon(<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>);
export const LogOutIcon = icon(<><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 3v18"/></>);
