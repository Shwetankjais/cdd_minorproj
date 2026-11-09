import React, { useState } from 'react';
import { Search, GitBranch, CheckCircle2, XCircle, Clock, User, Loader2 } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function RunsHistoryTable() {
  const { runs, selectedRun, setSelectedRun, runsLoading } = useThemeAndProject();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filterOptions = ['All', 'Passed', 'Failed at Build', 'Failed at Test'];

  const filteredRuns = runs.filter((run) => {
    // Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Passed' && run.status !== 'Passed') return false;
      if (statusFilter === 'Failed at Build' && run.status !== 'Failed at Build') return false;
      if (statusFilter === 'Failed at Test' && run.status !== 'Failed at Test') return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        (run.id && run.id.toLowerCase().includes(q)) ||
        (run.branch && run.branch.toLowerCase().includes(q)) ||
        (run.commit && run.commit.toLowerCase().includes(q)) ||
        (run.author && run.author.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm transition-all duration-200">
      {/* Header, Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Pipeline Runs</h3>
            <span className="text-xs text-slate-400 font-normal hidden md:inline">
              (click any row to inspect diagnostics)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredRuns.length} of {runs.length} recorded builds
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center flex-wrap gap-1.5">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === filter
                  ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by commit, branch, author, or run #ID..."
          className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
        />
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/60">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/80 font-semibold">
              <th className="py-3 px-3.5">Run ID</th>
              <th className="py-3 px-3">Commit & Author</th>
              <th className="py-3 px-3">Branch</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Duration</th>
              <th className="py-3 px-3">Triggered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {runsLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-sky-500" />
                  <span>Loading live pipeline runs...</span>
                </td>
              </tr>
            ) : filteredRuns.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No pipeline runs matched your search criteria.
                </td>
              </tr>
            ) : (
              filteredRuns.map((run) => {
                const isSelected = selectedRun && (selectedRun.id === run.id || selectedRun.rawId === run.rawId);
                const isPassed = run.status === 'Passed';

                return (
                  <tr
                    key={run.id || run.rawId}
                    onClick={() => setSelectedRun(run)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-50/80 dark:bg-sky-950/40 text-slate-900 dark:text-white font-medium'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {/* Run ID */}
                    <td className="py-3 px-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">
                      <div className="flex items-center gap-1.5">
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>}
                        {run.id}
                      </div>
                    </td>

                    {/* Commit & Author */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <p className="truncate font-semibold text-slate-800 dark:text-slate-200">{run.commit}</p>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3" />
                        {run.author} • <span className="font-mono">{run.commitHash}</span>
                      </p>
                    </td>

                    {/* Branch */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        <GitBranch className="w-3 h-3" />
                        {run.branch}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isPassed
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {run.status}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">
                      {run.duration}
                    </td>

                    {/* Triggered */}
                    <td className="py-3 px-3 text-slate-400">
                      {run.triggered}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

