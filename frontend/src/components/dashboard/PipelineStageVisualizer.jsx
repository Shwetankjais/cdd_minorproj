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

  const STAGE_ORDER = ['build', 'test', 'docker', 'deploy'];

  const isRunFailed = !isSimulating && Boolean(
    selectedRun?.status?.includes('Failed') ||
    selectedRun?.status === 'failure' ||
    selectedRun?.conclusion === 'failure' ||
    selectedRun?.status === 'Failed'
  );

  const getFailedStageId = () => {
    if (!isRunFailed || !selectedRun) return null;

    const status = (selectedRun.status || '').toLowerCase();
    const errorStage = (selectedRun.errorSummary?.failedStage || '').toLowerCase();
    const currentStage = (selectedRun.current_stage || '').toLowerCase();

    if (
      status.includes('build') ||
      errorStage.includes('build') ||
      currentStage.includes('build') ||
      currentStage.includes('checkout') ||
      currentStage.includes('install')
    ) {
      return 'build';
    }
    if (
      status.includes('test') ||
      errorStage.includes('test') ||
      currentStage.includes('test') ||
      (selectedRun.testResults && selectedRun.testResults.failed > 0)
    ) {
      return 'test';
    }
    if (
      status.includes('docker') ||
      errorStage.includes('docker') ||
      currentStage.includes('docker')
    ) {
      return 'docker';
    }
    if (
      status.includes('deploy') ||
      errorStage.includes('deploy') ||
      currentStage.includes('deploy')
    ) {
      return 'deploy';
    }

    if (Array.isArray(selectedRun.waterfall)) {
      const failedStep = selectedRun.waterfall.find(
        (w) => w.status === 'Failed' || (typeof w.label === 'string' && w.label.includes('Failed'))
      );
      if (failedStep) {
        const stepName = (failedStep.stage || '').toLowerCase();
        if (stepName.includes('checkout') || stepName.includes('install') || stepName.includes('build')) return 'build';
        if (stepName.includes('test')) return 'test';
        if (stepName.includes('docker')) return 'docker';
        if (stepName.includes('deploy')) return 'deploy';
      }
    }

    return 'build';
  };

  const failedStageId = getFailedStageId();

  const getStageStatus = (stage) => {
    if (isSimulating) {
      const [minPct, maxPct] = stage.pctRange;
      if (simPercent >= maxPct) return 'completed';
      if (simPercent >= minPct && simPercent < maxPct) return 'running';
      return 'queued';
    }

    if (isRunFailed) {
      const failedIdx = STAGE_ORDER.indexOf(failedStageId);
      const currentIdx = STAGE_ORDER.indexOf(stage.id);

      if (currentIdx < failedIdx) return 'completed';
      if (currentIdx === failedIdx) return 'failed';
      return 'skipped';
    }

    return 'completed';
  };

  const getConnectorWidth = () => {
    if (isSimulating) return `${simPercent}%`;
    if (!isRunFailed) return '100%';
    const failedIdx = STAGE_ORDER.indexOf(failedStageId);
    if (failedIdx <= 0) return '0%';
    if (failedIdx === 1) return '33.33%';
    if (failedIdx === 2) return '66.66%';
    return '100%';
  };

  return (
    <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] relative overflow-hidden transition-colors">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
            <span>Pipeline Execution Flow</span>
            <span className="font-mono text-xs text-[#0F172A] dark:text-[#D4AF37] bg-[#FAF8F5] dark:bg-[#1A1E29] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#262930]">
              {isSimulating ? '#1288 (Live Simulation)' : selectedRun?.id || '#1287'}
            </span>
          </h2>
          <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] hidden md:inline">
            commit: {selectedRun?.commitHash || '121fac2'} ({selectedRun?.branch || 'main'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSimulating ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
              <Loader2 className="w-3 h-3 animate-spin" />
              running ({simPercent}%)
            </span>
          ) : isRunFailed ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E63946]"></span>
              {selectedRun?.status?.includes('Failed at')
                ? selectedRun.status
                : `Failed at ${stages.find((s) => s.id === failedStageId)?.name || 'Build'}`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              <Check className="w-3 h-3 stroke-[2.5]" />
              passed (all stages)
            </span>
          )}
        </div>
      </div>

      {/* 4 Connected Circular Stage Nodes */}
      <div className="py-2 px-1">
        <div className="grid grid-cols-4 relative items-start">
          {/* Continuous connecting track background */}
          <div className="absolute left-[12.5%] right-[12.5%] top-6 sm:top-7 -translate-y-1/2 h-0.5 bg-[#E2E8F0] dark:bg-[#262930] z-0 pointer-events-none">
            <div
              className={`h-full transition-all duration-200 ${
                isRunFailed ? 'bg-[#E63946]' : 'bg-[#D4AF37]'
              }`}
              style={{
                width: getConnectorWidth(),
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
                {/* Circular Node with solid opaque background masking */}
                <div className="relative group">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors relative overflow-hidden bg-white dark:bg-[#14171F] ${
                      isCompleted
                        ? 'border border-emerald-500 text-emerald-500'
                        : isRunning
                        ? 'border border-[#F59E0B] text-[#F59E0B]'
                        : isFailed
                        ? 'border border-[#E63946] text-[#E63946]'
                        : 'border border-[#E2E8F0] dark:border-[#262930] text-[#94A3B8]'
                    }`}
                  >
                    <div
                      className={`absolute inset-0 rounded-full pointer-events-none ${
                        isCompleted
                          ? 'bg-emerald-500/5'
                          : isRunning
                          ? 'bg-[#F59E0B]/5'
                          : isFailed
                          ? 'bg-[#E63946]/5'
                          : ''
                      }`}
                    />

                    <div className="relative z-10 flex items-center justify-center">
                      {isRunning ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5 stroke-[2]" />
                      )}
                    </div>
                  </div>

                  {/* Status indicator pin */}
                  <div className="absolute -top-0.5 -right-0.5 z-20">
                    {isCompleted && (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                    {isFailed && (
                      <div className="w-4 h-4 rounded-full bg-[#E63946] text-white flex items-center justify-center text-[9px] font-mono font-bold">
                        ✕
                      </div>
                    )}
                  </div>
                </div>

                {/* Node Label & Duration */}
                <div className="mt-2 text-center">
                  <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{stage.name}</p>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono tabular-nums mt-0.5">
                    {status === 'skipped' ? 'Skipped' : stage.duration}
                  </p>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] hidden sm:block">
                    {stage.team}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Handoff Progress Bar & Pre-Notification Banner */}
      <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-[#262930]">
        <RoleHandoffProgressBar />
      </div>
    </div>
  );
}
