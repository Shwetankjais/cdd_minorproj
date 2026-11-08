import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function WaterfallTimeline() {
  const { selectedRun, isSimulating, simPercent } = useThemeAndProject();

  const waterfall = selectedRun.waterfall || [
    { stage: 'Checkout', offsetSec: 0, durationSec: 7, label: '7s', status: 'Passed' },
    { stage: 'Install', offsetSec: 7, durationSec: 44, label: '44s', status: 'Passed' },
    { stage: 'Test', offsetSec: 51, durationSec: 46, label: '46s', status: 'Passed' },
    { stage: 'Build', offsetSec: 97, durationSec: 45, label: '45s', status: 'Passed' },
    { stage: 'Docker', offsetSec: 142, durationSec: 56, label: '56s', status: 'Passed' },
    { stage: 'Deploy', offsetSec: 198, durationSec: 35, label: '35s', status: 'Passed' },
  ];

  const totalRunSeconds = 233; // ~3m 53s total scale

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm transition-all duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Waterfall Execution Timeline</span>
              <span className="font-mono text-xs text-sky-600 dark:text-sky-400">({selectedRun.id})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stage scheduling offsets and wall-clock execution durations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
            {selectedRun.duration || '3m 35s total'}
          </span>
        </div>
      </div>

      {/* Outcome notification badge */}
      {selectedRun.status === 'Passed' ? (
        <div className="p-3 mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Everything passed. All stages finished and the new version is live in production.</span>
        </div>
      ) : (
        <div className="p-3 mb-5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>Pipeline halted prematurely due to stage failure in {selectedRun.status}. Subsequent stages skipped.</span>
        </div>
      )}

      {/* Waterfall Bars Container */}
      <div className="space-y-3.5">
        {waterfall.map((item) => {
          const leftPercent = Math.min(100, Math.max(0, (item.offsetSec / totalRunSeconds) * 100));
          const widthPercent = Math.min(100 - leftPercent, Math.max(2, (item.durationSec / totalRunSeconds) * 100));

          const isFailed = item.status === 'Failed';
          const isSkipped = item.status === 'Skipped';

          return (
            <div key={item.stage} className="grid grid-cols-12 items-center gap-3 text-xs">
              {/* Stage Name */}
              <div className="col-span-3 sm:col-span-2 font-semibold text-slate-700 dark:text-slate-300">
                {item.stage}
              </div>

              {/* Progress Track & Bar */}
              <div className="col-span-7 sm:col-span-9 relative h-6 bg-slate-100 dark:bg-slate-900/60 rounded-lg overflow-hidden border border-slate-200/60 dark:border-slate-800">
                {!isSkipped && (
                  <div
                    className={`absolute top-0 bottom-0 rounded-md transition-all duration-300 flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-sm ${
                      isFailed
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-blue-600 to-sky-500'
                    }`}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      minWidth: '24px',
                    }}
                  >
                    <span className="drop-shadow">{item.label}</span>
                  </div>
                )}
                {isSkipped && (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 font-mono italic">
                    Skipped
                  </div>
                )}
              </div>

              {/* Duration Label */}
              <div className="col-span-2 sm:col-span-1 text-right font-mono font-medium text-slate-500 dark:text-slate-400 text-[11px]">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Axis Legend */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[10px] font-mono text-slate-400">
        <span>0s</span>
        <span>1m 00s</span>
        <span>2m 00s</span>
        <span>3m 00s</span>
        <span>3m 53s</span>
      </div>
    </div>
  );
}

