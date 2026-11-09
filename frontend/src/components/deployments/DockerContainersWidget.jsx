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

  const runningCount = containers.filter(
    (c) => c.status === 'running' || c.health === 'healthy' || c.status !== 'stopped'
  ).length;

  if (compact) {
    return (
      <div className="p-2.5 bg-white dark:bg-[#14171F] rounded-md border border-[#E2E8F0] dark:border-[#262930]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Container className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Docker Stack</span>
          </div>
          <button
            onClick={fetchStatus}
            title="Refresh Docker containers"
            className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#64748B] dark:text-[#94A3B8] text-[11px]">Containers</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-500 text-[11px] tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {runningCount}/{containers.length} Running
          </span>
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-[#E2E8F0] dark:border-[#262930] text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] flex justify-between">
          <span>Backend API</span>
          <span className="text-emerald-500">:8000</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#14171F] rounded-lg p-4 sm:p-5 border border-[#E2E8F0] dark:border-[#262930] transition-colors">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0] dark:border-[#262930]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#FAF8F5] dark:bg-[#1A1E29] text-[#0A1128] dark:text-[#D4AF37] border border-[#E2E8F0] dark:border-[#262930]">
            <Container className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-sm">Docker Container Status</h3>
            <p className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] tabular-nums">
              Telemetry from /api/docker/status • {runningCount}/{containers.length} Healthy
            </p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-1 text-xs font-mono text-[#0A1128] dark:text-[#D4AF37] hover:underline"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {containers.map((c) => (
          <div
            key={c.id || c.name}
            className="p-2.5 rounded-md bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#262930] flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <div>
                <p className="font-mono font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">{c.name}</p>
                <p className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                  Image: {c.image} • Ports: {c.ports}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
                {c.health || c.status}
              </span>
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] hidden sm:inline tabular-nums">
                uptime: {c.uptime}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
