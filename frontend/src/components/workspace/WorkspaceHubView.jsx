import React, { useState } from 'react';
import {
  FolderOpen,
  Copy,
  FolderGit2,
  GitBranch,
  Github,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Plus,
  X,
  Loader2,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function WorkspaceHubView() {
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    openWorkspace,
    cloneWorkspace,
    setActiveTab,
    user,
    toggleGithubConnection,
  } = useThemeAndProject();

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [folderPath, setFolderPath] = useState('~/Desktop/cdd_minor');
  const [cloneUrl, setCloneUrl] = useState('https://github.com/Shwetankjais/cdd_minorproj.git');
  const [cloneBranch, setCloneBranch] = useState('main');
  const [clonePath, setClonePath] = useState('~/workspace/cdd_minorproj');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [showAllWorkspaces, setShowAllWorkspaces] = useState(false);

  const handleOpenFolderSubmit = async (e) => {
    e.preventDefault();
    if (!folderPath.trim()) return;
    setIsProcessing(true);
    try {
      const res = await openWorkspace(folderPath);
      setFeedbackMsg({
        type: 'success',
        text: res?.message || `Opened workspace folder at ${folderPath}`,
      });
      setShowOpenModal(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to open workspace path.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloneRepoSubmit = async (e) => {
    e.preventDefault();
    if (!cloneUrl.trim()) return;
    setIsProcessing(true);
    try {
      const res = await cloneWorkspace({
        repo_url: cloneUrl,
        branch: cloneBranch,
        path: clonePath,
      });
      setFeedbackMsg({
        type: 'success',
        text: res?.message || `Cloned ${cloneUrl} on branch ${cloneBranch}`,
      });
      setShowCloneModal(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to clone repository.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectWorkspace = (w) => {
    setActiveWorkspace(w);
    // Switch directly to overview dashboard
    setActiveTab('overview');
  };

  const displayedWorkspaces = showAllWorkspaces ? workspaces : workspaces.slice(0, 3);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Top Header with Antigravity / DevPulse Emblem (Screenshot 3 style) */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0A1128] dark:bg-[#1C1E24] border-2 border-[#D4AF37]/50 shadow-xl shadow-[#D4AF37]/10 mb-2">
          {/* Antigravity Lambda / Infinity Emblem */}
          <svg className="w-8 h-8 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 22h5l5-10 5 10h5L12 2z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          DevPulse Collaborative Workspace Hub
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-lg mx-auto">
          Open local directories, clone team repositories, and launch synchronized CI/CD monitoring for multi-person engineering teams.
        </p>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-pulse ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
              : 'bg-[#E63946]/10 border-[#E63946]/40 text-[#E63946]'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Two Prominent Action Buttons (Screenshots 2 & 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        {/* Open Folder Button */}
        <button
          onClick={() => setShowOpenModal(true)}
          className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#0A1128] text-white hover:bg-[#142238] dark:bg-[#1C1E24] dark:hover:bg-[#23272F] border-2 border-[#D4AF37]/60 shadow-lg hover:shadow-xl transition-all group cursor-pointer"
        >
          <FolderOpen className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm tracking-wide">Open Folder</span>
        </button>

        {/* Clone Repository Button */}
        <button
          onClick={() => setShowCloneModal(true)}
          className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white dark:bg-[#1C1E24] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#FAF8F5] dark:hover:bg-[#23272F] border-2 border-[#E2E8F0] dark:border-[#323742] hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all group cursor-pointer"
        >
          <Copy className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#D4AF37] group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm tracking-wide">Clone Repository</span>
        </button>
      </div>

      {/* Workspaces List (Screenshot 3 layout) */}
      <div className="max-w-xl mx-auto space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Workspaces ({workspaces.length})
          </span>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Click any workspace to open in pipeline
          </span>
        </div>

        <div className="space-y-2">
          {displayedWorkspaces.map((w) => {
            const isSelected = activeWorkspace?.id === w.id;
            return (
              <div
                key={w.id}
                onClick={() => handleSelectWorkspace(w)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-[#23272F] border-[#D4AF37] ring-1 ring-[#D4AF37] shadow-warm-sm'
                    : 'bg-white dark:bg-[#1C1E24] border-[#E2E8F0] dark:border-[#323742] hover:border-[#D4AF37]/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#0A1128]/5 dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#323742] text-[#0A1128] dark:text-[#D4AF37] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h4 className="font-mono font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] truncate">
                        {w.name}
                      </h4>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                      {w.path}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-3">
                  <div className="flex items-center gap-1 text-xs justify-end">
                    <span className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {w.branch}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
                  </div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {w.passRate}% pass • {w.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {workspaces.length > 3 && (
          <div className="text-center pt-1">
            <button
              onClick={() => setShowAllWorkspaces((prev) => !prev)}
              className="text-xs font-semibold text-[#0A1128] dark:text-[#D4AF37] hover:underline cursor-pointer"
            >
              {showAllWorkspaces ? 'Show Less' : `Show More (${workspaces.length - 3} more)...`}
            </button>
          </div>
        )}
      </div>

      {/* GitHub Account & Connection Status Card */}
      <div className="max-w-xl mx-auto p-5 rounded-2xl bg-white dark:bg-[#1C1E24] border border-[#E2E8F0] dark:border-[#323742] shadow-warm-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#2D3748]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0A1128] text-white">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]">GitHub Integration Status</h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Live connection for pull requests and Actions</p>
            </div>
          </div>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
              user?.githubConnected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${user?.githubConnected ? 'bg-emerald-500' : 'bg-[#E63946]'}`}
            ></span>
            {user?.githubConnected ? 'Connected [OK]' : 'Disconnected'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#323742]">
            <p className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">Current User</p>
            <p className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate mt-0.5">{user?.name || 'Shwetank Jaiswal'}</p>
            <p className="text-[10px] text-[#D4AF37] font-semibold mt-0.5">{user?.role || 'Developer'}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#323742]">
            <p className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">Linked Repo</p>
            <p className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate mt-0.5">{user?.githubRepo || 'Shwetankjais/cdd_minorproj'}</p>
            <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">Webhook Active</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <button
            onClick={toggleGithubConnection}
            className="text-xs font-semibold text-[#0A1128] dark:text-[#D4AF37] hover:underline"
          >
            {user?.githubConnected ? 'Toggle Disconnect (Test Mode)' : 'Reconnect GitHub Account'}
          </button>
          <a
            href={`https://github.com/${user?.githubRepo || 'Shwetankjais/cdd_minorproj'}`}
            target="_blank"
            rel="noreferrer"
            className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] flex items-center gap-1 text-[11px]"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Open Folder Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 bg-[#070D1F]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1E24] border border-[#E2E8F0] dark:border-[#323742] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#2D3748]">
              <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#D4AF37]" />
                Open Local Workspace Folder
              </h3>
              <button
                onClick={() => setShowOpenModal(false)}
                className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOpenFolderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Directory Path
                </label>
                <input
                  type="text"
                  required
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  placeholder="/workspace/project or ~/Desktop/cdd_minor"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#323742] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 outline-none"
                />
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Enter an absolute or relative directory path containing a Git repository.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#FAF8F5] dark:hover:bg-[#23272F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#C5A059] text-[#0A1128] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/20"
                >
                  {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Open Workspace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clone Repository Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 bg-[#070D1F]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1E24] border border-[#E2E8F0] dark:border-[#323742] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#2D3748]">
              <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                <Copy className="w-4 h-4 text-[#D4AF37]" />
                Clone Repository & Join Pipeline
              </h3>
              <button
                onClick={() => setShowCloneModal(false)}
                className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCloneRepoSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Repository HTTPS URL
                </label>
                <input
                  type="url"
                  required
                  value={cloneUrl}
                  onChange={(e) => setCloneUrl(e.target.value)}
                  placeholder="https://github.com/org/repo.git"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#323742] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Initial Branch
                  </label>
                  <input
                    type="text"
                    value={cloneBranch}
                    onChange={(e) => setCloneBranch(e.target.value)}
                    placeholder="main"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#323742] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Destination Directory
                  </label>
                  <input
                    type="text"
                    value={clonePath}
                    onChange={(e) => setClonePath(e.target.value)}
                    placeholder="~/workspace/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#323742] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCloneModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#FAF8F5] dark:hover:bg-[#23272F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#C5A059] text-[#0A1128] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/20"
                >
                  {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Clone & Launch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

