import React from 'react';
import { FlaskConical, CheckCircle2, XCircle, MinusCircle, ArrowRight } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function TestSummaryCard() {
  const { selectedRun, openLogsModal } = useThemeAndProject();

  const tests = selectedRun.testResults || { passed: 112, failed: 0, skipped: 0, total: 112 };
  const passRate = tests.total > 0 ? Math.round((tests.passed / tests.total) * 100) : 100;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1E24] border border-[#E2E8F0] dark:border-[#323742] shadow-warm-sm transition-all duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#2D3748] mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#0A1128]/5 dark:bg-[#0D1B2A] text-[#0A1128] dark:text-[#D4AF37] border border-[#E2E8F0] dark:border-[#323742]">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
              <span>Test Results</span>
              <span className="font-mono text-xs text-[#0A1128] dark:text-[#D4AF37]">({selectedRun.id})</span>
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{tests.total} total unit & integration tests</p>
          </div>
        </div>

        <button
          onClick={() =>
            openLogsModal(
              `Test Results & Vitest Suites (${selectedRun.id})`,
              `=== Vitest Test Suite Execution ===\nRun: ${selectedRun.id}\nTarget: ${selectedRun.branch}\n\nPassed: ${tests.passed}\nFailed: ${tests.failed}\nSkipped: ${tests.skipped}\nPass Rate: ${passRate}%\n\nAll test suites completed in 46.12s.`
            )
          }
          className="text-xs font-semibold text-[#0A1128] dark:text-[#D4AF37] hover:underline flex items-center gap-1"
        >
          View Details <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3 Metric Badges */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Passed */}
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Passed</span>
          </div>
          <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">{tests.passed}</p>
        </div>

        {/* Failed */}
        <div
          className={`p-2.5 rounded-xl border ${
            tests.failed > 0
              ? 'bg-[#E63946]/10 dark:bg-[#E63946]/20 border-[#E63946]/30'
              : 'bg-[#FAF8F5] dark:bg-[#0D1B2A] border-[#E2E8F0] dark:border-[#323742]'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[#E63946] mb-1">
            <XCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Failed</span>
          </div>
          <p className={`text-xl font-extrabold ${tests.failed > 0 ? 'text-[#E63946]' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
            {tests.failed}
          </p>
        </div>

        {/* Skipped */}
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center justify-center gap-1 text-[#F59E0B] mb-1">
            <MinusCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Skipped</span>
          </div>
          <p className="text-xl font-extrabold text-amber-700 dark:text-amber-400">{tests.skipped}</p>
        </div>
      </div>
    </div>
  );
}
