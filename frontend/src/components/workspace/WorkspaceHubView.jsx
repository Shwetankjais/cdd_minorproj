import React, { useState, useRef, useEffect } from 'react';
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
  FolderTree,
} from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';
import api from '../../services/api';

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
  const [cloneUrl, setCloneUrl] = useState(() =>
    user?.githubRepo ? `https://github.com/${user.githubRepo}.git` : 'https://github.com/Shwetankjais/cdd_minorproj.git'
  );
  const [cloneBranch, setCloneBranch] = useState('main');
  const [clonePath, setClonePath] = useState(() =>
    user?.github_username ? `~/workspace/${user.github_username}` : '~/workspace/cdd_minorproj'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [showAllWorkspaces, setShowAllWorkspaces] = useState(false);
  const [quickFolders, setQuickFolders] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    api.browseWorkspaces().then((folders) => {
      if (Array.isArray(folders) && folders.length > 0) {
        setQuickFolders(folders);
      }
    });
  }, []);

  const openSelectedFolder = async (folderName, resolvedPath) => {
    setIsProcessing(true);
    const targetPath = resolvedPath || (folderName.startsWith('~') ? folderName : `~/Desktop/${folderName}`);
    try {
      const res = await openWorkspace(targetPath);
      try {
        await api.getGitStatus(targetPath);
      } catch {
        // ignore
      }
      setFeedbackMsg({
        type: 'success',
        text: res?.message || `Opened workspace: ${folderName} (${targetPath})`,
      });
      setShowOpenModal(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch {
      setFeedbackMsg({ type: 'error', text: `Failed to open workspace folder "${folderName}".` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNativeOpenFolder = async () => {
    // 1. Primary Action: Launch Native macOS Finder / Windows File Explorer
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const dirHandle = await window.showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          const folderName = dirHandle.name;
          const targetPath = `~/Desktop/${folderName}`;
          await openSelectedFolder(folderName, targetPath);
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return; // user cancelled Finder dialog
      }
    }

    // 2. Fallback for browsers without showDirectoryPicker
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      setShowOpenModal(true);
    }
  };

  const handleDirectoryInputChange = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const relPath = files[0].webkitRelativePath || files[0].name || '';
      const folderName = relPath.split('/')[0] || files[0].name || 'cdd_minor';
      const targetPath = `~/Desktop/${folderName}`;
      await openSelectedFolder(folderName, targetPath);
    }
    e.target.value = '';
  };

  const handleOpenFolderSubmit = async (e) => {
    e.preventDefault();
    if (!folderPath.trim()) return;
    await openSelectedFolder(folderPath.split('/').filter(Boolean).pop() || folderPath, folderPath);
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
      {/* Hidden native directory input fallback */}
      <input
        ref={fileInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleDirectoryInputChange}
      />
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
          <button type="button" onClick={() => setFeedbackMsg(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Two Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {/* Open Folder Button - Launches Native Finder / File Explorer */}
        <button
          type="button"
          onClick={handleNativeOpenFolder}
          className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#0A1128] dark:bg-[#181C24] text-[#F8FAFC] hover:bg-[#142238] dark:hover:bg-[#1E232E] border border-[#D4AF37]/50 shadow-md transition-all group cursor-pointer"
        >
          <FolderOpen className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-xs font-sans">Open Folder</span>
        </button>

        {/* Clone Repository Button */}
        <button
          type="button"
          onClick={() => setShowCloneModal(true)}
          className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white dark:bg-[#181C24] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#FAF8F5] dark:hover:bg-[#1E232E] border border-[#E2E8F0] dark:border-[#2A303C] hover:border-[#D4AF37] shadow-md transition-all group cursor-pointer"
        >
          <Copy className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-xs font-sans">Clone Repository</span>
        </button>
      </div>

      {/* Workspaces List */}
      <div className="max-w-lg mx-auto space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Workspaces ({workspaces.length})
          </span>
          <span className="text-[10px] font-sans text-[#64748B] dark:text-[#94A3B8]">
            click to switch active project
          </span>
        </div>

        <div className="space-y-2">
          {displayedWorkspaces.map((w) => {
            const isCurrent = activeWorkspace?.id === w.id;
            return (
              <div
                key={w.id}
                onClick={() => handleSelectWorkspace(w)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-[#FAF8F5] dark:bg-[#1E232E] border-[#D4AF37] shadow-md'
                    : 'bg-white dark:bg-[#181C24] border-[#E2E8F0] dark:border-[#2A303C] hover:border-[#D4AF37]/50 hover:shadow'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <FolderGit2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span className="font-sans font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC] truncate">
                      {w.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-sans px-1.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#0A1128] dark:text-[#D4AF37] border border-[#D4AF37]/30 font-semibold uppercase">
                        active
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-sans text-[#64748B] dark:text-[#94A3B8] tabular-nums font-medium">
                    {w.passRate}% pass
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1.5">
                  <span className="font-mono text-[10px] truncate">{w.path}</span>
                  <span className="flex items-center gap-1 font-mono text-[10px]">
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
            type="button"
            onClick={() => setShowAllWorkspaces((prev) => !prev)}
            className="w-full text-center text-xs font-sans text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] py-1 cursor-pointer font-medium"
          >
            {showAllWorkspaces ? 'Show Less' : `Show More (${workspaces.length - 3} more)...`}
          </button>
        )}
      </div>

      {/* GitHub Integration Status Card */}
      <div className="max-w-lg mx-auto p-4 rounded-xl bg-white dark:bg-[#181C24] border border-[#E2E8F0] dark:border-[#2A303C] shadow-lg shadow-black/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Github className="w-4 h-4 text-[#0F172A] dark:text-[#F8FAFC]" />
            <div>
              <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">GitHub Repository Integration</p>
              <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                {user?.githubRepo || (user?.github_username ? `${user.github_username}/portfolio` : 'Shwetankjais/cdd_minorproj')}
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full ${
              user?.githubConnected
                ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-[#E63946] bg-[#E63946]/10 border border-[#E63946]/20'
            }`}
          >
            {user?.githubConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Open Folder Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-[#070D1F]/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#181C24] border border-[#E2E8F0] dark:border-[#2A303C] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#2A303C]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">Open Local Directory</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOpenModal(false)}
                className="p-1 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1-Click Native OS Picker Action */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleNativeOpenFolder}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0A1128] dark:bg-[#1E232E] hover:bg-[#142238] dark:hover:bg-[#252B38] text-[#F8FAFC] border border-[#D4AF37]/50 font-sans font-semibold text-xs shadow transition-all cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-[#D4AF37]" />
                Launch Native OS Finder / Explorer
              </button>
              <p className="text-[10px] text-center text-[#64748B] dark:text-[#94A3B8]">
                Opens macOS Finder or Windows File Explorer directly to pick any folder
              </p>
            </div>

            {/* Quick Presets */}
            {quickFolders.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
                  Quick Folder Presets:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickFolders.slice(0, 4).map((f) => (
                    <button
                      key={f.path}
                      type="button"
                      onClick={() => openSelectedFolder(f.name, f.path)}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#14171F] hover:bg-[#E2E8F0] dark:hover:bg-[#1E232E] border border-[#E2E8F0] dark:border-[#2A303C] text-left transition-colors cursor-pointer"
                    >
                      <FolderGit2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">{f.name}</p>
                        <p className="text-[9px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate">{f.path}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Path Fallback Form */}
            <form onSubmit={handleOpenFolderSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
                  Or Type Local Path:
                </label>
                <input
                  type="text"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#2A303C] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium border border-[#E2E8F0] dark:border-[#2A303C] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-sans font-semibold bg-[#D4AF37] hover:bg-[#c49f2e] text-[#0A1128] transition-colors cursor-pointer shadow-sm"
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
        <div className="fixed inset-0 bg-[#070D1F]/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#181C24] border border-[#E2E8F0] dark:border-[#2A303C] rounded-xl max-w-md w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#2A303C]">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">Clone Git Repository</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCloneModal(false)}
                className="p-1 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCloneRepoSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
                  Repository URL:
                </label>
                <input
                  type="text"
                  value={cloneUrl}
                  onChange={(e) => setCloneUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#2A303C] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">Branch:</label>
                  <input
                    type="text"
                    value={cloneBranch}
                    onChange={(e) => setCloneBranch(e.target.value)}
                    className="w-full text-xs font-mono p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#2A303C] text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">Target Path:</label>
                  <input
                    type="text"
                    value={clonePath}
                    onChange={(e) => setClonePath(e.target.value)}
                    className="w-full text-xs font-mono p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#2A303C] text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCloneModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium border border-[#E2E8F0] dark:border-[#2A303C] text-[#64748B] dark:text-[#94A3B8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-sans font-semibold bg-[#D4AF37] hover:bg-[#c49f2e] text-[#0A1128] transition-colors shadow-sm"
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
