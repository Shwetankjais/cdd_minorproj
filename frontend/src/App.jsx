import React from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import KpiStatsGrid from './components/dashboard/KpiStatsGrid';
import PipelineStageVisualizer from './components/dashboard/PipelineStageVisualizer';
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
import { GitCommit, GitBranch, Terminal, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const {
    isAuthenticated,
    activeTab,
    setActiveTab,
    projects,
    activeProject,
    setActiveProject,
    toggleGitDrawer,
  } = useThemeAndProject();

  // If user is logged out, render the Auth & GitHub Gate (Screenshot 1)
  if (!isAuthenticated) {
    return <AuthLoginView />;
  }

  // Treat 'dashboard' as alias for 'overview'
  const isOverview = activeTab === 'overview' || activeTab === 'dashboard';

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#0A1128] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* 1. Left Sidebar Navigation (Deep Midnight Navy #0A1128) - Collapsible on <1024px */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area: min-w-0 flex-1 overflow-x-hidden to eliminate layout squish */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden overflow-y-auto">
        {/* 2. Top Header & Project Switcher */}
        <Header />

        {/* Dynamic Dedicated View by activeTab (Eliminates excessive vertical scrolling) */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full min-w-0">
          {/* View 1: Overview Dashboard (Complete KPI & Stage Matrix) */}
          {isOverview && (
            <>
              {/* Row 1: 4 KPI Statistics Cards */}
              <div className="min-w-0">
                <KpiStatsGrid />
              </div>

              {/* Row 2: Visual Stage Flow + 80% Role Handoff Bar (Left 2/3) & Analytics Charts (Right 1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-w-0">
                <div className="lg:col-span-2 min-w-0">
                  <PipelineStageVisualizer />
                </div>
                <div className="lg:col-span-1 min-w-0">
                  <BuildAnalyticsCharts />
                </div>
              </div>

              {/* Row 3: Pipeline History Table (Left 2/3) & Diagnostic Stack (Right 1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start min-w-0">
                <div className="lg:col-span-2 min-w-0">
                  <RunsHistoryTable />
                </div>
                <div className="lg:col-span-1 space-y-6 min-w-0">
                  <TestSummaryCard />
                  <FailureExplanationPanel />
                </div>
              </div>

              {/* Row 4: Waterfall Execution Timeline (Left 2/3) & Deployment History (Right 1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start min-w-0">
                <div className="lg:col-span-2 min-w-0">
                  <WaterfallTimeline />
                </div>
                <div className="lg:col-span-1 min-w-0">
                  <DeploymentHistoryView compact={true} />
                </div>
              </div>
            </>
          )}

          {/* View 2: Antigravity-Style Workspace & Repo Hub (Screenshot 2 & 3) */}
          {activeTab === 'workspaces' && <WorkspaceHubView />}

          {/* View 3: Dedicated 1-Click Git Source Control View */}
          {activeTab === 'source-control' && (
            <div className="space-y-6 min-w-0">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1E24] border border-[#E2E8F0] dark:border-[#323742] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-8 h-8 rounded-lg bg-[#0A1128] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center font-bold font-mono">
                      <GitCommit className="w-4 h-4" />
                    </span>
                    <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      Source Control Cockpit
                    </h2>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Review modified/untracked files, auto-generate commit messages, and trigger 1-click push to GitHub.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleGitDrawer}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#C5A059] text-[#0A1128] shadow-sm transition-all"
                  >
                    <GitCommit className="w-4 h-4" />
                    <span>Open 1-Click Git Drawer</span>
                  </button>
                </div>
              </div>

              {/* Connected Pipeline Context */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                <div className="min-w-0">
                  <WaterfallTimeline />
                </div>
                <div className="min-w-0">
                  <RunsHistoryTable />
                </div>
              </div>
            </div>
          )}

          {/* View 4: Analytics & Charts View */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 min-w-0">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Build Analytics & Pipeline Health
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Historical build duration trends, test failure distributions, and pass rate statistics
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
                <div className="lg:col-span-2 min-w-0">
                  <BuildAnalyticsCharts />
                </div>
                <div className="lg:col-span-1 min-w-0">
                  <TestSummaryCard />
                </div>
              </div>

              <div className="min-w-0">
                <WaterfallTimeline />
              </div>
            </div>
          )}

          {/* View 5: Runs & Diagnostics Stack */}
          {activeTab === 'runs' && (
            <div className="space-y-6 min-w-0">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Pipeline Runs & Failure Diagnostics
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Select any failed pipeline run to review raw logs, root causes, and suggested fixes
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start min-w-0">
                <div className="lg:col-span-2 min-w-0">
                  <RunsHistoryTable />
                </div>
                <div className="lg:col-span-1 space-y-6 min-w-0">
                  <FailureExplanationPanel />
                  <TestSummaryCard />
                </div>
              </div>
            </div>
          )}

          {/* View 6: Deployments & Docker Containers */}
          {activeTab === 'deployments' && (
            <div className="space-y-6 min-w-0">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Deployment History & Docker Cluster Health
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Inspect live release stages and cluster containers across devpulse-frontend, backend, and postgres
                </p>
              </div>

              <DeploymentHistoryView compact={false} />
              <DockerContainersWidget compact={false} />
            </div>
          )}

          {/* Compatibility Views for Deep Links / Legacy Subtabs */}
          {activeTab === 'pipelines' && (
            <div className="space-y-6 min-w-0">
              <PipelineStageVisualizer />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                <WaterfallTimeline />
                <BuildAnalyticsCharts />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 min-w-0">
              <RunsHistoryTable />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                <TestSummaryCard />
                <FailureExplanationPanel />
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-6 min-w-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
                <div className="lg:col-span-1 min-w-0">
                  <TestSummaryCard />
                </div>
                <div className="lg:col-span-2 min-w-0">
                  <FailureExplanationPanel />
                </div>
              </div>
              <RunsHistoryTable />
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-6 min-w-0">
              <FailureExplanationPanel />
              <RunsHistoryTable />
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6 min-w-0">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Active Projects & Repositories
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Select a repository to inspect its automated CI/CD pipeline health
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
                {projects.map((proj) => {
                  const isCurrent = proj.id === activeProject.id;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => setActiveProject(proj)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-white dark:bg-[#23272F] border-[#D4AF37] shadow-warm-md ring-1 ring-[#D4AF37]'
                          : 'bg-white dark:bg-[#1C1E24] border-[#E2E8F0] dark:border-[#323742] hover:border-[#D4AF37]/50 dark:hover:border-[#2D3748]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-8 h-8 rounded-lg bg-[#0A1128]/5 dark:bg-[#0D1B2A] text-[#0A1128] dark:text-[#D4AF37] border border-[#E2E8F0] dark:border-[#323742] flex items-center justify-center font-bold font-mono text-xs">
                          {proj.displayName ? proj.displayName.slice(0, 2).toUpperCase() : 'PR'}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            proj.status === 'Healthy'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : proj.status === 'Unstable'
                              ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                              : 'bg-[#E63946]/10 text-[#E63946]'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </div>
                      <h3 className="font-mono font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] truncate">
                        {proj.displayName || proj.name}
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                        {proj.passRate}% builds passing • {proj.lastAuthor}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. Right-Column Live AI Agent Copilot (Screenshot 3) */}
      <AiCopilotSidebar />

      {/* Global Modals & Drawers */}
      <SourceControlDrawer />
      <RawLogsModal />
    </div>
  );
}
