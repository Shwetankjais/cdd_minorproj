import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  GitBranch,
  UploadCloud,
  FolderGit2,
  Sparkles,
  CheckCircle2,
  Loader2,
  ExternalLink,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';
import api from '../../services/api';

export default function SourceControlDrawer() {
  const { isGitDrawerOpen, setIsGitDrawerOpen, user, connectGithub } = useThemeAndProject();

  const [repoUrl, setRepoUrl] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [repository, setRepository] = useState(null);
  const [patToken, setPatToken] = useState('');
  const [isLinkingPat, setIsLinkingPat] = useState(false);
  const [patSuccessMsg, setPatSuccessMsg] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [selected, setSelected] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commitResult, setCommitResult] = useState(null);
  const [statusError, setStatusError] = useState('');
  const files = repository?.files ?? [];
  const branch = repository?.branch;
  const busy = loadingFiles || isSubmitting;
  const defaultMessage = selected.length === 1 && selected[0] === 'README.md'
    ? 'docs: update DevPulse README' : 'chore: update selected files';

  const fileInputRef = useRef(null);

  async function loadGitStatus(path) {
    setLoadingFiles(true);
    setStatusError('');
    setSelected([]);
    try {
      setRepository(await api.getGitStatus(path));
    } catch (error) {
      setRepository(null);
      setStatusError(error.message);
    } finally {
      setLoadingFiles(false);
    }
  }

  const handleSelectLocalDirectory = async () => {
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const dirHandle = await window.showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          const path = `~/Desktop/${dirHandle.name}`;
          setLocalPath(path);
          await loadGitStatus(path);
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = async (e) => {
    const pickedFiles = e.target.files;
    if (pickedFiles && pickedFiles.length > 0) {
      const relPath = pickedFiles[0].webkitRelativePath || pickedFiles[0].name || '';
      const folderName = relPath.split('/')[0] || pickedFiles[0].name || 'cdd_minor';
      const path = `~/Desktop/${folderName}`;
      setLocalPath(path);
      await loadGitStatus(path);
    }
    e.target.value = '';
  };

  useEffect(() => {
    if (isGitDrawerOpen) loadGitStatus();
  }, [isGitDrawerOpen]);

  if (!isGitDrawerOpen) return null;

  async function handleLinkPat(e) {
    if (e) e.preventDefault();
    if (!patToken.trim()) return;
    setIsLinkingPat(true);
    setStatusError('');
    setPatSuccessMsg('');
    try {
      if (connectGithub) {
        await connectGithub({
          github_username: user?.github_username,
          github_token: patToken.trim(),
        });
      } else {
        await api.connectGithub({
          github_username: user?.github_username,
          github_token: patToken.trim(),
        });
      }
      setPatSuccessMsg('GitHub credential linked to session successfully!');
      setTimeout(() => setPatSuccessMsg(''), 4000);
      setPatToken('');
    } catch (err) {
      setStatusError(err.message || 'Failed to link token.');
    } finally {
      setIsLinkingPat(false);
    }
  }

  async function handleCommitAndPush(event) {
    event.preventDefault();
    if (busy || !selected.length || !branch) return;
    setIsSubmitting(true);
    setCommitResult(null);
    try {
      const result = await api.commitAndPush({
        path: repository.path,
        files: selected,
        message: commitMessage.trim() || defaultMessage,
        branch,
      });
      setCommitResult(result);
      await loadGitStatus(repository.path);
    } catch (error) {
      setCommitResult({ error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConnectClone() {
    setLoadingFiles(true);
    setStatusError('');
    setCommitResult(null);
    setSelected([]);
    try {
      const result = await api.openOrCloneRepo({
        repo_url: repoUrl.trim(),
        path: localPath.trim() || repository?.path,
      });
      setRepository(result);
      setLocalPath(result.path);
      setRepoUrl('');
    } catch (error) {
      setRepository(null);
      setStatusError(error.message);
    } finally {
      setLoadingFiles(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#070D1F]/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsGitDrawerOpen(false)}
      ></div>

      {/* Hidden file input fallback for directory picker */}
      <input
        ref={fileInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#181C24] h-full shadow-2xl border-l border-[#E2E8F0] dark:border-[#2A303C] flex flex-col z-10 transition-transform duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E2E8F0] dark:border-[#2A303C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0A1128]/5 dark:bg-[#1E232E] text-[#0A1128] dark:text-[#D4AF37] border border-[#E2E8F0] dark:border-[#2A303C]">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                <span>Source Control Sync</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#0A1128] dark:text-[#D4AF37] border border-[#D4AF37]/30 font-semibold uppercase">
                  1-Click Git
                </span>
              </h2>
              <p className="text-xs font-sans text-[#64748B] dark:text-[#94A3B8]">
                Commit & push directly to GitHub without terminal
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGitDrawerOpen(false)}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#FAF8F5] dark:hover:bg-[#1E232E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Active Branch and Remote Info */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E232E] border border-[#E2E8F0] dark:border-[#2A303C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#94A3B8] font-medium font-sans">Current Branch:</span>
              <span className="inline-flex items-center gap-1 font-mono font-bold text-[#0A1128] dark:text-[#D4AF37]">
                <GitBranch className="w-3.5 h-3.5" />
                {branch || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#64748B] dark:text-[#94A3B8] font-sans">Remote:</span>
              <a
                href={user?.githubRepo ? `https://github.com/${user.githubRepo}` : "https://github.com/Shwetankjais/cdd_minorproj"}
                target="_blank"
                rel="noreferrer"
                className="text-[#0F172A] dark:text-[#F8FAFC] font-mono hover:text-[#D4AF37] flex items-center gap-1"
              >
                {user?.githubRepo ? user.githubRepo.split('/')[1] : 'cdd_minorproj'} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Open / Clone Folder Section */}
          <div className="space-y-2">
            <label className="font-bold font-sans text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider text-[10px]">
              Clone / Connect Repository
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo.git"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#2A303C] text-[#0F172A] dark:text-[#F8FAFC] font-mono text-xs focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  placeholder="Local folder path (~/Desktop/cdd_minor)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#2A303C] text-[#0F172A] dark:text-[#F8FAFC] font-mono text-xs focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                />
                <button
                  type="button"
                  onClick={handleSelectLocalDirectory}
                  title="Browse local folder (Finder / Explorer)"
                  className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] dark:bg-[#1E232E] border border-[#E2E8F0] dark:border-[#2A303C] text-[#D4AF37] hover:bg-[#E2E8F0] dark:hover:bg-[#252B38] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-sans text-[11px] font-semibold">Browse</span>
                </button>
                <button
                  type="button"
                  onClick={handleConnectClone}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-lg bg-[#0A1128] dark:bg-[#1E232E] text-[#F8FAFC] font-sans font-semibold hover:bg-[#142238] dark:hover:bg-[#252B38] border border-[#D4AF37]/40 transition-colors cursor-pointer"
                >
                  Connect
                </button>
              </div>
            </div>
            {statusError && <p role="alert" className="text-[#E63946]">{statusError}</p>}
            <details>
              <summary className="cursor-pointer font-sans text-[#64748B] dark:text-[#94A3B8] font-semibold text-[11px]">
                Link GitHub Personal Access Token (PAT)
              </summary>
              <div className="mt-2 space-y-1.5 p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#2A303C]">
                <p className="text-[11px] font-sans text-[#64748B] dark:text-[#94A3B8]">
                  Link your personal access token to your session for private repo access and push authorization:
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    autoComplete="off"
                    value={patToken}
                    onChange={(event) => setPatToken(event.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#181C24] border border-[#E2E8F0] dark:border-[#2A303C] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={handleLinkPat}
                    disabled={isLinkingPat || !patToken.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#0A1128] dark:bg-[#1E232E] text-[#D4AF37] text-xs font-semibold border border-[#D4AF37]/40 hover:bg-[#142238] dark:hover:bg-[#252B38] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isLinkingPat ? 'Linking...' : 'Link'}
                  </button>
                </div>
                {patSuccessMsg && (
                  <p className="text-emerald-500 text-[11px] font-sans flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{patSuccessMsg}</span>
                  </p>
                )}
              </div>
            </details>
          </div>

          {/* Changed Files List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider text-[10px]">
                Changed Files ({files.length})
              </span>
              <button
                onClick={() => loadGitStatus(repository?.path)}
                disabled={busy}
                className="text-[11px] text-[#0A1128] dark:text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${loadingFiles ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {files.length > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setSelected(selected.length === files.length ? [] : files.map((file) => file.path))}
                className="font-semibold underline"
              >
                {selected.length === files.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
            <p>{selected.length} selected</p>
            <div className="rounded-xl border border-[#E2E8F0] dark:border-[#2A303C] divide-y divide-[#E2E8F0] dark:divide-[#2A303C] bg-[#FAF8F5]/60 dark:bg-[#14171F] max-h-48 overflow-y-auto">
              {loadingFiles ? (
                <p className="p-4">Reading Git status…</p>
              ) : !repository ? (
                <p className="p-4">Git status unavailable.</p>
              ) : files.length === 0 ? (
                <div className="p-4 text-center text-[#64748B] dark:text-[#94A3B8]">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p>Working tree clean. No uncommitted files.</p>
                </div>
              ) : (
                files.map((file) => (
                  <label
                    key={file.path}
                    className="p-2.5 flex items-center justify-between text-xs hover:bg-[#E2E8F0]/40 dark:hover:bg-[#1E232E]"
                  >
                    <div className="flex items-center gap-2 truncate mr-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(file.path)}
                        disabled={busy}
                        aria-label={file.path}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setSelected((previous) => checked
                            ? [...previous, file.path]
                            : previous.filter((path) => path !== file.path));
                        }}
                      />
                      <span
                        className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center font-mono ${
                          file.status === 'M'
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                            : file.status === 'A'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-[#E63946]/20 text-[#E63946]'
                        }`}
                      >
                        {file.status}
                      </span>
                      <span className="font-mono text-[#0F172A] dark:text-[#F8FAFC] truncate">{file.path}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Commit & Push Form */}
          <form onSubmit={handleCommitAndPush} className="space-y-3 pt-2 border-t border-[#E2E8F0] dark:border-[#2A303C]">
            <div className="flex items-center justify-between">
              <label className="font-bold font-sans text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider text-[10px]">
                Commit Message
              </label>
              <button
                type="button"
                onClick={() => setCommitMessage(defaultMessage)}
                className="text-[11px] font-semibold text-[#0A1128] dark:text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer font-sans"
              >
                <Sparkles className="w-3 h-3" /> Auto-Generate
              </button>
            </div>

            <textarea
              rows={3}
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder={defaultMessage}
              className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#2A303C] text-[#0F172A] dark:text-[#F8FAFC] font-mono text-xs focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
            ></textarea>

            {/* Commit Result Toast */}
            {commitResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  commitResult.pushed
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                    : 'bg-[#E63946]/10 dark:bg-[#E63946]/20 border-[#E63946]/40 text-[#E63946]'
                }`}
              >
                <p role={commitResult.pushed ? 'status' : 'alert'} className="font-semibold">
                  {commitResult.error || commitResult.message || 'Commit pushed to origin.'}
                </p>
                {commitResult.commit_sha && (
                  <p className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">Commit SHA: {commitResult.commit_sha}</p>
                )}
                {commitResult.commit_sha && (
                  <p>Pushed: {commitResult.pushed ? 'Yes' : 'No'} · Files: {commitResult.files.join(', ')}</p>
                )}
                {commitResult.push_error && <pre className="whitespace-pre-wrap break-all">{commitResult.push_error}</pre>}
              </div>
            )}

            {/* 1-Click Commit & Push Button (Primary Action - Crimson Red) */}
            <button
              type="submit"
              disabled={busy || !selected.length || !branch}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#E63946] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] shadow-md shadow-[#E63946]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
