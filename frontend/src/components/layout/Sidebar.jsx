import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  GitCommit,
  Activity,
  History,
  Rocket,
  Sparkles,
  ShieldCheck,
  X,
  Layers,
  FlaskConical,
  AlertOctagon,
} from 'lucide-react';
import DockerContainersWidget from '../deployments/DockerContainersWidget';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const {
    toggleGitDrawer,
    isSidebarOpen,
    closeSidebar,
    isAiCopilotOpen,
    toggleAiCopilot,
    workspaces,
  } = useThemeAndProject();

  const primaryNavItems = [
    {
      id: 'overview',
      aliases: ['dashboard'],
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'workspaces',
      aliases: ['projects'],
      label: 'Workspaces & Repo Hub',
      icon: FolderGit2,
      badge: `${workspaces.length || 4}`,
    },
    {
      id: 'source-control',
      aliases: [],
      label: 'Source Control (1-Click Git)',
      icon: GitCommit,
      badge: 'Sync',
      onClick: () => {
        setActiveTab('source-control');
        toggleGitDrawer();
      },
    },
    {
      id: 'analytics',
      aliases: ['pipelines'],
      label: 'Analytics & Charts',
      icon: Activity,
    },
    {
      id: 'runs',
      aliases: ['history', 'tests', 'errors'],
      label: 'Runs & Diagnostics',
      icon: History,
    },
    {
      id: 'deployments',
      aliases: [],
      label: 'Deployments & Docker',
      icon: Rocket,
    },
  ];

  const isItemActive = (item) => {
    return activeTab === item.id || (item.aliases && item.aliases.includes(activeTab));
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (< 1024px) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#070D1F]/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar Panel: Collapsible on < 1024px, fixed/static on lg: */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A1128] text-[#94A3B8] flex flex-col flex-shrink-0 h-screen border-r border-[#323742] select-none transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#323742] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0D1B2A] to-[#1C1E24] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#000000]/40">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-[#F8FAFC] tracking-tight">DevPulse</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold uppercase">
                  v1.4
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] font-medium">CI/CD Pipeline Monitoring</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={closeSidebar}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C1E24] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Core Views
          </div>

          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    setActiveTab(item.id);
                  }
                  closeSidebar();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-[#1C1E24] text-[#F8FAFC] border-l-4 border-[#D4AF37] shadow-sm font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C1E24]/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    active ? 'text-[#D4AF37]' : 'text-[#94A3B8]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                      active
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40'
                        : 'bg-[#1C1E24] text-[#94A3B8] border-[#323742]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Dedicated Copilot Action Row */}
          <div className="pt-3">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              AI Companion
            </div>
            <button
              onClick={() => {
                toggleAiCopilot();
                closeSidebar();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isAiCopilotOpen
                  ? 'bg-[#1C1E24] text-[#D4AF37] border border-[#D4AF37]/50 shadow-sm'
                  : 'text-[#F8FAFC] bg-[#1C1E24]/40 hover:bg-[#1C1E24] border border-[#323742]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="truncate">DevPulse Copilot</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>
          </div>
        </nav>

        {/* Bottom Live Docker Health & CI/CD Status */}
        <div className="p-3 border-t border-[#323742] space-y-3 bg-[#0D1B2A]">
          <DockerContainersWidget compact={true} />

          {/* Visual CI/CD Infinity Badge */}
          <div className="p-3 rounded-xl bg-[#1C1E24] border border-[#323742] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-semibold text-[#F8FAFC]">DevPulse Engine</p>
                <p className="text-[10px] text-[#94A3B8] font-mono">Build • Test • Deploy</p>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </aside>
    </>
  );
}
