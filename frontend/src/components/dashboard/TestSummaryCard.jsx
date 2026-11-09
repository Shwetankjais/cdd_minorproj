import React from 'react';
import { FlaskConical, CheckCircle2, XCircle, MinusCircle, ArrowRight } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function TestSummaryCard() {
  const { selectedRun, openLogsModal } = useThemeAndProject();

  const tests = selectedRun.testResults || { passed: 112, failed: 0, skipped: 0, total: 112 };
  const passRate = tests.total > 0 ? Math.round((tests.passed / tests.total) * 100) : 100;

  return (
    <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#262930] mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#FAF8F5] dark:bg-[#1A1E29] text-[#0A1128] dark:text-[#D4AF37] border border-[#E2E8F0] dark:border-[#262930]">
            <FlaskConical className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
              <span>Test Results</span>
              <span className="font-mono text-xs text-[#0A1128] dark:text-[#D4AF37]">({selectedRun.id})</span>
            </h3>
            <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] tabular-nums">
              {tests.total} total unit & integration tests
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            openLogsModal(
              `Test Results & Vitest Suites (${selectedRun.id})`,
              `=== Vitest Test Suite Execution ===\nRun: ${selectedRun.id}\nTarget: ${selectedRun.branch}\n\nPassed: ${tests.passed}\nFailed: ${tests.failed}\nSkipped: ${tests.skipped}\nPass Rate: ${passRate}%\n\nAll test suites completed in 46.12s.`
            )
          }
          className="text-xs font-mono text-[#0A1128] dark:text-[#D4AF37] hover:underline flex items-center gap-1"
        >
          View Details <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3 Metric Badges */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Passed */}
        <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
            <CheckCircle2 className="w-3 h-3" />
            <span className="text-[10px] font-mono uppercase">Passed</span>
          </div>
          <p className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{tests.passed}</p>
        </div>

        {/* Failed */}
        <div
          className={`p-2.5 rounded-md border ${
            tests.failed > 0
              ? 'bg-[#E63946]/10 border-[#E63946]/30'
              : 'bg-[#FAF8F5] dark:bg-[#0B0E14] border-[#E2E8F0] dark:border-[#262930]'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[#E63946] mb-1">
            <XCircle className="w-3 h-3" />
            <span className="text-[10px] font-mono uppercase">Failed</span>
          </div>
          <p className={`text-lg font-bold font-mono tabular-nums ${tests.failed > 0 ? 'text-[#E63946]' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
            {tests.failed}
          </p>
        </div>

        {/* Skipped */}
        <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center justify-center gap-1 text-[#F59E0B] mb-1">
            <MinusCircle className="w-3 h-3" />
            <span className="text-[10px] font-mono uppercase">Skipped</span>
          </div>
          <p className="text-lg font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">{tests.skipped}</p>
        </div>
      </div>
    </div>
  );
}
