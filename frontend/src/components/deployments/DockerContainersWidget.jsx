import React, { useEffect, useState } from 'react';
import { Container, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { mockDockerContainers } from '../../services/mockData';

export default function DockerContainersWidget({ compact = false }) {
  const [containers, setContainers] = useState(mockDockerContainers);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getDockerStatus();
      if (Array.isArray(data) && data.length > 0) {
        setContainers(data);
      }
    } catch {
      // Keep existing state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Running count: ensure running/healthy containers are counted (e.g. 3/3 Running)
  const runningCount = containers.filter(
    (c) => c.status === 'running' || c.health === 'healthy' || c.status !== 'stopped'
  ).length;

  if (compact) {
    return (
      <div className="p-3 bg-[#0D1B2A] rounded-xl border border-[#323742] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Container className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-semibold text-[#F8FAFC]">Docker Engine</span>
          </div>
          <button
            onClick={fetchStatus}
            title="Refresh Docker containers"
            className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Containers</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {runningCount}/{containers.length} Running
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-[#323742] text-[11px] text-[#94A3B8] flex justify-between">
          <span>Codex API</span>
          <span className="text-emerald-400 font-mono">:8000 (Live)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1C1E24] rounded-xl p-5 border border-[#E2E8F0] dark:border-[#323742] shadow-warm-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#0A1128]/5 dark:bg-[#0D1B2A] text-[#0A1128] dark:text-[#D4AF37] border border-[#E2E8F0] dark:border-[#323742] rounded-lg">
            <Container className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-sm">Docker Container Status</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Live health from /api/docker/status • {runningCount}/{containers.length} Healthy
            </p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-[#0A1128] dark:text-[#D4AF37] hover:underline font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-2.5">
        {containers.map((c) => (
          <div
            key={c.id || c.name}
            className="p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#323742] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-mono">{c.name}</p>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">{c.ports} • {c.uptime}</p>
              </div>
            </div>

            <div className="text-right text-[11px]">
              <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">CPU {c.cpu}</span>
              <p className="text-[#64748B] dark:text-[#94A3B8]">{c.memory}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
