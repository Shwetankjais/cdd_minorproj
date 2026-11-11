import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  GitCommit,
  Activity,
  History,
  Rocket,
  AlertOctagon,
  Sparkles,
  X,
  ShieldCheck,
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

  const navItems = [
    {
      id: 'overview',
      aliases: ['dashboard'],
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'workspaces',
      aliases: ['projects'],
      label: 'Workspaces',
      icon: FolderGit2,
      badge: `${workspaces.length || 4}`,
    },
    {
      id: 'runs',
      aliases: ['pipelines', 'history'],
      label: 'Pipeline Runs',
      icon: History,
    },
    {
      id: 'diagnostics',
      aliases: ['tests', 'errors'],
      label: 'Diagnostics & Tests',
      icon: AlertOctagon,
    },
    {
      id: 'analytics',
      aliases: [],
      label: 'Analytics',
      icon: Activity,
    },
    {
      id: 'deployments',
      aliases: [],
      label: 'Deployments & Docker',
      icon: Rocket,
    },
    {
      id: 'source-control',
      aliases: [],
      label: 'Source Control',
      icon: GitCommit,
      badge: 'Git',
      onClick: () => {
        setActiveTab('source-control');
        toggleGitDrawer();
      },
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
          className="fixed inset-0 bg-[#070D1F]/70 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar Desktop Shell: h-screen flex-shrink-0 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-white dark:bg-[#0B0E14] text-[#64748B] dark:text-[#94A3B8] flex flex-col flex-shrink-0 h-screen border-r border-[#E2E8F0] dark:border-[#262930] select-none transform transition-transform duration-150 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#E2E8F0] dark:border-[#2A303C] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setActiveTab('overview');
              closeSidebar();
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-85 transition-opacity"
            title="DevPulse Overview Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0A1128] dark:bg-[#1C1E24] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-sm">
              <Activity className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">DevPulse</span>
                <span className="text-[10px] font-mono px-1 rounded bg-[#D4AF37]/15 text-[#0A1128] dark:text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                  v1.4
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">CI/CD Pipeline Monitoring</p>
            </div>
          </button>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={closeSidebar}
            className="p-1 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] dark:text-[#64748B]">
              Core Views
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      setActiveTab(item.id);
                    }
                    closeSidebar();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FAF8F5] dark:bg-[#1E232E] text-[#0F172A] dark:text-[#F8FAFC] font-semibold border border-[#D4AF37]/40 shadow-sm'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#FAF8F5] dark:hover:bg-[#181C24]/70 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      active ? 'text-[#D4AF37]' : 'text-[#64748B] dark:text-[#94A3B8]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        active
                          ? 'bg-[#D4AF37]/20 text-[#0A1128] dark:text-[#D4AF37] border border-[#D4AF37]/40'
                          : 'bg-[#FAF8F5] dark:bg-[#1E232E] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#2A303C]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* AI Companion Section */}
          <div className="space-y-1 pt-1">
            <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] dark:text-[#64748B]">
              AI Companion
            </div>
            <button
              type="button"
              onClick={() => {
                toggleAiCopilot();
                closeSidebar();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                isAiCopilotOpen
                  ? 'bg-[#181C24] text-[#D4AF37] border-[#D4AF37]/60 shadow-sm'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border-transparent hover:border-[#E2E8F0] dark:hover:border-[#2A303C]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="truncate">DevPulse Copilot</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          </div>
        </nav>

        {/* Bottom Docker Health & Engine Status */}
        <div className="p-3 border-t border-[#E2E8F0] dark:border-[#2A303C] space-y-2 bg-[#FAF8F5] dark:bg-[#0B0E14]">
          <DockerContainersWidget compact={true} />

          <div className="px-2.5 py-2 rounded-lg bg-white dark:bg-[#181C24] border border-[#E2E8F0] dark:border-[#2A303C] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">DevPulse Engine</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-semibold font-mono">Build • Test • Deploy</span>
          </div>
        </div>
      </aside>
    </>
  );
}
