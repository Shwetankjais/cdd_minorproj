import React from 'react';
import { AlertOctagon, Terminal, CheckCircle2, Lightbulb, FileCode, ArrowRight } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function FailureExplanationPanel() {
  const { selectedRun, openLogsModal } = useThemeAndProject();

  const error = selectedRun.errorSummary;

  const handleOpenLogs = () => {
    if (error?.rawLogs) {
      openLogsModal(`Raw Logs & Terminal Trace (${selectedRun.id})`, error.rawLogs);
    } else {
      openLogsModal(
        `Execution Output (${selectedRun.id})`,
        `[PIPELINE RUNNER] Target: ${selectedRun.branch} | Commit: ${selectedRun.commitHash}\nAll stages (Checkout, Install, Test, Build, Docker, Deploy) finished successfully with code 0.\nDeployment verified in production cluster.`
      );
    }
  };

  if (!error) {
    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1E24] border border-[#E2E8F0] dark:border-[#323742] shadow-warm-sm transition-all duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#2D3748] mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Pipeline Diagnostic Summary</h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            Run {selectedRun.id}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>All verification checks passed with zero runtime errors.</span>
          </div>
          <button
            onClick={handleOpenLogs}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
          >
            Logs <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1E24] border-2 border-[#E63946]/40 dark:border-[#E63946]/60 shadow-warm-sm transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E63946]/20 dark:border-[#E63946]/30 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E63946]/10 text-[#E63946] animate-pulse">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
              <span>Failure Explanation</span>
              <span className="text-xs font-mono text-[#E63946] font-bold">({selectedRun.id})</span>
            </h3>
            <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Beginner-Friendly 3-Line Root Cause Translation</p>
          </div>
        </div>

        <button
          onClick={handleOpenLogs}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#E63946]/10 hover:bg-[#E63946]/20 text-[#E63946] transition-colors border border-[#E63946]/30"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>View Logs →</span>
        </button>
      </div>

      {/* 3-Line Error Translation */}
      <div className="space-y-2 text-xs">
        {/* Line 1: Failed Stage */}
        <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#323742]">
          <div className="flex items-center gap-1.5 font-bold text-[#E63946] mb-0.5">
            <FileCode className="w-3.5 h-3.5" />
            <span className="uppercase text-[10px] tracking-wider">1. Failed Stage</span>
          </div>
          <p className="text-[#0F172A] dark:text-[#F8FAFC] font-medium pl-5">{error.failedStage}</p>
        </div>

        {/* Line 2: Plain-English Root Cause */}
        <div className="p-2.5 rounded-xl bg-[#E63946]/10 dark:bg-[#E63946]/15 border border-[#E63946]/30">
          <div className="flex items-center gap-1.5 font-bold text-[#E63946] mb-0.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span className="uppercase text-[10px] tracking-wider">2. Plain-English Root Cause</span>
          </div>
          <p className="text-[#0F172A] dark:text-[#F8FAFC] font-medium pl-5 leading-relaxed">
            {error.rootCause}
          </p>
        </div>

        {/* Line 3: Suggested Fix */}
        <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">
            <Lightbulb className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="uppercase text-[10px] tracking-wider">3. Suggested Fix</span>
          </div>
          <p className="text-[#0F172A] dark:text-[#F8FAFC] font-medium pl-5 leading-relaxed">
            {error.suggestedFix}
          </p>
        </div>
      </div>
    </div>
  );
}
