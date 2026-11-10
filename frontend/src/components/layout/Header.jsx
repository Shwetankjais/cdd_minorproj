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
    <header className="px-4 py-3 sm:px-6 bg-white dark:bg-[#0B0E14] border-b border-[#E2E8F0] dark:border-[#2A303C] flex-shrink-0 z-30 transition-colors duration-150">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Warm Welcome Header & Project Subtitle (Screenshot 2 Styling) */}
        <div className="flex items-center gap-3">
          {/* Hamburger toggle button for <1024px */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#FAF8F5] dark:hover:bg-[#181C24] lg:hidden border border-[#E2E8F0] dark:border-[#2A303C] bg-white dark:bg-[#181C24] transition-colors"
            aria-label="Toggle navigation sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight flex items-center gap-1.5 font-sans">
                <span>Welcome to DevPulse</span>
                <span>👋</span>
              </h1>
              {activeTab !== 'overview' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-[#1E232E] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#2A303C]">
                  {getTabLabel(activeTab)}
                </span>
              )}
              {isSimulating && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
                  simulating ({simPercent}%)
                </span>
              )}
              {user?.githubConnected === false && (
                <button
                  onClick={toggleGithubConnection}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30 hover:bg-[#E63946]/20 transition-colors font-sans"
                  title="Click to reconnect GitHub"
                >
                  <AlertCircle className="w-3 h-3" />
                  github disconnected
                </button>
              )}
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 flex items-center gap-1.5 font-sans">
              <span>Real-time CI/CD pipeline monitoring across your projects</span>
              <span className="hidden xl:inline text-[#94A3B8] dark:text-[#64748B]">•</span>
              <span className="hidden xl:inline text-[11px] text-[#94A3B8] dark:text-[#64748B] font-mono">
                {activeProject?.displayName || 'cdd_minorproj'}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Controls & Switchers */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          {/* Live Pipeline Simulation Trigger Button */}
          {!isSimulating ? (
            <button
              onClick={startSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D4AF37] hover:bg-[#C5A059] text-[#0A1128] shadow-sm transition-all font-sans cursor-pointer"
              title="Simulate 0% -> 100% pipeline run"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Simulate Live Run</span>
            </button>
          ) : (
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FAF8F5] dark:bg-[#181C24] hover:bg-[#E2E8F0] dark:hover:bg-[#1E232E] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#2A303C] transition-colors font-sans cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Quick 1-Click Source Control Drawer Button */}
          <button
            onClick={toggleGitDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E2E8F0] dark:border-[#2A303C] bg-white dark:bg-[#181C24] hover:bg-[#FAF8F5] dark:hover:bg-[#1E232E] text-[#0F172A] dark:text-[#F8FAFC] transition-colors shadow-sm font-sans cursor-pointer"
            title="Open 1-Click Git Drawer"
          >
            <GitCommit className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">1-Click Git</span>
            <span className="text-[10px] px-1 rounded bg-[#D4AF37]/15 text-[#0A1128] dark:text-[#D4AF37] border border-[#D4AF37]/30 font-semibold font-mono">
              5
            </span>
          </button>

          {/* AI Copilot Toggle Button */}
          <button
            onClick={toggleAiCopilot}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-sm font-sans cursor-pointer ${
              isAiCopilotOpen
                ? 'bg-[#181C24] text-[#D4AF37] border-[#D4AF37]'
                : 'bg-white dark:bg-[#181C24] border-[#E2E8F0] dark:border-[#2A303C] hover:border-[#D4AF37]/50 text-[#0F172A] dark:text-[#F8FAFC]'
            }`}
            title="Toggle DevPulse Copilot"
            aria-label="Toggle DevPulse Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Copilot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          {/* Project Selection Dropdown */}
          <div className="relative" ref={projectRef}>
            <button
              onClick={() => setProjectDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E2E8F0] dark:border-[#2A303C] bg-white dark:bg-[#181C24] hover:bg-[#FAF8F5] dark:hover:bg-[#1E232E] text-[#0F172A] dark:text-[#F8FAFC] transition-colors shadow-sm font-sans cursor-pointer"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="max-w-[130px] truncate font-medium">
                {activeProject?.displayName || 'cdd_minorproj'}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-[#64748B] dark:text-[#94A3B8] transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {projectDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#181C24] rounded-xl border border-[#E2E8F0] dark:border-[#2A303C] py-1.5 shadow-xl shadow-black/40 z-50">
                <div className="px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  Select Repository
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#E2E8F0]/40 dark:divide-[#2A303C]/60">
                  {projects.length === 0 ? (
                    <div className="px-3.5 py-3 text-center text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      No repositories linked yet.
                    </div>
                  ) : (
                    projects.map((proj) => {
                      const isSelected = activeProject && (proj.id === activeProject.id || proj.displayName === activeProject.displayName);
                      const authorName = (!proj.lastAuthor || proj.lastAuthor === 'Unavailable') ? (user?.name || user?.github_username || 'Developer') : proj.lastAuthor;
                      return (
                        <button
                          key={proj.id || proj.displayName}
                          onClick={() => {
                            setActiveProject(proj);
                            setProjectDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-[#FAF8F5] dark:bg-[#1E232E] text-[#0A1128] dark:text-[#D4AF37] font-semibold border-l-2 border-[#D4AF37]'
                              : 'hover:bg-[#FAF8F5] dark:hover:bg-[#1E232E]/60 text-[#0F172A] dark:text-[#F8FAFC]'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <p className="font-semibold text-xs truncate text-[#0F172A] dark:text-[#F8FAFC]">
                              {proj.displayName}
                            </p>
                            <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5">
                              {proj.passRate}% passing • {authorName}
                            </p>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 text-[#D4AF37]" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Handoff Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifDropdownOpen((prev) => !prev)}
              className="relative p-2 rounded-lg border border-[#E2E8F0] dark:border-[#2A303C] bg-white dark:bg-[#181C24] hover:bg-[#FAF8F5] dark:hover:bg-[#1E232E] text-[#0F172A] dark:text-[#F8FAFC] transition-colors shadow-sm cursor-pointer"
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
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#181C24] rounded-xl border border-[#E2E8F0] dark:border-[#2A303C] p-3 shadow-xl shadow-black/40 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0] dark:border-[#2A303C] px-1">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5 font-sans">
                    Handoff Alerts
                  </span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-[#D4AF37] hover:underline font-sans font-semibold cursor-pointer">
                      Mark read
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs transition-colors ${
                        !n.read
                          ? 'bg-[#FAF8F5] dark:bg-[#1E232E] border border-[#D4AF37]/40 shadow-sm'
                          : 'bg-white dark:bg-[#181C24] border border-[#E2E8F0] dark:border-[#2A303C]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-0.5 font-sans">
                        <span className="text-xs">{n.title}</span>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-tight font-sans">{n.message}</p>
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
            className="p-2 rounded-lg border border-[#E2E8F0] dark:border-[#2A303C] bg-white dark:bg-[#181C24] hover:bg-[#FAF8F5] dark:hover:bg-[#1E232E] text-[#0F172A] dark:text-[#F8FAFC] transition-colors shadow-sm cursor-pointer"
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
              className="w-8 h-8 rounded-lg bg-[#0A1128] dark:bg-[#1E232E] text-[#D4AF37] font-sans font-bold text-xs flex items-center justify-center border border-[#D4AF37]/50 hover:border-[#D4AF37] shadow-sm transition-all cursor-pointer overflow-hidden"
              title={`${user?.name || user?.github_username || 'Developer'} (${user?.role || 'Developer'})`}
              aria-label="User profile menu"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user?.name || user?.github_username}
                  className="w-full h-full object-cover"
                />
              ) : user?.name ? (
                user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              ) : (
                'DP'
              )}
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#181C24] rounded-xl border border-[#E2E8F0] dark:border-[#2A303C] p-3.5 shadow-xl shadow-black/40 z-50">
                <div className="pb-3 border-b border-[#E2E8F0] dark:border-[#2A303C]">
                  <div className="flex items-center gap-2 mb-1.5">
                    {user?.avatar_url && (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-7 h-7 rounded-md object-cover border border-[#D4AF37]/40"
                      />
                    )}
                    <div className="truncate">
                      <p className="font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC] truncate font-sans">
                        {user?.name || user?.github_username || 'Developer'}
                      </p>
                      {user?.github_username && (
                        <p className="text-[10px] font-mono text-[#D4AF37] truncate">
                          @{user.github_username}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate">
                    {user?.email || `${user?.github_username || 'developer'}@devpulse.io`}
                  </p>
                  <span className="inline-block mt-1.5 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#0A1128] dark:text-[#D4AF37] border border-[#D4AF37]/30">
                    {user?.role || 'Developer'}
                  </span>
                </div>

                {/* GitHub Connection Info */}
                <div className="py-2.5 space-y-2 border-b border-[#E2E8F0] dark:border-[#2A303C]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 font-sans">
                      <Github className="w-3.5 h-3.5 text-[#0F172A] dark:text-[#F8FAFC]" />
                      GitHub:
                    </span>
                    <span
                      className={`text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded-full ${
                        user?.githubConnected
                          ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                          : 'text-[#E63946] bg-[#E63946]/10 border border-[#E63946]/20'
                      }`}
                    >
                      {user?.githubConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#0F172A] dark:text-[#F8FAFC] truncate bg-[#FAF8F5] dark:bg-[#0B0E14] p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#2A303C]">
                    {user?.githubRepo || (user?.github_username ? `${user.github_username}/cdd_minorproj` : 'github/repo')}
                  </p>
                  <button
                    onClick={toggleGithubConnection}
                    className="w-full text-center text-[10px] font-sans font-semibold text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    {user?.githubConnected ? 'Simulate Disconnect' : 'Reconnect GitHub'}
                  </button>
                </div>

                {/* Logout Action */}
                <div className="pt-2.5">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold text-[#E63946] hover:bg-[#E63946]/10 border border-[#E63946]/25 transition-colors cursor-pointer"
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
