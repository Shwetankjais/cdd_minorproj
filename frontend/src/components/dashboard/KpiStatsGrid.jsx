import React from 'react';
import { Layers, CheckCircle2, XCircle, Percent, TrendingUp, TrendingDown } from 'lucide-react';
import { useThemeAndProject } from '../../context/ThemeAndProjectContext';

export default function KpiStatsGrid() {
  const { isSimulating, simPercent, summaryData } = useThemeAndProject();
  const kpis = summaryData?.kpis || {
    totalBuilds: 14,
    totalBuildsTrend: '+12%',
    successfulBuilds: 10,
    successfulBuildsTrend: '+18%',
    failedBuilds: 3,
    failedBuildsTrend: '-8%',
    successRate: 71.4,
    successRateTrend: '+6.4%',
  };

  const cards = [
    {
      id: 'total',
      title: 'Total Builds',
      value: isSimulating ? kpis.totalBuilds + 1 : kpis.totalBuilds,
      trend: kpis.totalBuildsTrend,
      isPositive: true,
      icon: Layers,
      iconBg: 'bg-[#0A1128]/5 dark:bg-[#0D1B2A] text-[#0A1128] dark:text-[#D4AF37]',
      borderAccent: 'border-l-4 border-l-[#D4AF37]',
    },
    {
      id: 'successful',
      title: 'Successful Builds',
      value: isSimulating && simPercent === 100 ? kpis.successfulBuilds + 1 : kpis.successfulBuilds,
      trend: kpis.successfulBuildsTrend,
      isPositive: true,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      borderAccent: 'border-l-4 border-l-emerald-500',
    },
    {
      id: 'failed',
      title: 'Failed Builds',
      value: kpis.failedBuilds,
      trend: kpis.failedBuildsTrend,
      isPositive: true, // Lower failed builds is positive
      icon: XCircle,
      iconBg: 'bg-[#E63946]/10 dark:bg-[#E63946]/20 text-[#E63946]',
      borderAccent: 'border-l-4 border-l-[#E63946]',
    },
    {
      id: 'rate',
      title: 'Success Rate',
      value: `${kpis.successRate}%`,
      trend: kpis.successRateTrend,
      isPositive: true,
      icon: Percent,
      iconBg: 'bg-[#D4AF37]/15 dark:bg-[#D4AF37]/20 text-[#C5A059] dark:text-[#D4AF37]',
      borderAccent: 'border-l-4 border-l-[#D4AF37]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`p-4 rounded-2xl bg-white dark:bg-[#1C1E24] border border-[#E2E8F0] dark:border-[#323742] shadow-warm-sm hover:shadow-warm-md transition-all duration-200 flex items-center justify-between ${card.borderAccent}`}
          >
            <div>
              <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                {card.title}
              </p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  {card.value}
                </span>
                <span
                  className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                    card.isPositive
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'text-[#E63946] bg-[#E63946]/10'
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
