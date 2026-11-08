import React from 'react';
import { Layers, CheckCircle2, XCircle, Percent, TrendingUp, TrendingDown } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';
import { mockSummary } from '../../services/mockData';

export default function KpiStatsGrid() {
  const { isSimulating, simPercent } = useThemeAndProject();
  const kpis = mockSummary.kpis;

  const cards = [
    {
      id: 'total',
      title: 'Total Builds',
      value: isSimulating ? kpis.totalBuilds + 1 : kpis.totalBuilds,
      trend: kpis.totalBuildsTrend,
      isPositive: true,
      icon: Layers,
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500',
      borderAccent: 'border-emerald-500/20',
    },
    {
      id: 'successful',
      title: 'Successful Builds',
      value: isSimulating && simPercent === 100 ? kpis.successfulBuilds + 1 : kpis.successfulBuilds,
      trend: kpis.successfulBuildsTrend,
      isPositive: true,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-400',
      borderAccent: 'border-emerald-500/20',
    },
    {
      id: 'failed',
      title: 'Failed Builds',
      value: kpis.failedBuilds,
      trend: kpis.failedBuildsTrend,
      isPositive: true, // Lower failed builds is positive
      icon: XCircle,
      iconBg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-500',
      borderAccent: 'border-rose-500/20',
    },
    {
      id: 'rate',
      title: 'Success Rate',
      value: `${kpis.successRate}%`,
      trend: kpis.successRateTrend,
      isPositive: true,
      icon: Percent,
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-sky-400',
      borderAccent: 'border-sky-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between ${card.borderAccent}`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.title}
              </p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </span>
                <span
                  className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                    card.isPositive
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                  }`}
                >
                  {card.trend.startsWith('+') ? (
                    <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                  )}
                  {card.trend}
                </span>
              </div>
            </div>

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
              <Icon className="w-6 h-6 stroke-[2]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

