import React, { useState } from 'react';
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
import { useThemeAndProject } from './context/ThemeAndProjectContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { projects, activeProject, setActiveProject } = useThemeAndProject();

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#0A1128] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* 1. Left Sidebar Navigation (Deep Midnight Navy #0A1128) - Collapsible on <1024px */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area: min-w-0 flex-1 overflow-x-hidden to eliminate layout squish */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden overflow-y-auto">
        {/* 2. Top Header & Project Switcher */}
        <Header />

        {/* Dynamic View by activeTab */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full min-w-0">
          {activeTab === 'dashboard' && (
            <>
              {/* Row 1: 4 KPI Statistics Cards (#1) */}
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

          {activeTab === 'pipelines' && (
            <div className="space-y-6 min-w-0">
              <PipelineStageVisualizer />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                <div className="min-w-0">
                  <WaterfallTimeline />
                </div>
                <div className="min-w-0">
                  <BuildAnalyticsCharts />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 min-w-0">
              <RunsHistoryTable />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                <div className="min-w-0">
                  <TestSummaryCard />
                </div>
                <div className="min-w-0">
                  <FailureExplanationPanel />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deployments' && (
            <div className="space-y-6 min-w-0">
              <DeploymentHistoryView compact={false} />
              <DockerContainersWidget compact={false} />
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
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">Active Projects & Repositories</h2>
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

      {/* Global Modals & Drawers */}
      <SourceControlDrawer />
      <RawLogsModal />
    </div>
  );
}
