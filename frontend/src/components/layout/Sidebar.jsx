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
        <div className="p-3.5 border-b border-[#E2E8F0] dark:border-[#262930] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0A1128] dark:bg-[#14171F] border border-[#262930] flex items-center justify-center text-[#D4AF37]">
              <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">DevPulse</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded border border-[#E2E8F0] dark:border-[#262930] text-[#64748B] dark:text-[#94A3B8]">
                v1.4
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={closeSidebar}
            className="p-1 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links (Linear/Vercel Style) */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
          <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] dark:text-[#64748B]">
            Navigation
          </div>

          {navItems.map((item) => {
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
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#FAF8F5] dark:bg-[#14171F] text-[#0F172A] dark:text-[#F8FAFC] font-semibold border border-[#E2E8F0] dark:border-[#262930]'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#FAF8F5] dark:hover:bg-[#14171F]/50'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                    active ? 'text-[#D4AF37]' : 'text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      active
                        ? 'bg-[#D4AF37]/15 text-[#0A1128] dark:text-[#D4AF37] border border-[#D4AF37]/30'
                        : 'bg-[#FAF8F5] dark:bg-[#14171F] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#262930]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* AI Copilot Item */}
          <div className="pt-2">
            <button
              onClick={() => {
                toggleAiCopilot();
                closeSidebar();
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                isAiCopilotOpen
                  ? 'bg-[#14171F] text-[#D4AF37] border-[#D4AF37]/50'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border-transparent hover:border-[#E2E8F0] dark:hover:border-[#262930]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="truncate">Copilot</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>
          </div>
        </nav>

        {/* Bottom Docker Health & Engine Status */}
        <div className="p-2.5 border-t border-[#E2E8F0] dark:border-[#262930] space-y-2 bg-[#FAF8F5] dark:bg-[#0B0E14]">
          <DockerContainersWidget compact={true} />

          <div className="px-2 py-1.5 rounded-md bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">telemetry stream</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-500 font-medium">online</span>
          </div>
        </div>
      </aside>
    </>
  );
}
