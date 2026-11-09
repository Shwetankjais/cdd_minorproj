import React from 'react';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function WaterfallTimeline() {
  const { selectedRun } = useThemeAndProject();

  const waterfall = selectedRun.waterfall || [
    { stage: 'Checkout', offsetSec: 0, durationSec: 7, label: '7s', status: 'Passed' },
    { stage: 'Install', offsetSec: 7, durationSec: 44, label: '44s', status: 'Passed' },
    { stage: 'Test', offsetSec: 51, durationSec: 46, label: '46s', status: 'Passed' },
    { stage: 'Build', offsetSec: 97, durationSec: 45, label: '45s', status: 'Passed' },
    { stage: 'Docker', offsetSec: 142, durationSec: 56, label: '56s', status: 'Passed' },
    { stage: 'Deploy', offsetSec: 198, durationSec: 35, label: '35s', status: 'Passed' },
  ];

  const totalRunSeconds = 233;

  return (
    <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#262930] mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#FAF8F5] dark:bg-[#1A1E29] text-[#0A1128] dark:text-[#D4AF37] border border-[#E2E8F0] dark:border-[#262930]">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
              <span>Waterfall Execution Timeline</span>
              <span className="font-mono text-xs text-[#0A1128] dark:text-[#D4AF37]">({selectedRun.id})</span>
            </h3>
            <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
              Stage offsets and wall-clock execution durations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#1A1E29] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#262930] tabular-nums">
            {selectedRun.duration || '3m 35s total'}
          </span>
        </div>
      </div>

      {/* Outcome notification badge */}
      {selectedRun.status === 'Passed' ? (
        <div className="p-2 mb-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px]">All stages completed with exit code 0. Production cluster live.</span>
        </div>
      ) : (
        <div className="p-2 mb-3.5 rounded-md bg-[#E63946]/10 border border-[#E63946]/30 text-xs text-[#E63946] flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0" />
          <span className="text-[11px]">Pipeline halted prematurely due to stage failure in {selectedRun.status}. Subsequent stages skipped.</span>
        </div>
      )}

      {/* Waterfall Bars Container */}
      <div className="space-y-2.5">
        {waterfall.map((item) => {
          const leftPercent = Math.min(100, Math.max(0, (item.offsetSec / totalRunSeconds) * 100));
          const widthPercent = Math.min(100 - leftPercent, Math.max(2, (item.durationSec / totalRunSeconds) * 100));

          const isFailed = item.status === 'Failed';
          const isSkipped = item.status === 'Skipped';

          return (
            <div key={item.stage} className="grid grid-cols-12 items-center gap-2 text-xs">
              {/* Stage Name */}
              <div className="col-span-3 sm:col-span-2 font-mono text-[11px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                {item.stage}
              </div>

              {/* Progress Track & Bar */}
              <div className="col-span-7 sm:col-span-9 relative h-5 bg-[#FAF8F5] dark:bg-[#0B0E14] rounded overflow-hidden border border-[#E2E8F0] dark:border-[#262930]">
                {!isSkipped && (
                  <div
                    className={`absolute top-0 bottom-0 rounded-sm transition-all duration-200 flex items-center justify-end pr-1.5 text-[9px] font-mono font-bold ${
                      isFailed
                        ? 'bg-[#E63946] text-white'
                        : 'bg-[#D4AF37] text-[#0A1128]'
                    }`}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      minWidth: '22px',
                    }}
                  >
                    <span>{item.label}</span>
                  </div>
                )}
                {isSkipped && (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                    skipped
                  </div>
                )}
              </div>

              {/* Duration Label */}
              <div className="col-span-2 sm:col-span-1 text-right font-mono tabular-nums text-[#64748B] dark:text-[#94A3B8] text-[10px]">
                {item.durationSec}s
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
