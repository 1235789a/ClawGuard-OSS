import { useEffect, useMemo, useState } from 'react';
import type { AnalysisResult, AppState, BusinessProfile, Report, Task, ViewName } from './types';
import { AppLayout } from './components/AppLayout';
import { Modal } from './components/Modal';
import { Toast } from './components/Toast';
import { BusinessFoundPage } from './pages/BusinessFoundPage';
import { ContentPage } from './pages/ContentPage';
import { GrowthPage } from './pages/GrowthPage';
import { LandingPage } from './pages/LandingPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportPage } from './pages/ReportPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { TodayPage } from './pages/TodayPage';
import { aiProvider } from './lib/ai';
import { analyzeWebsite } from './lib/analyzer';
import { createEvent, sendEvent } from './lib/analytics';
import { demoProfile, demoScores, demoTasks } from './data/demo';
import { computeScores, nextActions, topIssues } from './lib/scoring';
import { clearState, loadState, saveState } from './lib/storage';
import { slugify } from './lib/utils';
import type { ContentSet } from './types';
import './styles.css';

const emptyState: AppState = { profile: null, scores: { overall: null, website: null, reviews: null, content: null, aiVisibility: null }, tasks: [], taskHistory: [], content: null, report: null, events: [], isDemo: false, leadEmail: '', consent: false };

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState() ?? emptyState);
  const [view, setView] = useState<ViewName>('today');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [toast, setToast] = useState('');
  const [improvement, setImprovement] = useState('');
  const [improvementTitle, setImprovementTitle] = useState('');
  const [reportFromUrl, setReportFromUrl] = useState<Report | null>(null);

  const remoteReports = import.meta.env.VITE_USE_REMOTE_API === 'true';
  const geoUrl = import.meta.env.VITE_MULTIHUB_GEO_URL;
  const activeTasks = useMemo(() => state.tasks.length ? state.tasks : [], [state.tasks]);

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    const path = window.location.pathname;
    if (path.startsWith('/report/')) {
      const slug = path.split('/').filter(Boolean)[1];
      if (state.report?.slug === slug) setReportFromUrl(state.report);
      else if (remoteReports && slug) fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/reports/${encodeURIComponent(slug)}`).then((response) => response.ok ? response.json() : Promise.reject(new Error('Report not found'))).then(setReportFromUrl).catch(() => setReportFromUrl(null));
    }
  }, [remoteReports, state.report]);

  const track = (name: string, properties?: Record<string, string | number | boolean | null>) => {
    const event = createEvent(name, properties);
    setState((current) => ({ ...current, events: [...current.events, event].slice(-200) }));
    void sendEvent(event);
  };
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3500); };

  const launchWorkspace = async (result: AnalysisResult, isDemo = false) => {
    setAnalysis(null);
    let tasks: Task[];
    try { tasks = isDemo ? demoTasks : await aiProvider.generateDailyTasks(result.profile, state.taskHistory); } catch { tasks = await aiProvider.generateDailyTasks(result.profile, state.taskHistory); }
    setState((current) => ({ ...current, profile: result.profile, scores: result.scores, tasks, isDemo, content: null, report: null }));
    setView('today');
    track('business_detected', { mode: isDemo ? 'demo' : result.profile.analysisMode });
  };

  const handleAnalyze = async (url: string) => {
    setAnalyzing(true); setAnalysisError(''); track('website_submitted');
    try { const result = await analyzeWebsite(url); setAnalysis(result); } catch (error) { setAnalysisError(error instanceof Error ? error.message : 'We could not analyze that website.'); track('business_detection_failed'); } finally { setAnalyzing(false); }
  };
  const handleDemo = () => { void launchWorkspace({ profile: demoProfile, scores: demoScores }, true); };
  const handleNavigate = (next: ViewName) => { setView(next); if (next === 'growth') { track('growth_view'); track('geo_cta_view'); } if (next === 'reviews') track('reviews_view'); if (next === 'content') track('content_view'); if (next === 'today') track('daily_task_view'); };
  const updateTask = (task: Task, status: Task['status']) => { setState((current) => ({ ...current, tasks: current.tasks.map((item) => item.id === task.id ? { ...item, status } : item), taskHistory: [...current.taskHistory, { ...task, status }] })); track(status === 'done' ? 'daily_task_completed' : 'daily_task_skipped', { task_kind: task.kind }); };
  const handleTaskAction = async (task: Task) => {
    if (task.kind === 'review') { handleNavigate('reviews'); return; }
    if (task.kind === 'content') { handleNavigate('content'); return; }
    if (!state.profile) return;
    setImprovementTitle(task.title);
    try { setImprovement(await aiProvider.generateRecommendation(task.description, state.profile)); } catch { setImprovement('Add a short, direct answer to this customer question on your website. Keep it specific, useful and easy to scan.'); }
  };
  const refreshTasks = async () => {
    if (!state.profile) return;
    try { const tasks = await aiProvider.generateDailyTasks(state.profile, [...state.taskHistory, ...state.tasks]); setState((current) => ({ ...current, tasks })); notify('Today’s actions have been refreshed.'); } catch { notify('Could not refresh tasks right now.'); }
  };
  const updateProfile = (profile: BusinessProfile) => { setState((current) => ({ ...current, profile, scores: computeScores(profile, current.scores), isDemo: false })); };
  const reanalyze = () => { if (state.profile) void handleAnalyze(state.profile.websiteUrl); };
  const saveContent = (content: ContentSet) => { setState((current) => ({ ...current, content, scores: computeScores(current.profile!, { ...current.scores, content: current.isDemo ? 72 : 68 }) })); track('content_generated', { platform: content.platform }); };
  const markReviewUsed = () => { setState((current) => ({ ...current, scores: computeScores(current.profile!, { ...current.scores, reviews: current.isDemo ? 65 : 70 }) })); track('review_reply_generated'); };
  const createReport = async () => {
    if (!state.profile) return;
    const report: Report = { id: crypto.randomUUID?.() ?? `${Date.now()}`, slug: `${slugify(state.profile.businessName)}-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), profile: state.profile, scores: state.scores, topIssues: topIssues(state.profile, state.scores), nextActions: nextActions(state.profile, state.scores), isPublic: remoteReports };
    if (remoteReports) {
      try { const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/reports`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(report) }); if (response.ok) { const saved = await response.json() as Report; setState((current) => ({ ...current, report: saved })); setView('report'); track('report_generated'); return; } } catch { /* local report remains available */ }
    }
    setState((current) => ({ ...current, report })); setView('report'); track('report_generated');
  };
  const geoCta = () => { track('geo_cta_clicked'); if (geoUrl) window.open(geoUrl, '_blank', 'noopener,noreferrer'); else notify('MultiHub GEO is not connected yet. Add MULTIHUB_GEO_URL to open the service page.'); };
  const reset = () => { clearState(); setState(emptyState); setView('today'); setAnalysis(null); setReportFromUrl(null); };

  if (reportFromUrl) return <ReportPage report={reportFromUrl} onBack={() => { window.history.replaceState({}, '', '/'); setReportFromUrl(null); setView('today'); }} onToast={notify} onEvent={track} />;
  if (analysis) return <BusinessFoundPage result={analysis} onStart={() => void launchWorkspace(analysis)} onEdit={() => { setState((current) => ({ ...current, profile: analysis.profile, scores: analysis.scores })); setAnalysis(null); setView('profile'); }} />;
  if (!state.profile) return <><LandingPage onAnalyze={handleAnalyze} onDemo={handleDemo} isLoading={analyzing} error={analysisError} onViewed={() => track('landing_view')} />{toast && <Toast message={toast} onClose={() => setToast('')} />}</>;

  const content = view === 'today' ? <TodayPage profile={state.profile} scores={state.scores} tasks={activeTasks} onNavigate={handleNavigate} onAction={handleTaskAction} onDone={(task) => updateTask(task, 'done')} onSkip={(task) => updateTask(task, 'skipped')} onRefresh={() => void refreshTasks()} />
    : view === 'reviews' ? <ReviewsPage profile={state.profile} onToast={notify} onReviewUsed={markReviewUsed} onEvent={track} />
      : view === 'content' ? <ContentPage profile={state.profile} content={state.content} onContentGenerated={saveContent} onToast={notify} onEvent={track} />
        : view === 'growth' ? <GrowthPage profile={state.profile} scores={state.scores} onNavigate={handleNavigate} onCreateReport={() => void createReport()} onGeoCta={geoCta} onVisibilityView={() => track('ai_visibility_view')} />
          : view === 'profile' ? <ProfilePage profile={state.profile} onSave={updateProfile} onReanalyze={reanalyze} onReset={reset} onToast={notify} />
            : state.report ? <ReportPage report={state.report} onBack={() => handleNavigate('growth')} onToast={notify} onEvent={track} /> : <GrowthPage profile={state.profile} scores={state.scores} onNavigate={handleNavigate} onCreateReport={() => void createReport()} onGeoCta={geoCta} onVisibilityView={() => track('ai_visibility_view')} />;
  return <><AppLayout active={view === 'report' ? 'growth' : view} onNavigate={handleNavigate} profile={state.profile} isDemo={state.isDemo}>{content}</AppLayout>{improvement && <Modal title={improvementTitle} onClose={() => setImprovement('')}><div className="recommendation-modal"><div className="recommendation-icon">✦</div><p>{improvement}</p><button className="button button-dark full-button" onClick={() => { setImprovement(''); notify('Recommendation saved as your next step.'); }}>Got it</button></div></Modal>}{toast && <Toast message={toast} onClose={() => setToast('')} />}</>;
}
