import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, ChevronDown } from 'lucide-react';
import { mockSummary } from '../../services/mockData';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function BuildAnalyticsCharts() {
  const [activeTab, setActiveTab] = useState('donut'); // 'donut', 'duration', 'failures'
  const [range, setRange] = useState('14');
  const { isDark } = useThemeAndProject();

  const { donut, durationTrend, failuresByStage } = mockSummary.statistics;

  const DONUT_COLORS = ['#10B981', '#F43F5E'];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between h-full transition-all duration-200">
      {/* Card Header & Tabs */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/70 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Build Statistics</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Historical performance & stability</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-lg border border-slate-200/70 dark:border-slate-700/50">
            <button
              onClick={() => setActiveTab('donut')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'donut'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Donut
            </button>
            <button
              onClick={() => setActiveTab('duration')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'duration'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Trend
            </button>
            <button
              onClick={() => setActiveTab('failures')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'failures'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Failures
            </button>
          </div>
        </div>

        {/* Tab 1: Donut Chart View (Screenshot 1) */}
        {activeTab === 'donut' && (
          <div className="flex flex-col sm:flex-row items-center justify-around py-2 gap-4">
            {/* Center Donut */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donut}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {donut.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Percentage Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">81.3%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Success</span>
              </div>
            </div>

            {/* Legend Stats */}
            <div className="space-y-3 w-full sm:w-auto">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Successful</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">104 (81.3%)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Failed</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">24 (18.7%)</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-right">
                Based on last 14 pipeline runs
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Duration Trend Line Chart (Screenshot 2) */}
        {activeTab === 'duration' && (
          <div className="h-48 w-full pt-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-500 dark:text-slate-400">Build time (seconds)</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-sky-500">
                  <span className="w-2 h-0.5 bg-sky-500"></span> Total Build
                </span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <span className="w-2 h-0.5 bg-emerald-500"></span> Test Suites
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={durationTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis dataKey="run" tick={{ fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#CBD5E1',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="totalTime" stroke="#38BDF8" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="testTime" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 3: Failures by Stage Bar Chart (Screenshot 2) */}
        {activeTab === 'failures' && (
          <div className="h-48 w-full pt-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-500 dark:text-slate-400">Failures by Stage</span>
              <span className="text-[11px] text-slate-400">Total 4 failures recorded</span>
            </div>

            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={failuresByStage} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#CBD5E1',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="failures" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>Average Pipeline Duration: <strong>2m 32s</strong></span>
        <span className="text-emerald-500 font-medium">99.2% Uptime</span>
      </div>
    </div>
  );
}

