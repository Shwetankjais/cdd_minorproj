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
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';
import { mockSummary } from '../../services/mockData';

export default function BuildAnalyticsCharts() {
  const [activeTab, setActiveTab] = useState('donut'); // 'donut', 'duration', 'failures'
  const { isDark, summaryData } = useThemeAndProject();

  const statistics = summaryData?.statistics || mockSummary.statistics;
  const { donut, durationTrend, failuresByStage } = statistics;

  // Strict enterprise palette: Emerald for Success, Crimson Red for Failure
  const DONUT_COLORS = ['#10B981', '#E63946'];
  const passRate = summaryData?.kpis?.successRate ?? '71.4';

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1E24] border border-[#E2E8F0] dark:border-[#323742] shadow-warm-sm flex flex-col justify-between h-full transition-all duration-200">
      {/* Card Header & Tabs */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#2D3748] mb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <span>Build Statistics</span>
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Historical performance & stability</p>
          </div>

          <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-[#0D1B2A] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#323742]">
            <button
              onClick={() => setActiveTab('donut')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'donut'
                  ? 'bg-white dark:bg-[#23272F] text-[#0F172A] dark:text-[#F8FAFC] shadow-sm border border-[#E2E8F0] dark:border-[#323742]'
                  : 'text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
              }`}
            >
              Donut
            </button>
            <button
              onClick={() => setActiveTab('duration')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'duration'
                  ? 'bg-white dark:bg-[#23272F] text-[#0F172A] dark:text-[#F8FAFC] shadow-sm border border-[#E2E8F0] dark:border-[#323742]'
                  : 'text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
              }`}
            >
              Trend
            </button>
            <button
              onClick={() => setActiveTab('failures')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'failures'
                  ? 'bg-white dark:bg-[#23272F] text-[#0F172A] dark:text-[#F8FAFC] shadow-sm border border-[#E2E8F0] dark:border-[#323742]'
                  : 'text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
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
                <span className="text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">{passRate}%</span>
                <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider">Success</span>
              </div>
            </div>

            {/* Legend Stats */}
            <div className="space-y-3 w-full sm:w-auto">
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#23272F]/50 border border-[#E2E8F0] dark:border-[#323742]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Successful</span>
                  </div>
                  <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {donut[0]?.value || 10} ({donut[0]?.percentage || '71.4%'})
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#23272F]/50 border border-[#E2E8F0] dark:border-[#323742]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]"></span>
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Failed</span>
                  </div>
                  <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {donut[1]?.value || 3} ({donut[1]?.percentage || '28.6%'})
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] text-right">
                Based on live pipeline runs
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Duration Trend Line Chart (Screenshot 2) */}
        {activeTab === 'duration' && (
          <div className="h-48 w-full pt-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Build time (seconds)</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-[#D4AF37]">
                  <span className="w-2 h-0.5 bg-[#D4AF37]"></span> Total Build
                </span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <span className="w-2 h-0.5 bg-emerald-500"></span> Test Suites
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={durationTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#323742' : '#E2E8F0'} />
                <XAxis dataKey="run" tick={{ fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#23272F' : '#FFFFFF',
                    borderColor: isDark ? '#323742' : '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                />
                <Line type="monotone" dataKey="totalTime" stroke="#D4AF37" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="testTime" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 3: Failures by Stage Bar Chart (Screenshot 2) */}
        {activeTab === 'failures' && (
          <div className="h-48 w-full pt-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Failures by Stage</span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Stage error distribution</span>
            </div>

            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={failuresByStage} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#323742' : '#E2E8F0'} />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#23272F' : '#FFFFFF',
                    borderColor: isDark ? '#323742' : '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                />
                <Bar dataKey="failures" fill="#E63946" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#2D3748] flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
        <span>Average Pipeline Duration: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">2m 46s</strong></span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">99.2% Uptime</span>
      </div>
    </div>
  );
}
