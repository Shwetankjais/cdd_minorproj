import React, { useState } from 'react';
import {
  FolderOpen,
  Copy,
  FolderGit2,
  GitBranch,
  Github,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  X,
  Loader2,
  Activity,
  Layers,
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
    setActiveTab('overview');
  };

  const displayedWorkspaces = showAllWorkspaces ? workspaces : workspaces.slice(0, 3);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#FAF8F5] dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] mb-1">
          <svg className="w-6 h-6 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 22h5l5-10 5 10h5L12 2z" />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          DevPulse Collaborative Workspace Hub
        </h1>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto">
          Open local directories, clone repositories, and manage synchronized CI/CD pipelines.
        </p>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-2.5 rounded-md border text-xs flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-[#E63946]/10 border-[#E63946]/30 text-[#E63946]'
          }`}
        >
          <span className="font-mono">{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Two Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {/* Open Folder Button */}
        <button
          onClick={() => setShowOpenModal(true)}
          className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-md bg-[#0A1128] dark:bg-[#14171F] text-[#F8FAFC] hover:bg-[#142238] dark:hover:bg-[#1A1E29] border border-[#D4AF37]/50 transition-colors"
        >
          <FolderOpen className="w-4 h-4 text-[#D4AF37]" />
          <span className="font-semibold text-xs font-mono">Open Folder</span>
        </button>

        {/* Clone Repository Button */}
        <button
          onClick={() => setShowCloneModal(true)}
          className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-md bg-white dark:bg-[#14171F] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#FAF8F5] dark:hover:bg-[#1A1E29] border border-[#E2E8F0] dark:border-[#262930] hover:border-[#D4AF37] transition-colors"
        >
          <Copy className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
          <span className="font-semibold text-xs font-mono">Clone Repository</span>
        </button>
      </div>

      {/* Workspaces List */}
      <div className="max-w-lg mx-auto space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Workspaces ({workspaces.length})
          </span>
          <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            click to switch active project
          </span>
        </div>

        <div className="space-y-1.5">
          {displayedWorkspaces.map((w) => {
            const isCurrent = activeWorkspace?.id === w.id;
            return (
              <div
                key={w.id}
                onClick={() => handleSelectWorkspace(w)}
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  isCurrent
                    ? 'bg-[#FAF8F5] dark:bg-[#1A1E29] border-[#D4AF37]'
                    : 'bg-white dark:bg-[#14171F] border-[#E2E8F0] dark:border-[#262930] hover:border-[#D4AF37]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <FolderGit2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                    <span className="font-mono font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC] truncate">
                      {w.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-mono px-1 rounded bg-[#D4AF37]/15 text-[#0A1128] dark:text-[#D4AF37] border border-[#D4AF37]/30">
                        active
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                    {w.passRate}% pass
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] mt-1">
                  <span className="truncate">{w.path}</span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-2.5 h-2.5" />
                    {w.branch}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {workspaces.length > 3 && (
          <button
            onClick={() => setShowAllWorkspaces((prev) => !prev)}
            className="w-full text-center text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] py-1"
          >
            {showAllWorkspaces ? 'Show Less' : `Show More (${workspaces.length - 3} more)...`}
          </button>
        )}
      </div>

      {/* GitHub Integration Status Card */}
      <div className="max-w-lg mx-auto p-3.5 rounded-md bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-[#0F172A] dark:text-[#F8FAFC]" />
            <div>
              <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">GitHub Repository Integration</p>
              <p className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                {user?.githubRepo || 'Shwetankjais/cdd_minorproj'}
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              user?.githubConnected
                ? 'text-emerald-500 bg-emerald-500/10'
                : 'text-[#E63946] bg-[#E63946]/10'
            }`}
          >
            {user?.githubConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Open Folder Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-[#070D1F]/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] rounded-md max-w-md w-full p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#262930]">
              <h3 className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">Open Local Directory</h3>
              <button onClick={() => setShowOpenModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleOpenFolderSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] block mb-1">
                  Directory Path:
                </label>
                <input
                  type="text"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  className="w-full text-xs font-mono p-2 rounded-md bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#262930] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-3 py-1 rounded-md text-xs font-mono border border-[#E2E8F0] dark:border-[#262930]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-3 py-1 rounded-md text-xs font-mono font-semibold bg-[#D4AF37] text-[#0A1128]"
                >
                  {isProcessing ? 'Opening...' : 'Open Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clone Repository Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-[#070D1F]/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] rounded-md max-w-md w-full p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#262930]">
              <h3 className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">Clone Git Repository</h3>
              <button onClick={() => setShowCloneModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCloneRepoSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] block mb-1">
                  Repository URL:
                </label>
                <input
                  type="text"
                  value={cloneUrl}
                  onChange={(e) => setCloneUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2 rounded-md bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#262930] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] block mb-1">Branch:</label>
                  <input
                    type="text"
                    value={cloneBranch}
                    onChange={(e) => setCloneBranch(e.target.value)}
                    className="w-full text-xs font-mono p-2 rounded-md bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#262930] text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] block mb-1">Target Path:</label>
                  <input
                    type="text"
                    value={clonePath}
                    onChange={(e) => setClonePath(e.target.value)}
                    className="w-full text-xs font-mono p-2 rounded-md bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#262930] text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCloneModal(false)}
                  className="px-3 py-1 rounded-md text-xs font-mono border border-[#E2E8F0] dark:border-[#262930]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-3 py-1 rounded-md text-xs font-mono font-semibold bg-[#D4AF37] text-[#0A1128]"
                >
                  {isProcessing ? 'Cloning...' : 'Clone Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
