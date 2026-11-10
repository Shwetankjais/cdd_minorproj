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

export default function BuildStatisticsOverviewCard() {
  const [activeTab, setActiveTab] = useState('donut');
  const { isDark, summaryData } = useThemeAndProject();

  const statistics = summaryData?.statistics || mockSummary.statistics;
  const kpis = summaryData?.kpis || mockSummary.kpis;
  const { donut, durationTrend, failuresByStage } = statistics;

  const DONUT_COLORS = ['#10B981', '#E63946'];
  const passRate = summaryData?.kpis?.successRate ?? '89.5';
  const successfulCount = kpis?.successfulBuilds ?? 34;
  const failedCount = kpis?.failedBuilds ?? 3;
  const totalCount = kpis?.totalBuilds ?? (successfulCount + failedCount);

  const successfulPct = totalCount > 0 ? ((successfulCount / totalCount) * 100).toFixed(1) : passRate;
  const failedPct = totalCount > 0 ? ((failedCount / totalCount) * 100).toFixed(1) : (100 - parseFloat(passRate)).toFixed(1);

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#181C24] border border-[#E2E8F0] dark:border-[#2A303C] shadow-lg shadow-black/10 dark:shadow-black/25 flex flex-col justify-between h-full transition-all">
      {/* Header & View Mode Switcher Pills */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E2E8F0] dark:border-[#2A303C]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight font-sans">
            Build Statistics
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans">
            Historical performance & stability
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0E14] border border-[#E2E8F0] dark:border-[#2A303C]">
          {['donut', 'trend', 'failures'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-[#1E232E] text-[#0A1128] dark:text-[#D4AF37] font-semibold shadow-sm'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              {tab === 'donut' ? 'Donut' : tab === 'trend' ? 'Trend' : 'Failures'}
            </button>
          ))}
        </div>
      </div>

      {/* View 1: Donut Chart + Legend */}
      {activeTab === 'donut' && (
        <div className="space-y-4 my-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Donut graphic */}
            <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donut}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {donut.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-bold font-sans tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                  {passRate}%
                </span>
                <span className="text-[10px] font-sans font-semibold tracking-wider uppercase text-[#64748B] dark:text-[#94A3B8]">
                  SUCCESS
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2 flex-1 w-full text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#1E232E] border border-[#E2E8F0]/60 dark:border-[#2A303C]/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">Successful</span>
                </div>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                  {successfulCount} ({successfulPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#1E232E] border border-[#E2E8F0]/60 dark:border-[#2A303C]/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E63946] shadow-sm"></span>
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">Failed</span>
                </div>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                  {failedCount} ({failedPct}%)
                </span>
              </div>

              <p className="text-[10px] text-[#94A3B8] dark:text-[#64748B] italic text-right pt-0.5">
                Based on live pipeline runs
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Duration Trend */}
      {activeTab === 'trend' && (
        <div className="space-y-2 my-auto">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={durationTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2A303C' : '#E2E8F0'} vertical={false} />
                <XAxis dataKey="build" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} fontStyle="mono" tickLine={false} />
                <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} fontStyle="mono" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#181C24' : '#FFFFFF',
                    borderColor: isDark ? '#2A303C' : '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Line type="monotone" dataKey="duration" stroke="#D4AF37" strokeWidth={2.5} dot={{ r: 2.5, fill: '#D4AF37' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* View 3: Failures by Stage */}
      {activeTab === 'failures' && (
        <div className="space-y-2 my-auto">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failuresByStage} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2A303C' : '#E2E8F0'} vertical={false} />
                <XAxis dataKey="stage" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} fontStyle="mono" tickLine={false} />
                <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} fontStyle="mono" tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#181C24' : '#FFFFFF',
                    borderColor: isDark ? '#2A303C' : '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Bar dataKey="failures" fill="#E63946" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom Performance Metrics Bar */}
      <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#2A303C] flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] font-sans">
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">Avg Duration:</span>
          <span className="font-semibold text-[#D4AF37] tabular-nums">2m 46s</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">Uptime:</span>
          <span className="font-semibold text-emerald-500 tabular-nums">99.2%</span>
        </span>
      </div>
    </div>
  );
}
