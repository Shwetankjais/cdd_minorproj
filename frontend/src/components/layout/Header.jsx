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
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function Header() {
  const {
    isDark,
    toggleTheme,
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
  } = useThemeAndProject();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const projectRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (projectRef.current && !projectRef.current.contains(e.target)) {
        setProjectDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
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
    <header className="px-6 py-4 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Dashboard Title & Subheading */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome to DevPulse 👋
            </h1>
            {isSimulating && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Simulating Live ({simPercent}%)
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time CI/CD pipeline monitoring across your projects
          </p>
        </div>

        {/* Right: Controls & Switchers */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Live Pipeline Simulation Trigger Button */}
          {!isSimulating ? (
            <button
              onClick={startSimulation}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sm transition-all"
              title="Simulate 0% -> 100% pipeline run with pre-notification role handoffs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Live Run</span>
            </button>
          ) : (
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Quick 1-Click Source Control Drawer Button */}
          <button
            onClick={toggleGitDrawer}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
            title="Open 1-Click Git Drawer"
          >
            <GitCommit className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">1-Click Git</span>
            <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-[10px] flex items-center justify-center">
              5
            </span>
          </button>

          {/* Project Selection Dropdown (#8) */}
          <div className="relative" ref={projectRef}>
            <button
              onClick={() => setProjectDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors shadow-sm"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="max-w-[140px] truncate font-mono font-medium">
                {activeProject?.displayName || 'Project'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {projectDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <p className="font-mono truncate">{proj.displayName}</p>
                        <p className="text-[10px] text-slate-400 font-normal">
                          {proj.passRate}% passing • {proj.lastAuthor}
                        </p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 text-sky-500" />}
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
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Role Handoff Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700 px-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Role Handoff Alerts
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-sky-500 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-lg text-xs transition-colors ${
                        !n.read
                          ? 'bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40'
                          : 'bg-slate-50 dark:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{n.message}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
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
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600 transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-700 text-white font-bold text-xs flex items-center justify-center shadow-sm ring-2 ring-slate-200 dark:ring-slate-700">
            DP
          </div>
        </div>
      </div>
    </header>
  );
}
