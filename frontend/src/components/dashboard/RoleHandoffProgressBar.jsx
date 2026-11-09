import React from 'react';
import { Users, AlertTriangle, ArrowRight, Play, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function RoleHandoffProgressBar() {
  const {
    isSimulating,
    simPercent,
    simAlert,
    startSimulation,
    getRoleTeamForPercent,
  } = useThemeAndProject();

  const currentRole = getRoleTeamForPercent(simPercent);

  const segments = [
    {
      id: 'dev',
      role: 'Dev Team',
      task: 'Source Push',
      range: '0–25%',
      min: 0,
      max: 25,
      color: 'bg-blue-600',
    },
    {
      id: 'ci',
      role: 'CI Team',
      task: 'Build & Compile',
      range: '25–50%',
      min: 25,
      max: 50,
      color: 'bg-[#0A1128]',
    },
    {
      id: 'qa',
      role: 'QA Testing Team',
      task: 'Pytest / Vitest',
      range: '50–80%',
      min: 50,
      max: 80,
      color: 'bg-emerald-600',
    },
    {
      id: 'cd',
      role: 'CD Release Team',
      task: 'Docker & Deploy',
      range: '80–100%',
      min: 80,
      max: 100,
      color: 'bg-[#D4AF37]',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Role Segments Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#0A1128]/5 dark:bg-[#0D1B2A] text-[#0A1128] dark:text-[#D4AF37] border border-[#E2E8F0] dark:border-[#323742]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">
              Cross-Team Role Handoff Lifecycle
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Active Phase: <strong className="text-[#0A1128] dark:text-[#D4AF37]">{currentRole.role}</strong> ({currentRole.task})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            {simPercent}% Complete
          </span>
          {!isSimulating && (
            <button
              onClick={startSimulation}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#0A1128] dark:text-[#D4AF37] transition-colors border border-[#D4AF37]/30"
            >
              <Play className="w-3 h-3 fill-current" />
              Simulate 0% → 100%
            </button>
          )}
        </div>
      </div>

      {/* Segmented Horizontal Progress Bar */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-[#E2E8F0] dark:bg-[#2D3748] rounded-full overflow-hidden flex relative shadow-inner">
          {/* Fill overlay based on simPercent */}
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-[#0A1128] dark:to-[#F8FAFC] transition-all duration-200 rounded-full"
            style={{ width: `${simPercent}%` }}
          ></div>
        </div>

        {/* Segment Labels Grid */}
        <div className="grid grid-cols-4 gap-1 text-[11px]">
          {segments.map((seg) => {
            const isCurrent = simPercent >= seg.min && (simPercent < seg.max || (seg.max === 100 && simPercent === 100));
            const isDone = simPercent >= seg.max;

            return (
              <div
                key={seg.id}
                className={`p-1.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 text-[#0F172A] dark:text-[#F8FAFC] font-semibold shadow-sm ring-1 ring-[#D4AF37]/40'
                    : isDone
                    ? 'border-[#E2E8F0] dark:border-[#323742] bg-[#FAF8F5] dark:bg-[#23272F]/60 text-[#64748B] dark:text-[#94A3B8]'
                    : 'border-transparent text-[#94A3B8] dark:text-[#64748B]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono">{seg.range}</span>
                  {isDone && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                </div>
                <p className="truncate font-bold mt-0.5">{seg.role}</p>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate hidden sm:block">{seg.task}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-Notification Handoff Alert Banner */}
      {simAlert && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
            simAlert.isPreHandoff
              ? 'bg-[#F59E0B]/10 border-2 border-[#F59E0B]/50 text-amber-950 dark:text-amber-100 animate-pulse-slow shadow-lg shadow-[#F59E0B]/10'
              : simAlert.level === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
              : 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#0A1128] dark:text-[#D4AF37]'
          }`}
        >
          {simAlert.isPreHandoff ? (
            <div className="p-1.5 rounded-lg bg-[#F59E0B] text-white flex-shrink-0 animate-bounce">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-emerald-500 text-white flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                {simAlert.isPreHandoff ? (
                  <>
                    <span>Heads-Up Role Handoff Pre-Alert</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F59E0B]/20 text-[#B45309] dark:text-amber-200 font-mono border border-[#F59E0B]/30 font-bold">
                      80% Milestone Trigger
                    </span>
                  </>
                ) : (
                  <span>Pipeline Status</span>
                )}
              </h4>
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                {simAlert.team} <ArrowRight className="w-3 h-3 inline" /> {simAlert.nextTeam}
              </span>
            </div>
            <p className="text-xs mt-1 font-medium leading-relaxed">{simAlert.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
