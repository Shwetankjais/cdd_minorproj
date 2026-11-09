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

export default function BuildAnalyticsCharts({ fullGrid = true }) {
  const [activeTab, setActiveTab] = useState('all');
  const { isDark, summaryData } = useThemeAndProject();

  const statistics = summaryData?.statistics || mockSummary.statistics;
  const { donut, durationTrend, failuresByStage } = statistics;

  const DONUT_COLORS = ['#10B981', '#E63946'];
  const passRate = summaryData?.kpis?.successRate ?? '71.4';

  return (
    <div className="space-y-4">
      {/* 3 Single-Screen Grid Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Card 1: Donut Pass Rate */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] flex flex-col justify-between">
          <div className="pb-2 border-b border-[#E2E8F0] dark:border-[#262930] mb-3">
            <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Pass Rate Distribution</h3>
            <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">Last 14 pipeline runs</p>
          </div>

          <div className="relative h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donut}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
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
              <span className="text-xl font-bold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                {passRate}%
              </span>
              <span className="text-[10px] font-mono uppercase text-[#64748B] dark:text-[#94A3B8]">Success</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#262930] flex justify-around text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[#64748B] dark:text-[#94A3B8]">Passing:</span>
              <span className="font-semibold tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">10</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E63946]"></span>
              <span className="text-[#64748B] dark:text-[#94A3B8]">Failing:</span>
              <span className="font-semibold tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">4</span>
            </div>
          </div>
        </div>

        {/* Card 2: Build Duration Line Chart */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] flex flex-col justify-between">
          <div className="pb-2 border-b border-[#E2E8F0] dark:border-[#262930] mb-3">
            <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Build Duration Trend</h3>
            <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">Execution wall-clock seconds</p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={durationTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#262930' : '#E2E8F0'} vertical={false} />
                <XAxis dataKey="build" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} fontStyle="mono" tickLine={false} />
                <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} fontStyle="mono" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#14171F' : '#FFFFFF',
                    borderColor: isDark ? '#262930' : '#E2E8F0',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Line type="monotone" dataKey="duration" stroke="#D4AF37" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#262930] flex justify-between text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
            <span>Avg: 2m 46s</span>
            <span>Target: &lt; 3m 30s</span>
          </div>
        </div>

        {/* Card 3: Failures by Stage */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] flex flex-col justify-between">
          <div className="pb-2 border-b border-[#E2E8F0] dark:border-[#262930] mb-3">
            <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Stage Failure Frequency</h3>
            <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">Failed build distribution by phase</p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failuresByStage} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#262930' : '#E2E8F0'} vertical={false} />
                <XAxis dataKey="stage" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} fontStyle="mono" tickLine={false} />
                <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} fontStyle="mono" tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#14171F' : '#FFFFFF',
                    borderColor: isDark ? '#262930' : '#E2E8F0',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="failures" fill="#E63946" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#262930] flex justify-between text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
            <span>Highest: Install / Test</span>
            <span className="text-[#E63946]">4 failures</span>
          </div>
        </div>
      </div>
    </div>
  );
}
