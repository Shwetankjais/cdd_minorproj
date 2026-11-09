import React from 'react';
import { Users, AlertTriangle, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function RoleHandoffProgressBar() {
  const {
    selectedRun,
    isSimulating,
    simPercent,
    simAlert,
    startSimulation,
    getRoleTeamForPercent,
  } = useThemeAndProject();

  const isRunFailed = !isSimulating && Boolean(
    selectedRun?.status?.includes('Failed') ||
    selectedRun?.status === 'failure' ||
    selectedRun?.conclusion === 'failure'
  );

  const getHaltedPercent = () => {
    if (!isRunFailed || !selectedRun) return 100;
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
      return 25;
    }
    if (
      status.includes('test') ||
      errorStage.includes('test') ||
      currentStage.includes('test') ||
      (selectedRun.testResults && selectedRun.testResults.failed > 0)
    ) {
      return 50;
    }
    if (status.includes('docker') || errorStage.includes('docker') || currentStage.includes('docker')) {
      return 75;
    }
    if (status.includes('deploy') || errorStage.includes('deploy') || currentStage.includes('deploy')) {
      return 90;
    }
    return 25;
  };

  const effectivePercent = isSimulating ? simPercent : isRunFailed ? getHaltedPercent() : 100;
  const currentRole = getRoleTeamForPercent(effectivePercent);

  const segments = [
    {
      id: 'dev',
      role: 'Dev Team',
      task: 'Source Push',
      range: '0–25%',
      min: 0,
      max: 25,
    },
    {
      id: 'ci',
      role: 'CI Team',
      task: 'Build & Compile',
      range: '25–50%',
      min: 25,
      max: 50,
    },
    {
      id: 'qa',
      role: 'QA Testing Team',
      task: 'Pytest / Vitest',
      range: '50–80%',
      min: 50,
      max: 80,
    },
    {
      id: 'cd',
      role: 'CD Release Team',
      task: 'Docker & Deploy',
      range: '80–100%',
      min: 80,
      max: 100,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Role Segments Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#FAF8F5] dark:bg-[#1A1E29] text-[#0A1128] dark:text-[#D4AF37] border border-[#E2E8F0] dark:border-[#262930]">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Cross-Team Role Handoff Lifecycle
            </h3>
            <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
              Active Phase: <span className="text-[#0A1128] dark:text-[#D4AF37] font-semibold">{currentRole.role}</span> ({currentRole.task})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
            {isSimulating
              ? `${simPercent}% Complete`
              : isRunFailed
              ? `${effectivePercent}% (Halted)`
              : '100% Complete'}
          </span>
          {!isSimulating && (
            <button
              onClick={startSimulation}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#0A1128] dark:text-[#D4AF37] transition-colors border border-[#D4AF37]/30"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              Simulate 0% → 100%
            </button>
          )}
        </div>
      </div>

      {/* Segmented Horizontal Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full bg-[#E2E8F0] dark:bg-[#262930] rounded-sm overflow-hidden flex relative">
          <div
            className={`h-full transition-all duration-150 ${
              isRunFailed ? 'bg-[#E63946]' : 'bg-[#D4AF37]'
            }`}
            style={{ width: `${effectivePercent}%` }}
          ></div>
        </div>

        {/* Segment Labels Grid */}
        <div className="grid grid-cols-4 gap-1 text-[11px]">
          {segments.map((seg) => {
            const isCurrent = effectivePercent >= seg.min && (effectivePercent < seg.max || (seg.max === 100 && effectivePercent === 100));
            const isDone = effectivePercent >= seg.max;
            const isHaltedHere = isRunFailed && isCurrent;

            return (
              <div
                key={seg.id}
                className={`p-1.5 rounded-md border transition-colors ${
                  isHaltedHere
                    ? 'border-[#E63946] bg-[#E63946]/10 text-[#0F172A] dark:text-[#F8FAFC] font-semibold'
                    : isCurrent
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0F172A] dark:text-[#F8FAFC] font-semibold'
                    : isDone
                    ? 'border-[#E2E8F0] dark:border-[#262930] bg-[#FAF8F5] dark:bg-[#1A1E29] text-[#64748B] dark:text-[#94A3B8]'
                    : 'border-transparent text-[#94A3B8] dark:text-[#64748B]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono">{seg.range}</span>
                  {isDone && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                </div>
                <p className="truncate font-semibold mt-0.5 text-[11px]">{seg.role}</p>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono truncate hidden sm:block">{seg.task}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-Notification Handoff Alert Banner */}
      {simAlert && (
        <div
          className={`p-2.5 rounded-md border flex items-start gap-2.5 text-xs transition-colors ${
            simAlert.isPreHandoff
              ? 'bg-[#F59E0B]/10 border-[#F59E0B]/50 text-amber-900 dark:text-amber-200'
              : simAlert.level === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              : 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#0F172A] dark:text-[#D4AF37]'
          }`}
        >
          {simAlert.isPreHandoff ? (
            <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs flex items-center gap-1.5">
                {simAlert.isPreHandoff ? 'Role Handoff Pre-Alert (80% Milestone)' : 'Pipeline Status'}
              </span>
              <span className="text-[10px] font-mono">
                {simAlert.team} <ArrowRight className="w-2.5 h-2.5 inline" /> {simAlert.nextTeam}
              </span>
            </div>
            <p className="text-[11px] mt-0.5 leading-snug">{simAlert.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
