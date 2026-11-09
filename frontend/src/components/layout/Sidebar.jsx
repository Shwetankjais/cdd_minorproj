import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  History,
  Rocket,
  FlaskConical,
  AlertOctagon,
  FolderGit2,
  Activity,
  GitCommit,
  ShieldCheck,
  X,
} from 'lucide-react';
import DockerContainersWidget from '../deployments/DockerContainersWidget';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { toggleGitDrawer, isSidebarOpen, closeSidebar } = useThemeAndProject();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'source-control', label: 'Source Control (1-Click Git)', icon: GitCommit, action: toggleGitDrawer },
    { id: 'pipelines', label: 'Pipelines & Handoff', icon: GitBranch },
    { id: 'history', label: 'Build History', icon: History },
    { id: 'deployments', label: 'Deployments (1-2h View)', icon: Rocket },
    { id: 'tests', label: 'Test Results', icon: FlaskConical },
    { id: 'errors', label: 'Errors & Logs', icon: AlertOctagon },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay (< 1024px) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar Panel: Collapsible on < 1024px, fixed/static on lg: */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-slate-300 flex flex-col flex-shrink-0 h-screen border-r border-slate-800 select-none transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">DevPulse</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-semibold uppercase">
                  v1.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">CI/CD Pipeline Monitoring</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={closeSidebar}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Core Workflows
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.id);
                  }
                  closeSidebar();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate">{item.label}</span>
                {item.id === 'source-control' && (
                  <span className="ml-auto text-[10px] bg-slate-800 text-sky-400 px-1.5 py-0.5 rounded font-mono border border-slate-700">
                    Sync
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Live Docker Health & CI/CD Status */}
        <div className="p-3 border-t border-slate-800/80 space-y-3 bg-[#0B1120]/50">
          <DockerContainersWidget compact={true} />

          {/* Visual CI/CD Infinity Badge */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-semibold text-slate-200">DevPulse Engine</p>
                <p className="text-[10px] text-slate-400 font-mono">Build • Test • Deploy</p>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </aside>
    </>
  );
}

