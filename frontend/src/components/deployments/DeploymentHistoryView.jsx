import React, { useState } from 'react';
import { Rocket, CheckCircle2, XCircle, RotateCcw, Clock, GitCommit, ArrowRight, ShieldCheck, Filter } from 'lucide-react';
import { mockDeployments } from '../../services/mockData';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function DeploymentHistoryView({ compact = false }) {
  const [deployments, setDeployments] = useState(mockDeployments);
  const [filterHours, setFilterHours] = useState('All'); // '2', '24', 'All'
  const [actionFeedback, setActionFeedback] = useState(null);
  const { openLogsModal } = useThemeAndProject();

  const handleRollback = (version) => {
    setActionFeedback(`Initiating rollback to ${version}... Verification canary deployed.`);
    setTimeout(() => {
      setActionFeedback(`Successfully rolled back cluster release to stable tag ${version}.`);
      setTimeout(() => setActionFeedback(null), 4000);
    }, 1200);
  };

  const handleRedeploy = (version) => {
    setActionFeedback(`Triggering fast redeployment pipeline for ${version}...`);
    setTimeout(() => {
      setActionFeedback(`Redeployment of ${version} completed. Health checks 100% green.`);
      setTimeout(() => setActionFeedback(null), 4000);
    }, 1200);
  };

  const filteredDeployments = deployments.filter((d) => {
    if (filterHours === '2') return d.hoursAgo <= 2;
    if (filterHours === '24') return d.hoursAgo <= 24;
    return true;
  });

  if (compact) {
    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm transition-all duration-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Rocket className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Deployment History</h3>
            </div>
            <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold cursor-pointer hover:underline">
              View All →
            </span>
          </div>

          <div className="space-y-2.5">
            {deployments.slice(0, 4).map((d) => {
              const isDeployed = d.status === 'Deployed';
              return (
                <div
                  key={d.version}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2 w-2">
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          isDeployed ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      ></span>
                    </span>
                    <div>
                      <p className="font-mono font-bold text-slate-900 dark:text-white">{d.version}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {d.runId} • {d.commitHash}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isDeployed
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {d.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{d.relativeTime}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Active Target: <strong>Kubernetes US-East</strong></span>
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Healthy
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm transition-all duration-200">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Production Deployment Audit & Rollback Control
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live releases filtered by recent hours with instant 1-click rollback capability
            </p>
          </div>
        </div>

        {/* Time-Range Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
          <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Time Range:
          </span>
          <button
            onClick={() => setFilterHours('2')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterHours === '2'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Last 1–2 Hours
          </button>
          <button
            onClick={() => setFilterHours('24')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterHours === '24'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Last 24h
          </button>
          <button
            onClick={() => setFilterHours('All')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterHours === 'All'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            All Deployments
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="mb-4 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 text-xs text-sky-800 dark:text-sky-200 flex items-center justify-between animate-pulse">
          <span className="font-medium">{actionFeedback}</span>
          <RotateCcw className="w-3.5 h-3.5 animate-spin text-sky-500" />
        </div>
      )}

      {/* Deployment Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/60">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/80 font-semibold">
              <th className="py-3 px-3.5">Version & Tag</th>
              <th className="py-3 px-3">Run & Commit</th>
              <th className="py-3 px-3">Environment</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDeployments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No deployments found for the selected time window.
                </td>
              </tr>
            ) : (
              filteredDeployments.map((d) => {
                const isDeployed = d.status === 'Deployed';

                return (
                  <tr
                    key={d.version}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="py-3.5 px-3.5 font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isDeployed ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      ></span>
                      {d.version}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      <span className="text-sky-600 dark:text-sky-400">{d.runId}</span> • {d.commitHash}
                    </td>

                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                      {d.environment}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          isDeployed
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isDeployed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {d.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      {d.timestamp} ({d.relativeTime})
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {d.canRollback && (
                          <button
                            onClick={() => handleRollback(d.version)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                            title="Rollback cluster to this release tag"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Rollback
                          </button>
                        )}
                        <button
                          onClick={() => handleRedeploy(d.version)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors border border-sky-500/20"
                        >
                          Redeploy
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

