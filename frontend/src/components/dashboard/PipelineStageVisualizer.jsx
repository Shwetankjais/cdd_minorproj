import React from 'react';
import { Hammer, FlaskConical, Container, Rocket, Check, Loader2 } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';
import RoleHandoffProgressBar from './RoleHandoffProgressBar';

export default function PipelineStageVisualizer() {
  const {
    selectedRun,
    isSimulating,
    simPercent,
  } = useThemeAndProject();

  const stages = [
    { id: 'build', name: 'Build', icon: Hammer, duration: '45s', team: 'CI Team', pctRange: [0, 25] },
    { id: 'test', name: 'Test', icon: FlaskConical, duration: '1m 20s', team: 'QA Testing Team', pctRange: [25, 50] },
    { id: 'docker', name: 'Docker', icon: Container, duration: '38s', team: 'CD Release Team', pctRange: [50, 80] },
    { id: 'deploy', name: 'Deploy', icon: Rocket, duration: '52s', team: 'CD Release Team', pctRange: [80, 100] },
  ];

  const getStageStatus = (stage) => {
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
    <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1E24] border border-[#E2E8F0] dark:border-[#323742] shadow-warm-sm relative overflow-hidden transition-all duration-200">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
            <span>Latest Pipeline Run</span>
            <span className="font-mono text-[#0A1128] dark:text-[#D4AF37] bg-[#FAF8F5] dark:bg-[#23272F] px-2 py-0.5 rounded-lg border border-[#E2E8F0] dark:border-[#323742] text-xs">
              {isSimulating ? '#1288 (Live Simulation)' : selectedRun.id}
            </span>
          </h2>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8] hidden md:inline">
            Commit {selectedRun.commitHash || '121fac2'} on {selectedRun.branch}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSimulating ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              In-Progress ({simPercent}%)
            </span>
          ) : selectedRun.status.includes('Failed') ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30">
              <span className="w-2 h-2 rounded-full bg-[#E63946]"></span>
              {selectedRun.status}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              Success (All Stages Passed)
            </span>
          )}
        </div>
      </div>

      {/* 4 Connected Circular Stage Nodes */}
      <div className="py-4 px-2">
        <div className="grid grid-cols-4 relative items-start">
          {/* Continuous connecting track background centered on the circles */}
          <div className="absolute left-[12.5%] right-[12.5%] top-7 sm:top-8 -translate-y-1/2 h-1 bg-[#E2E8F0] dark:bg-[#2D3748] z-0 pointer-events-none">
            {/* Dynamic progress bar line */}
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-[#0A1128] dark:to-[#F8FAFC] transition-all duration-300 rounded-full"
              style={{
                width: isSimulating ? `${simPercent}%` : selectedRun.status.includes('Failed') ? '35%' : '100%',
              }}
            ></div>
          </div>

          {stages.map((stage) => {
            const status = getStageStatus(stage);
            const Icon = stage.icon;

            const isCompleted = status === 'completed';
            const isRunning = status === 'running';
            const isFailed = status === 'failed';

            return (
              <div key={stage.id} className="flex flex-col items-center relative z-10">
                {/* Circular Node with solid opaque background masking to prevent line overlap */}
                <div className="relative group">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 relative overflow-hidden bg-white dark:bg-[#1C1E24] ${
                      isCompleted
                        ? 'border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20'
                        : isRunning
                        ? 'border-2 border-[#F59E0B] text-[#F59E0B] ring-4 ring-[#F59E0B]/20 animate-pulse'
                        : isFailed
                        ? 'border-2 border-[#E63946] text-[#E63946] shadow-lg shadow-[#E63946]/20'
                        : 'border-2 border-[#E2E8F0] dark:border-[#323742] text-[#94A3B8]'
                    }`}
                  >
                    {/* Inner status tint layer over solid card background */}
                    <div
                      className={`absolute inset-0 rounded-full pointer-events-none ${
                        isCompleted
                          ? 'bg-emerald-500/10 dark:bg-emerald-950/40'
                          : isRunning
                          ? 'bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20'
                          : isFailed
                          ? 'bg-[#E63946]/10 dark:bg-[#E63946]/20'
                          : 'bg-[#FAF8F5] dark:bg-[#23272F]'
                      }`}
                    />

                    {/* Icon centered above the opaque background and tint */}
                    <div className="relative z-10 flex items-center justify-center">
                      {isRunning ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Icon className="w-6 h-6 stroke-[2.2]" />
                      )}
                    </div>
                  </div>

                  {/* Little status badge overlay */}
                  <div className="absolute -top-1 -right-1 z-20">
                    {isCompleted && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    {isFailed && (
                      <div className="w-5 h-5 rounded-full bg-[#E63946] text-white flex items-center justify-center text-[10px] font-bold shadow">
                        ✕
                      </div>
                    )}
                  </div>
                </div>

                {/* Node Label & Duration */}
                <div className="mt-3 text-center">
                  <p className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">{stage.name}</p>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5">
                    {stage.duration}
                  </p>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium hidden sm:block">
                    {stage.team}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Handoff Progress Bar & Pre-Notification Banner */}
      <div className="mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#2D3748]">
        <RoleHandoffProgressBar />
      </div>
    </div>
  );
}
