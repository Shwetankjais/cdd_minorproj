import React, { useState, useRef, useEffect } from 'react';
import {
  FolderGit2,
  ChevronDown,
  GitCommit,
  Bell,
  Sun,
  Moon,
  Play,
  RotateCcw,
  Check,
  Clock,
  Sparkles,
  Menu,
  Github,
  LogOut,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function Header() {
  const {
    isDark,
    toggleTheme,
    toggleSidebar,
    projects,
    activeProject,
    setActiveProject,
    toggleGitDrawer,
    isSimulating,
    simPercent,
    startSimulation,
    resetSimulation,
    notifications,
    setNotifications,
    user,
    logout,
    toggleGithubConnection,
    isAiCopilotOpen,
    toggleAiCopilot,
    activeTab,
  } = useThemeAndProject();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const projectRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (projectRef.current && !projectRef.current.contains(e.target)) {
        setProjectDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case 'overview':
      case 'dashboard':
        return 'Overview';
      case 'workspaces':
      case 'projects':
        return 'Workspaces';
      case 'runs':
      case 'pipelines':
      case 'history':
        return 'Pipeline Runs';
      case 'diagnostics':
      case 'tests':
      case 'errors':
        return 'Diagnostics & Tests';
      case 'analytics':
        return 'Analytics';
      case 'deployments':
        return 'Deployments & Docker';
      case 'source-control':
        return 'Source Control';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="px-4 py-2.5 sm:px-5 bg-white dark:bg-[#0B0E14] border-b border-[#E2E8F0] dark:border-[#262930] flex-shrink-0 z-30 transition-colors duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Clean Linear/GitHub Breadcrumb */}
        <div className="flex items-center gap-2.5">
          {/* Hamburger toggle button for <1024px */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#FAF8F5] dark:hover:bg-[#14171F] lg:hidden border border-[#E2E8F0] dark:border-[#262930] bg-white dark:bg-[#14171F] transition-colors"
            aria-label="Toggle navigation sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                {activeProject?.displayName || 'cdd_minorproj'}
              </span>
              <span className="text-[#94A3B8] dark:text-[#64748B] text-xs">/</span>
              <h1 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                {getTabLabel(activeTab)}
              </h1>

              {isSimulating && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                  simulating ({simPercent}%)
                </span>
              )}

              {user?.githubConnected === false && (
                <button
                  onClick={toggleGithubConnection}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30 hover:bg-[#E63946]/20 transition-colors"
                  title="Click to reconnect GitHub"
                >
                  <AlertCircle className="w-3 h-3" />
                  github disconnected
                </button>
              )}
            </div>
            <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              branch: main • telemetry: active • runner: v1.4.0
            </p>
          </div>
        </div>

        {/* Right: Controls & Switchers */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Live Pipeline Simulation Trigger Button */}
          {!isSimulating ? (
            <button
              onClick={startSimulation}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#D4AF37] hover:bg-[#C5A059] text-[#0A1128] transition-all"
              title="Simulate 0% -> 100% pipeline run"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Simulate Run</span>
            </button>
          ) : (
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#FAF8F5] dark:bg-[#14171F] hover:bg-[#E2E8F0] dark:hover:bg-[#1A1E29] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#262930] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Quick 1-Click Source Control Drawer Button */}
          <button
            onClick={toggleGitDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-[#E2E8F0] dark:border-[#262930] bg-white dark:bg-[#14171F] hover:bg-[#FAF8F5] dark:hover:bg-[#1A1E29] text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
            title="Open 1-Click Git Drawer"
          >
            <GitCommit className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">1-Click Git</span>
            <span className="font-mono text-[10px] px-1 rounded bg-[#D4AF37]/15 text-[#0A1128] dark:text-[#D4AF37] border border-[#D4AF37]/30">
              5
            </span>
          </button>

          {/* AI Copilot Toggle Button */}
          <button
            onClick={toggleAiCopilot}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              isAiCopilotOpen
                ? 'bg-[#14171F] text-[#D4AF37] border-[#D4AF37]'
                : 'bg-white dark:bg-[#14171F] border-[#E2E8F0] dark:border-[#262930] hover:border-[#D4AF37]/50 text-[#0F172A] dark:text-[#F8FAFC]'
            }`}
            title="Toggle DevPulse Copilot"
            aria-label="Toggle DevPulse Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Copilot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </button>

          {/* Project Selection Dropdown */}
          <div className="relative" ref={projectRef}>
            <button
              onClick={() => setProjectDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-[#E2E8F0] dark:border-[#262930] bg-white dark:bg-[#14171F] hover:bg-[#FAF8F5] dark:hover:bg-[#1A1E29] text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
              <span className="max-w-[120px] truncate font-mono">
                {activeProject?.displayName || 'Project'}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-[#64748B] dark:text-[#94A3B8] transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {projectDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-[#14171F] rounded-md border border-[#E2E8F0] dark:border-[#262930] py-1 shadow-lg z-50">
                <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  Select Repository
                </div>
                {projects.map((proj) => {
                  const isSelected = proj.id === activeProject.id;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setActiveProject(proj);
                        setProjectDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#FAF8F5] dark:bg-[#1A1E29] text-[#0A1128] dark:text-[#D4AF37] font-semibold border-l-2 border-[#D4AF37]'
                          : 'hover:bg-[#FAF8F5] dark:hover:bg-[#1A1E29] text-[#0F172A] dark:text-[#F8FAFC]'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <p className="font-mono truncate">{proj.displayName}</p>
                        <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal tabular-nums">
                          {proj.passRate}% passing • {proj.lastAuthor}
                        </p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 text-[#D4AF37]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Role Handoff Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifDropdownOpen((prev) => !prev)}
              className="relative p-1.5 rounded-md border border-[#E2E8F0] dark:border-[#262930] bg-white dark:bg-[#14171F] hover:bg-[#FAF8F5] dark:hover:bg-[#1A1E29] text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
              title="Role Handoff Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E63946] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-[#14171F] rounded-md border border-[#E2E8F0] dark:border-[#262930] p-2 shadow-lg z-50">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#E2E8F0] dark:border-[#262930] px-1">
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                    Handoff Alerts
                  </span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-[#D4AF37] hover:underline font-mono">
                      Mark read
                    </button>
                  )}
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-md text-xs transition-colors ${
                        !n.read
                          ? 'bg-[#FAF8F5] dark:bg-[#1A1E29] border border-[#D4AF37]/30'
                          : 'bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-0.5">
                        <span className="text-[11px]">{n.title}</span>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-tight">{n.message}</p>
                      <div className="mt-1 text-[10px] font-mono text-[#B45309] dark:text-[#F59E0B]">
                        Target: {n.team}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md border border-[#E2E8F0] dark:border-[#262930] bg-white dark:bg-[#14171F] hover:bg-[#FAF8F5] dark:hover:bg-[#1A1E29] text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#D4AF37]" />
            ) : (
              <Moon className="w-4 h-4 text-[#0A1128]" />
            )}
          </button>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              className="w-7 h-7 rounded-md bg-[#0A1128] dark:bg-[#14171F] text-[#D4AF37] font-mono font-bold text-xs flex items-center justify-center border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all cursor-pointer"
              title={`${user?.name || 'Developer'} (${user?.role || 'Developer'})`}
              aria-label="User profile menu"
            >
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'DP'}
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-[#14171F] rounded-md border border-[#E2E8F0] dark:border-[#262930] p-3 shadow-lg z-50">
                <div className="pb-2.5 border-b border-[#E2E8F0] dark:border-[#262930]">
                  <p className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    {user?.name || 'Shwetank Jaiswal'}
                  </p>
                  <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate">
                    {user?.email || 'shwetank@devpulse.io'}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#0A1128] dark:text-[#D4AF37] border border-[#D4AF37]/30">
                    {user?.role || 'Developer'}
                  </span>
                </div>

                {/* GitHub Connection Info */}
                <div className="py-2 space-y-1.5 border-b border-[#E2E8F0] dark:border-[#262930]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                      <Github className="w-3 h-3 text-[#0F172A] dark:text-[#F8FAFC]" />
                      GitHub:
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1 rounded ${
                        user?.githubConnected
                          ? 'text-emerald-500 bg-emerald-500/10'
                          : 'text-[#E63946] bg-[#E63946]/10'
                      }`}
                    >
                      {user?.githubConnected ? 'connected' : 'disconnected'}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#0F172A] dark:text-[#F8FAFC] truncate bg-[#FAF8F5] dark:bg-[#0B0E14] p-1 rounded border border-[#E2E8F0] dark:border-[#262930]">
                    {user?.githubRepo || 'Shwetankjais/cdd_minorproj'}
                  </p>
                  <button
                    onClick={toggleGithubConnection}
                    className="w-full text-center text-[10px] font-mono text-[#D4AF37] hover:underline"
                  >
                    {user?.githubConnected ? 'simulate disconnect' : 'reconnect github'}
                  </button>
                </div>

                {/* Logout Action */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#E63946] hover:bg-[#E63946]/10 border border-[#E63946]/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch User / Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
