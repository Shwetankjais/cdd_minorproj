import React, { useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import NotFoundView from './components/layout/NotFoundView';
import ToastNotification from './components/common/ToastNotification';
import KpiStatsGrid from './components/dashboard/KpiStatsGrid';
import PipelineStageVisualizer from './components/dashboard/PipelineStageVisualizer';
import BuildStatisticsOverviewCard from './components/dashboard/BuildStatisticsOverviewCard';
import BuildAnalyticsCharts from './components/dashboard/BuildAnalyticsCharts';
import RunsHistoryTable from './components/dashboard/RunsHistoryTable';
import TestSummaryCard from './components/dashboard/TestSummaryCard';
import FailureExplanationPanel from './components/dashboard/FailureExplanationPanel';
import WaterfallTimeline from './components/dashboard/WaterfallTimeline';
import DeploymentHistoryView from './components/deployments/DeploymentHistoryView';
import DockerContainersWidget from './components/deployments/DockerContainersWidget';
import SourceControlDrawer from './components/git/SourceControlDrawer';
import RawLogsModal from './components/dashboard/RawLogsModal';
import AuthLoginView from './components/auth/AuthLoginView';
import WorkspaceHubView from './components/workspace/WorkspaceHubView';
import AiCopilotSidebar from './components/ai/AiCopilotSidebar';
import { useThemeAndProject } from './context/ThemeAndProjectContext';
import { GitCommit, ArrowRight, Activity, History, AlertOctagon, Rocket } from 'lucide-react';

export default function App() {
  const {
    isAuthenticated,
    activeTab,
    setActiveTab,
    toggleGitDrawer,
  } = useThemeAndProject();

  // Dynamic document.title per active tab view
  useEffect(() => {
    const titles = {
      overview: 'Overview Dashboard — DevPulse',
      workspaces: 'Workspaces Hub — DevPulse',
      runs: 'Pipeline Runs & History — DevPulse',
      diagnostics: 'Diagnostics & Failure Analysis — DevPulse',
      analytics: 'Build Analytics & Metrics — DevPulse',
      deployments: 'Deployments & Docker Telemetry — DevPulse',
      'source-control': 'Source Control & Git Sync — DevPulse',
    };
    document.title = titles[activeTab] || 'DevPulse — Visual CI/CD Pipeline Monitoring & DevOps Cockpit';
  }, [activeTab]);

  // If user is logged out, render the Auth & GitHub Gate
  if (!isAuthenticated) {
    return <AuthLoginView />;
  }

  const isOverview = activeTab === 'overview' || activeTab === 'dashboard';
  const isRuns = activeTab === 'runs' || activeTab === 'pipelines' || activeTab === 'history';
  const isDiagnostics = activeTab === 'diagnostics' || activeTab === 'tests' || activeTab === 'errors';
  const isWorkspaces = activeTab === 'workspaces' || activeTab === 'projects';
  const isAnalytics = activeTab === 'analytics';
  const isDeployments = activeTab === 'deployments';
  const isSourceControl = activeTab === 'source-control';
  const isKnownTab =
    isOverview ||
    isRuns ||
    isDiagnostics ||
    isWorkspaces ||
    isAnalytics ||
    isDeployments ||
    isSourceControl;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full overflow-x-hidden bg-[#FAF8F5] dark:bg-[#0B0E14] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-150">
      {/* 1. Left Sidebar Navigation (Desktop Shell: h-screen flex-shrink-0) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area: Responsive flex-col min-w-0 */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* 2. Top Header & Breadcrumb */}
        <Header />

        {/* Dynamic Dedicated View: Render ONLY the selected tab view (Zero Page Dump) */}
        <main className="flex-1 p-3.5 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden min-w-0 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto w-full space-y-4">
            {/* Tab 1: Overview (Fits in 1 Viewport with ZERO Scroll - 2-Column Grid) */}
            {isOverview && (
              <div className="space-y-4">
                {/* Top Row: 4 compact KPI Statistics Cards */}
                <KpiStatsGrid />

                {/* Row 2: 2-Column Balanced Grid (Left 2/3: Pipeline Execution Flow + Role Handoff, Right 1/3: Build Statistics) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                  <div className="lg:col-span-2">
                    <PipelineStageVisualizer />
                  </div>
                  <div className="lg:col-span-1">
                    <BuildStatisticsOverviewCard />
                  </div>
                </div>

                {/* Shortcut Navigation Pills to other dedicated tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('runs')}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#181C24] border border-[#E2E8F0] dark:border-[#2A303C] hover:border-[#D4AF37]/50 shadow-sm text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5 font-sans">
                        <History className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>View Pipeline Runs & History</span>
                      </p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-sans">
                        Searchable runs & waterfall execution timeline
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('diagnostics')}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#181C24] border border-[#E2E8F0] dark:border-[#2A303C] hover:border-[#D4AF37]/50 shadow-sm text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5 font-sans">
                        <AlertOctagon className="w-3.5 h-3.5 text-[#E63946]" />
                        <span>Diagnostics & Failure Analysis</span>
                      </p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-sans">
                        3-line root cause diagnosis & terminal logs
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#181C24] border border-[#E2E8F0] dark:border-[#2A303C] hover:border-[#D4AF37]/50 shadow-sm text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5 font-sans">
                        <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>View Analytics & Charts</span>
                      </p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-sans">
                        Duration trend, pass rate donut & stage failures
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Workspaces */}
            {isWorkspaces && <WorkspaceHubView />}

            {/* Tab 3: Pipeline Runs (Runs History + Waterfall Timeline) */}
            {isRuns && (
              <div className="space-y-4">
                <RunsHistoryTable />
                <WaterfallTimeline />
              </div>
            )}

            {/* Tab 4: Diagnostics & Tests (Test Results + 3-Line Failure Explanation) */}
            {isDiagnostics && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <TestSummaryCard />
                  <FailureExplanationPanel />
                </div>
              </div>
            )}

            {/* Tab 5: Analytics (3-Chart Single-Screen Grid) */}
            {isAnalytics && <BuildAnalyticsCharts fullGrid={true} />}

            {/* Tab 6: Deployments & Docker */}
            {isDeployments && (
              <div className="space-y-4">
                <DeploymentHistoryView compact={false} />
                <DockerContainersWidget compact={false} />
              </div>
            )}

            {/* Tab 7: Source Control */}
            {isSourceControl && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                      <GitCommit className="w-4 h-4 text-[#D4AF37]" />
                      <span>Source Control & GitHub Sync Cockpit</span>
                    </h2>
                    <p className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Stage changed files, generate conventional commit messages, and push directly to GitHub.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleGitDrawer}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-[#D4AF37] text-[#0A1128] hover:bg-[#C5A059] transition-colors cursor-pointer"
                  >
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>Open 1-Click Git Drawer</span>
                  </button>
                </div>
              </div>
            )}

            {/* Fallback 404 Route for Unmatched Tabs */}
            {!isKnownTab && <NotFoundView invalidTab={activeTab} />}
          </div>

          {/* Universal Footer Component */}
          <div className="max-w-7xl mx-auto w-full mt-6">
            <Footer />
          </div>
        </main>
      </div>

      {/* Global Panels, Modals & Toast Feedback */}
      <AiCopilotSidebar />
      <SourceControlDrawer />
      <RawLogsModal />
      <ToastNotification />
    </div>
  );
}
