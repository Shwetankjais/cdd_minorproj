import React from 'react';
import { Hammer, FlaskConical, Container, Rocket, Check, Loader2, Clock, Sparkles } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';
import RoleHandoffProgressBar from './RoleHandoffProgressBar';

export default function PipelineStageVisualizer() {
  const {
    selectedRun,
    isSimulating,
    simPercent,
    simStage,
    startSimulation,
  } = useThemeAndProject();

  const stages = [
    { id: 'build', name: 'Build', icon: Hammer, duration: '45s', team: 'CI Team', pctRange: [0, 25] },
    { id: 'test', name: 'Test', icon: FlaskConical, duration: '1m 20s', team: 'QA Testing Team', pctRange: [25, 50] },
    { id: 'docker', name: 'Docker', icon: Container, duration: '38s', team: 'CD Release Team', pctRange: [50, 80] },
    { id: 'deploy', name: 'Deploy', icon: Rocket, duration: '52s', team: 'CD Release Team', pctRange: [80, 100] },
  ];

  const getStageStatus = (stage, index) => {
    if (!isSimulating) {
      if (selectedRun.status === 'Failed at Build') {
        if (stage.id === 'build') return 'failed';
        return 'skipped';
      }
      if (selectedRun.status === 'Failed at Test') {
        if (stage.id === 'build') return 'completed';
        if (stage.id === 'test') return 'failed';
        return 'skipped';
      }
      return 'completed';
    }

    // During live simulation
    const [minPct, maxPct] = stage.pctRange;
    if (simPercent >= maxPct) return 'completed';
    if (simPercent >= minPct && simPercent < maxPct) return 'running';
    return 'queued';
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm relative overflow-hidden transition-all duration-200">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Latest Pipeline Run</span>
            <span className="font-mono text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800/40 text-xs">
              {isSimulating ? '#1288 (Live Simulation)' : selectedRun.id}
            </span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">
            Commit {selectedRun.commitHash || '121fac2'} on {selectedRun.branch}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSimulating ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              In-Progress ({simPercent}%)
            </span>
          ) : selectedRun.status.includes('Failed') ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {selectedRun.status}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              Success (All Stages Passed)
            </span>
          )}
        </div>
      </div>

      {/* 4 Connected Circular Stage Nodes */}
      <div className="py-4 px-2">
        <div className="grid grid-cols-4 relative items-center">
          {/* Continuous connecting track background */}
          <div className="absolute left-[12.5%] right-[12.5%] top-1/2 -translate-y-6 h-1 bg-slate-200 dark:bg-slate-700 -z-0">
            {/* Dynamic progress bar line */}
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-600 transition-all duration-300 rounded-full"
              style={{
                width: isSimulating ? `${simPercent}%` : selectedRun.status.includes('Failed') ? '35%' : '100%',
              }}
            ></div>
          </div>

          {stages.map((stage, idx) => {
            const status = getStageStatus(stage, idx);
            const Icon = stage.icon;

            const isCompleted = status === 'completed';
            const isRunning = status === 'running';
            const isFailed = status === 'failed';
            const isQueued = status === 'queued' || status === 'skipped';

            return (
              <div key={stage.id} className="flex flex-col items-center z-10">
                {/* Circular Node */}
                <div className="relative group">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/20'
                        : isRunning
                        ? 'bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-400 text-amber-400 ring-4 ring-amber-400/20 animate-pulse'
                        : isFailed
                        ? 'bg-rose-500/10 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-500 shadow-lg shadow-rose-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    {isRunning ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    )}
                  </div>

                  {/* Little status badge overlay */}
                  <div className="absolute -top-1 -right-1">
                    {isCompleted && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    {isFailed && (
                      <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow">
                        ✕
                      </div>
                    )}
                  </div>
                </div>

                {/* Node Label & Duration */}
                <div className="mt-3 text-center">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{stage.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {stage.duration}
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
                    {stage.team}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Handoff Progress Bar & Pre-Notification Banner */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700/80">
        <RoleHandoffProgressBar />
      </div>
    </div>
  );
}

