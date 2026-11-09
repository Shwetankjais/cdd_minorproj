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
  User,
  ShieldCheck,
  AlertCircle,
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

  return (
    <header className="px-4 sm:px-6 py-4 bg-[#FAF8F5]/90 dark:bg-[#0A1128]/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#323742] sticky top-0 z-30 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Hamburger (mobile/split-screen) + Dashboard Title & Subheading */}
        <div className="flex items-center gap-3">
          {/* Hamburger toggle button for <1024px */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#E2E8F0]/70 dark:hover:bg-[#1C1E24] lg:hidden border border-[#E2E8F0] dark:border-[#323742] bg-white dark:bg-[#1C1E24] transition-colors"
            aria-label="Toggle navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Welcome to DevPulse 👋
              </h1>
              {isSimulating && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                  Simulating Live ({simPercent}%)
                </span>
              )}
              {user?.githubConnected === false && (
                <button
                  onClick={toggleGithubConnection}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30 hover:bg-[#E63946]/20 transition-colors"
                  title="Click to reconnect GitHub"
                >
                  <AlertCircle className="w-3 h-3" />
                  GitHub Disconnected
                </button>
              )}
            </div>
            <p className="text-xs md:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Real-time CI/CD pipeline monitoring across your projects
            </p>
          </div>
        </div>

        {/* Right: Controls & Switchers */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Live Pipeline Simulation Trigger Button */}
          {!isSimulating ? (
            <button
              onClick={startSimulation}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] hover:bg-[#C5A059] text-[#0A1128] shadow-sm transition-all"
              title="Simulate 0% -> 100% pipeline run with pre-notification role handoffs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Live Run</span>
            </button>
          ) : (
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E2E8F0] dark:bg-[#23272F] hover:bg-[#CBD5E1] dark:hover:bg-[#323742] text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Quick 1-Click Source Control Drawer Button */}
          <button
            onClick={toggleGitDrawer}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E2E8F0] dark:border-[#323742] bg-white dark:bg-[#1C1E24] hover:bg-[#FAF8F5] dark:hover:bg-[#23272F] text-[#0F172A] dark:text-[#F8FAFC] transition-colors shadow-sm"
            title="Open 1-Click Git Drawer"
          >
            <GitCommit className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">1-Click Git</span>
            <span className="w-5 h-5 rounded-full bg-[#D4AF37]/15 text-[#0A1128] dark:text-[#D4AF37] font-bold text-[10px] flex items-center justify-center border border-[#D4AF37]/30">
              5
            </span>
          </button>

          {/* AI Copilot Toggle Button (Screenshot 3 integration) */}
          <button
            onClick={toggleAiCopilot}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
              isAiCopilotOpen
                ? 'bg-[#1C1E24] text-[#D4AF37] border-[#D4AF37] ring-1 ring-[#D4AF37]'
                : 'bg-white dark:bg-[#1C1E24] border-[#E2E8F0] dark:border-[#323742] hover:border-[#D4AF37]/60 text-[#0F172A] dark:text-[#F8FAFC]'
            }`}
            title="Toggle DevPulse Copilot"
            aria-label="Toggle DevPulse Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Copilot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          {/* Project Selection Dropdown (#8) */}
          <div className="relative" ref={projectRef}>
            <button
              onClick={() => setProjectDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E2E8F0] dark:border-[#323742] bg-white dark:bg-[#1C1E24] hover:bg-[#FAF8F5] dark:hover:bg-[#23272F] text-[#0F172A] dark:text-[#F8FAFC] transition-colors shadow-sm"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
              <span className="max-w-[140px] truncate font-mono font-medium">
                {activeProject?.displayName || 'Project'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8] transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {projectDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#23272F] rounded-xl shadow-xl border border-[#E2E8F0] dark:border-[#323742] py-1.5 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  Select Project / Repo
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
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#FAF8F5] dark:bg-[#1C1E24] text-[#0A1128] dark:text-[#D4AF37] font-semibold border-l-2 border-[#D4AF37]'
                          : 'hover:bg-[#FAF8F5] dark:hover:bg-[#1C1E24]/70 text-[#0F172A] dark:text-[#F8FAFC]'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <p className="font-mono truncate">{proj.displayName}</p>
                        <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal">
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
              className="relative p-2 rounded-lg border border-[#E2E8F0] dark:border-[#323742] bg-white dark:bg-[#1C1E24] hover:bg-[#FAF8F5] dark:hover:bg-[#23272F] text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
              title="Role Handoff Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E63946] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#23272F] rounded-xl shadow-xl border border-[#E2E8F0] dark:border-[#323742] p-2 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0] dark:border-[#323742] px-2">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                    Role Handoff Alerts
                  </span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[11px] text-[#D4AF37] hover:underline font-medium">
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs transition-colors ${
                        !n.read
                          ? 'bg-[#FAF8F5] dark:bg-[#1C1E24] border border-[#D4AF37]/30 shadow-sm'
                          : 'bg-white dark:bg-[#1C1E24]/40 border border-[#E2E8F0]/50 dark:border-[#323742]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-0.5">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{n.message}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#B45309] dark:text-[#F59E0B]">
                        <Clock className="w-3 h-3" />
                        <span>Target: {n.team}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle (#10) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[#E2E8F0] dark:border-[#323742] bg-white dark:bg-[#1C1E24] hover:bg-[#FAF8F5] dark:hover:bg-[#23272F] text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#D4AF37] transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-[#0A1128] transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              className="w-8 h-8 rounded-full bg-[#0A1128] text-[#D4AF37] font-bold text-xs flex items-center justify-center shadow-sm ring-2 ring-[#D4AF37]/40 hover:ring-[#D4AF37] transition-all cursor-pointer"
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
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#23272F] rounded-xl shadow-xl border border-[#E2E8F0] dark:border-[#323742] p-3 z-50">
                <div className="flex items-center gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#323742]">
                  <div className="w-10 h-10 rounded-full bg-[#0A1128] text-[#D4AF37] font-bold text-sm flex items-center justify-center ring-2 ring-[#D4AF37]/40">
                    {user?.name
                      ? user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'DP'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] truncate">
                      {user?.name || 'Shwetank Jaiswal'}
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">
                      {user?.email || 'shwetank@devpulse.io'}
                    </p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#0A1128] dark:text-[#D4AF37] font-semibold border border-[#D4AF37]/30">
                      {user?.role || 'Developer'}
                    </span>
                  </div>
                </div>

                {/* GitHub Connection Info */}
                <div className="py-2.5 space-y-2 border-b border-[#E2E8F0] dark:border-[#323742]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-[#0F172A] dark:text-[#F8FAFC]" />
                      GitHub Repo:
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        user?.githubConnected
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-[#E63946]/10 text-[#E63946]'
                      }`}
                    >
                      {user?.githubConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[#0F172A] dark:text-[#F8FAFC] truncate bg-[#FAF8F5] dark:bg-[#1C1E24] p-1.5 rounded border border-[#E2E8F0] dark:border-[#323742]">
                    {user?.githubRepo || 'Shwetankjais/cdd_minorproj'}
                  </p>
                  <button
                    onClick={toggleGithubConnection}
                    className="w-full text-center text-[11px] text-[#D4AF37] hover:underline font-medium"
                  >
                    {user?.githubConnected ? 'Simulate Disconnect' : 'Reconnect to GitHub'}
                  </button>
                </div>

                {/* Logout Action */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#E63946] hover:bg-[#E63946]/10 border border-[#E63946]/20 transition-colors"
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
