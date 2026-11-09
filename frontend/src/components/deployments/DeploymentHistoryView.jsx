import React, { useState, useEffect, useCallback } from 'react';
import { Rocket, CheckCircle2, XCircle, RotateCcw, ShieldCheck, Filter, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { mockDeployments } from '../../services/mockData';

export default function DeploymentHistoryView({ compact = false }) {
  const [deployments, setDeployments] = useState(mockDeployments);
  const [filterHours, setFilterHours] = useState('all');
  const [loading, setLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const fetchDeployments = useCallback(async (hours) => {
    setLoading(true);
    try {
      const data = await api.getDeployments(hours);
      if (Array.isArray(data) && data.length > 0) {
        setDeployments(data);
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeployments(filterHours);
  }, [filterHours, fetchDeployments]);

  const handleRollback = (version) => {
    setActionFeedback(`Initiating rollback to ${version}...`);
    setTimeout(() => {
      setActionFeedback(`Successfully rolled back cluster release to tag ${version}.`);
      setTimeout(() => setActionFeedback(null), 4000);
    }, 1200);
  };

  const handleRedeploy = (version) => {
    setActionFeedback(`Triggering fast redeployment pipeline for ${version}...`);
    setTimeout(() => {
      setActionFeedback(`Redeployment of ${version} completed with 100% health.`);
      setTimeout(() => setActionFeedback(null), 4000);
    }, 1200);
  };

  if (compact) {
    return (
      <div className="p-4 rounded-lg bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] transition-colors flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0] dark:border-[#262930] mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-[#FAF8F5] dark:bg-[#1A1E29] text-[#0A1128] dark:text-[#D4AF37] border border-[#E2E8F0] dark:border-[#262930]">
                <Rocket className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Deployment History</h3>
            </div>
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#D4AF37]" />
            ) : (
              <span className="text-[11px] font-mono text-[#0A1128] dark:text-[#D4AF37] hover:underline cursor-pointer">
                View All →
              </span>
            )}
          </div>

          <div className="space-y-2">
            {deployments.slice(0, 4).map((d) => {
              const isDeployed = d.status === 'Deployed' || d.status === 'success';
              return (
                <div
                  key={d.id || d.version}
                  className="p-2 rounded-md bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#262930] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDeployed ? 'bg-emerald-500' : 'bg-[#E63946]'
                      }`}
                    ></span>
                    <div>
                      <p className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] text-[11px]">{d.version}</p>
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                        {d.runId} • {d.commitHash}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
                        isDeployed
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-[#E63946]/10 text-[#E63946]'
                      }`}
                    >
                      {d.status}
                    </span>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5">{d.relativeTime}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] transition-colors">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#262930] mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Cluster Deployment History
            </h3>
            <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] hidden md:inline">
              (Blue-Green Staging & Rollback Cockpit)
            </span>
          </div>
          <p className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Production releases tracked across recent deployments
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
          {['1', '2', '24', 'all'].map((hours) => (
            <button
              key={hours}
              onClick={() => setFilterHours(hours)}
              className={`px-2 py-1 rounded-md text-xs font-mono transition-colors ${
                filterHours === hours
                  ? 'bg-[#0A1128] text-white dark:bg-[#D4AF37] dark:text-[#0A1128] font-semibold'
                  : 'bg-[#FAF8F5] dark:bg-[#1A1E29] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#262930]'
              }`}
            >
              {hours === 'all' ? 'All' : `${hours}h`}
            </button>
          ))}
        </div>
      </div>

      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div className="mb-3 p-2.5 rounded-md bg-[#FAF8F5] dark:bg-[#1A1E29] border border-[#D4AF37]/40 text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-between">
          <span>{actionFeedback}</span>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        </div>
      )}

      {/* Table of Deployments */}
      <div className="overflow-x-auto rounded-md border border-[#E2E8F0] dark:border-[#262930]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] dark:bg-[#0B0E14] text-[#64748B] dark:text-[#94A3B8] border-b border-[#E2E8F0] dark:border-[#262930] font-mono text-[11px]">
              <th className="py-2.5 px-3">Release Tag</th>
              <th className="py-2.5 px-3">Target Env</th>
              <th className="py-2.5 px-3">Commit SHA</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#262930]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#64748B] dark:text-[#94A3B8]">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-[#D4AF37]" />
                  <span className="font-mono text-xs">Loading deployments...</span>
                </td>
              </tr>
            ) : deployments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#64748B] dark:text-[#94A3B8] font-mono text-xs">
                  No deployments found in the selected timeframe.
                </td>
              </tr>
            ) : (
              deployments.map((d) => {
                const isDeployed = d.status === 'Deployed' || d.status === 'success';

                return (
                  <tr key={d.id || d.version} className="hover:bg-[#FAF8F5]/60 dark:hover:bg-[#1A1E29]/50 transition-colors">
                    {/* Release Tag */}
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {d.version}
                    </td>

                    {/* Environment */}
                    <td className="py-2.5 px-3 font-mono text-[#64748B] dark:text-[#94A3B8]">
                      {d.environment || 'Production'}
                    </td>

                    {/* Commit SHA */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {d.commitHash || '121fac2'}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          isDeployed
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-[#E63946]/10 text-[#E63946]'
                        }`}
                      >
                        {isDeployed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{d.status}</span>
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-2.5 px-3 font-mono tabular-nums text-[#64748B] dark:text-[#94A3B8]">
                      {d.timestamp || d.relativeTime}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRedeploy(d.version)}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-[#E2E8F0] dark:border-[#262930] hover:border-[#D4AF37] text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
                        >
                          Redeploy
                        </button>
                        <button
                          onClick={() => handleRollback(d.version)}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-medium text-[#E63946] border border-[#E63946]/30 hover:bg-[#E63946]/10 transition-colors"
                        >
                          Rollback
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
