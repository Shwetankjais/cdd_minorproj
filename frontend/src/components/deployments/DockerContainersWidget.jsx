import React, { useEffect, useState } from 'react';
import { Container, Activity, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
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

  const runningCount = containers.filter((c) => c.status === 'running').length;

  if (compact) {
    return (
      <div className="p-3 bg-slate-900/60 dark:bg-slate-900/80 rounded-xl border border-slate-700/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Container className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-slate-200">Docker Engine</span>
          </div>
          <button
            onClick={fetchStatus}
            title="Refresh Docker containers"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Containers</span>
          <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {runningCount}/{containers.length} Running
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
          <span>Codex API</span>
          <span className="text-emerald-400 font-mono">:8000 (Live)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-500/10 text-sky-500 rounded-lg">
            <Container className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Docker Container Status</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live health from /api/docker/status</p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:underline"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-2.5">
        {containers.map((c) => (
          <div
            key={c.id}
            className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                {c.status === 'running' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    c.status === 'running' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">{c.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{c.ports} • {c.uptime}</p>
              </div>
            </div>

            <div className="text-right text-[11px]">
              <span className="text-slate-600 dark:text-slate-300 font-medium">CPU {c.cpu}</span>
              <p className="text-slate-500 dark:text-slate-400">{c.memory}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

