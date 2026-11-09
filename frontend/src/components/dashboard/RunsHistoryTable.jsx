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
    <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] transition-colors">
      {/* Header, Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Recent Pipeline Runs</h3>
            <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] hidden md:inline">
              (select row to inspect diagnostics)
            </span>
          </div>
          <p className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] mt-0.5 tabular-nums">
            Showing {filteredRuns.length} of {runs.length} recorded builds
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center flex-wrap gap-1">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-2 py-1 rounded-md text-xs font-mono transition-colors ${
                statusFilter === filter
                  ? 'bg-[#0A1128] text-white dark:bg-[#D4AF37] dark:text-[#0A1128] font-semibold'
                  : 'bg-[#FAF8F5] dark:bg-[#1A1E29] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#262930]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by commit, branch, author, or run #ID..."
          className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#262930] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#D4AF37] transition-colors font-mono"
        />
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-md border border-[#E2E8F0] dark:border-[#262930]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] dark:bg-[#0B0E14] text-[#64748B] dark:text-[#94A3B8] border-b border-[#E2E8F0] dark:border-[#262930] font-mono text-[11px]">
              <th className="py-2.5 px-3">Run ID</th>
              <th className="py-2.5 px-3">Commit & Author</th>
              <th className="py-2.5 px-3">Branch</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Duration</th>
              <th className="py-2.5 px-3">Triggered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#262930]">
            {runsLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#64748B] dark:text-[#94A3B8]">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-[#D4AF37]" />
                  <span className="font-mono text-xs">Loading runs...</span>
                </td>
              </tr>
            ) : filteredRuns.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#64748B] dark:text-[#94A3B8] font-mono text-xs">
                  No pipeline runs matched "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredRuns.map((run) => {
                const isSelected = selectedRun.id === run.id;
                const isPassed = run.status === 'Passed';
                const isFailed = run.status.includes('Failed');

                return (
                  <tr
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#FAF8F5] dark:bg-[#1A1E29] font-medium'
                        : 'hover:bg-[#FAF8F5]/60 dark:hover:bg-[#1A1E29]/50'
                    }`}
                  >
                    {/* Run ID */}
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      <div className="flex items-center gap-1.5">
                        {isSelected && <span className="w-1 h-3.5 bg-[#D4AF37] rounded-full"></span>}
                        <span>{run.id}</span>
                      </div>
                    </td>

                    {/* Commit & Author */}
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-[#0F172A] dark:text-[#F8FAFC] truncate max-w-[220px]">
                        {run.commit}
                      </p>
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono flex items-center gap-1 mt-0.5">
                        <User className="w-2.5 h-2.5" />
                        <span>{run.author}</span>
                        <span>•</span>
                        <span>{run.commitHash || '121fac2'}</span>
                      </p>
                    </td>

                    {/* Branch */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-[#D4AF37]" />
                        <span>{run.branch}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          isPassed
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : isFailed
                            ? 'bg-[#E63946]/10 text-[#E63946]'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{run.status}</span>
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-2.5 px-3 font-mono tabular-nums text-[#64748B] dark:text-[#94A3B8]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{run.duration}</span>
                      </div>
                    </td>

                    {/* Triggered */}
                    <td className="py-2.5 px-3 text-[#64748B] dark:text-[#94A3B8] font-mono text-[11px]">
                      {run.relativeTime}
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
