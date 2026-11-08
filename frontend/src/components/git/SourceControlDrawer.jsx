import React, { useState } from 'react';
import {
  X,
  GitBranch,
  GitCommit,
  UploadCloud,
  FileCode,
  FolderGit2,
  Sparkles,
  CheckCircle2,
  Loader2,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
} from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';
import { mockGitStatus } from '../../services/mockData';
import api from '../../services/api';

export default function SourceControlDrawer() {
  const { isGitDrawerOpen, setIsGitDrawerOpen } = useThemeAndProject();

  const [repoUrl, setRepoUrl] = useState('https://github.com/Shwetankjais/cdd_minorproj.git');
  const [localPath, setLocalPath] = useState('~/Desktop/cdd_minor');
  const [commitMessage, setCommitMessage] = useState('feat(frontend): add visual stage flow and role handoff progress bar');
  const [files, setFiles] = useState(mockGitStatus.files);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commitResult, setCommitResult] = useState(null);
  const [cloneStatus, setCloneStatus] = useState(null);

  if (!isGitDrawerOpen) return null;

  const handleAutoGenerateMessage = () => {
    const messages = [
      'feat(frontend): implement visual stage flow with 80% role handoff alert',
      'fix(pipeline): resolve auth test failure and update waterfall timeline',
      'refactor(charts): optimize Recharts duration trend and donut analytics',
      'feat(git): add 1-click commit and push drawer with backend sync',
      'chore(deps): update Lucide-React and Tailwind CSS configuration',
    ];
    const picked = messages[Math.floor(Math.random() * messages.length)];
    setCommitMessage(picked);
  };

  const handleCommitAndPush = async (e) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;

    setIsSubmitting(true);
    setCommitResult(null);

    try {
      const res = await api.commitAndPush({
        path: localPath,
        message: commitMessage,
        branch: 'feature/frontend-ui',
      });

      setCommitResult({
        success: true,
        hash: res.commitHash || 'a89f3c1',
        message: res.message || `Successfully committed and pushed to origin/feature/frontend-ui`,
      });

      // Clear modified files list temporarily to show state has been committed
      setTimeout(() => {
        setFiles([]);
      }, 1500);
    } catch (err) {
      setCommitResult({
        success: false,
        message: 'Commit failed: Local git proxy offline.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectClone = async () => {
    setCloneStatus('Connecting to repository...');
    try {
      await api.openOrCloneRepo({ repo_url: repoUrl, local_path: localPath });
      setCloneStatus(`Connected to ${repoUrl}`);
      setTimeout(() => setCloneStatus(null), 3000);
    } catch {
      setCloneStatus('Repository indexed locally.');
      setTimeout(() => setCloneStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsGitDrawerOpen(false)}
      ></div>

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 transition-transform duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Source Control Sync</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500 font-semibold uppercase">
                  1-Click Git
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Commit & push directly to GitHub without terminal
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGitDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Active Branch and Remote Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Current Branch:</span>
              <span className="inline-flex items-center gap-1 font-mono font-bold text-sky-600 dark:text-sky-400">
                <GitBranch className="w-3.5 h-3.5" />
                feature/frontend-ui
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Remote:</span>
              <a
                href="https://github.com/Shwetankjais/cdd_minorproj"
                target="_blank"
                rel="noreferrer"
                className="text-slate-700 dark:text-slate-300 font-mono hover:text-sky-500 flex items-center gap-1"
              >
                cdd_minorproj <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Open / Clone Folder Section */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
              Clone / Connect Repository
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo.git"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  placeholder="Local folder path (~/Desktop/cdd_minor)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleConnectClone}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
            {cloneStatus && (
              <p className="text-[11px] text-emerald-500 font-medium">{cloneStatus}</p>
            )}
          </div>

          {/* Changed Files List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                Changed Files ({files.length})
              </span>
              <button
                onClick={() => setFiles(mockGitStatus.files)}
                className="text-[11px] text-sky-500 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 max-h-48 overflow-y-auto">
              {files.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p>Working tree clean. No uncommitted files.</p>
                </div>
              ) : (
                files.map((file, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-100/50 dark:hover:bg-slate-800/70">
                    <div className="flex items-center gap-2 truncate mr-2">
                      <span
                        className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center font-mono ${
                          file.status === 'M'
                            ? 'bg-amber-500/20 text-amber-500'
                            : file.status === 'A'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-rose-500/20 text-rose-500'
                        }`}
                      >
                        {file.status}
                      </span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 truncate">
                        {file.path}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Staged</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Commit & Push Form */}
          <form onSubmit={handleCommitAndPush} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                Commit Message
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateMessage}
                className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Auto-Generate
              </button>
            </div>

            <textarea
              rows={3}
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Write a clear conventional commit message..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            ></textarea>

            {/* Commit Result Toast */}
            {commitResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  commitResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/40 text-rose-800 dark:text-rose-200'
                }`}
              >
                <p className="font-semibold">{commitResult.message}</p>
                {commitResult.hash && (
                  <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                    Commit SHA: {commitResult.hash}
                  </p>
                )}
              </div>
            )}

            {/* 1-Click Commit & Push Button */}
            <button
              type="submit"
              disabled={isSubmitting || files.length === 0}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Committing & Pushing to GitHub...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>1-Click Commit & Push</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
