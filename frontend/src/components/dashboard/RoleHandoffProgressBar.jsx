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
      color: 'bg-blue-500',
      activeColor: 'from-blue-600 to-sky-500',
    },
    {
      id: 'ci',
      role: 'CI Team',
      task: 'Build & Compile',
      range: '25–50%',
      min: 25,
      max: 50,
      color: 'bg-sky-500',
      activeColor: 'from-sky-500 to-teal-500',
    },
    {
      id: 'qa',
      role: 'QA Testing Team',
      task: 'Pytest / Vitest',
      range: '50–80%',
      min: 50,
      max: 80,
      color: 'bg-emerald-500',
      activeColor: 'from-teal-500 to-emerald-500',
    },
    {
      id: 'cd',
      role: 'CD Release Team',
      task: 'Docker & Deploy',
      range: '80–100%',
      min: 80,
      max: 100,
      color: 'bg-indigo-600',
      activeColor: 'from-emerald-500 to-indigo-600',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Role Segments Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Cross-Team Role Handoff Lifecycle
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Active Phase: <strong className="text-sky-600 dark:text-sky-400">{currentRole.role}</strong> ({currentRole.task})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            {simPercent}% Complete
          </span>
          {!isSimulating && (
            <button
              onClick={startSimulation}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors border border-sky-500/20"
            >
              <Play className="w-3 h-3 fill-current" />
              Simulate 0% → 100%
            </button>
          )}
        </div>
      </div>

      {/* Segmented Horizontal Progress Bar */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden flex relative shadow-inner">
          {/* Fill overlay based on simPercent */}
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-emerald-500 to-blue-600 transition-all duration-200 rounded-full"
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
                    ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold shadow-sm ring-1 ring-sky-400/30'
                    : isDone
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                    : 'border-transparent text-slate-400 dark:text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono">{seg.range}</span>
                  {isDone && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                </div>
                <p className="truncate font-bold mt-0.5">{seg.role}</p>
                <p className="text-[10px] text-slate-400 truncate hidden sm:block">{seg.task}</p>
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
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-200 animate-pulse-slow shadow-lg shadow-amber-500/5'
              : simAlert.level === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
              : 'bg-sky-500/10 border-sky-500/40 text-sky-800 dark:text-sky-200'
          }`}
        >
          {simAlert.isPreHandoff ? (
            <div className="p-1.5 rounded-lg bg-amber-500 text-white flex-shrink-0 animate-bounce">
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
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono">
                      80% Milestone Trigger
                    </span>
                  </>
                ) : (
                  <span>Pipeline Status</span>
                )}
              </h4>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
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

