import React from 'react';
import { AlertOctagon, Terminal, CheckCircle2, FileCode, ArrowRight } from 'lucide-react';
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
        `[PIPELINE RUNNER] Target: ${selectedRun.branch} | Commit: ${selectedRun.commitHash}\nAll verification stages (Checkout, Install, Test, Build, Docker, Deploy) finished successfully with code 0.\nDeployment verified in production cluster.`
      );
    }
  };

  if (!error) {
    return (
      <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#262930] mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Pipeline Diagnostic Summary
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-500 font-semibold">
            Run {selectedRun.id}
          </span>
        </div>

        <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="text-[11px]">All verification checks passed with zero runtime errors.</span>
          </div>
          <button
            onClick={handleOpenLogs}
            className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            Logs <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#14171F] border border-[#E63946]/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E63946]/20 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#E63946]/10 text-[#E63946]">
            <AlertOctagon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
              <span>Failure Explanation</span>
              <span className="text-xs font-mono text-[#E63946] font-bold">({selectedRun.id})</span>
            </h3>
            <p className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
              Automated 3-Line Root Cause Translation
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenLogs}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono font-medium bg-[#E63946]/10 hover:bg-[#E63946]/20 text-[#E63946] transition-colors border border-[#E63946]/30"
        >
          <Terminal className="w-3 h-3" />
          <span>View Logs →</span>
        </button>
      </div>

      {/* 3-Line Error Translation */}
      <div className="space-y-2 text-xs">
        {/* Line 1: Failed Stage */}
        <div className="p-2.5 rounded-md bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#262930]">
          <div className="flex items-center gap-1.5 font-bold font-mono text-[#E63946] mb-0.5">
            <FileCode className="w-3 h-3" />
            <span className="uppercase text-[10px] tracking-wider">1. Failed Stage</span>
          </div>
          <p className="text-[#0F172A] dark:text-[#F8FAFC] font-medium pl-4 text-[11px] font-mono">{error.failedStage}</p>
        </div>

        {/* Line 2: Plain-English Root Cause */}
        <div className="p-2.5 rounded-md bg-[#E63946]/5 border border-[#E63946]/20">
          <div className="flex items-center gap-1.5 font-bold font-mono text-[#E63946] mb-0.5">
            <AlertOctagon className="w-3 h-3" />
            <span className="uppercase text-[10px] tracking-wider">2. Plain-English Root Cause</span>
          </div>
          <p className="text-[#0F172A] dark:text-[#F8FAFC] pl-4 leading-relaxed text-[11px]">
            {error.rootCause}
          </p>
        </div>

        {/* Line 3: Suggested Fix */}
        <div className="p-2.5 rounded-md bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#262930]">
          <div className="flex items-center gap-1.5 font-bold font-mono text-[#D4AF37] mb-0.5">
            <Terminal className="w-3 h-3" />
            <span className="uppercase text-[10px] tracking-wider">3. Actionable Fix</span>
          </div>
          <p className="text-[#0F172A] dark:text-[#F8FAFC] pl-4 font-mono text-[10px] leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
            {error.suggestedFix}
          </p>
        </div>
      </div>
    </div>
  );
}
