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
      iconBg: 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30',
    },
    {
      id: 'successful',
      title: 'Successful Builds',
      value: isSimulating && simPercent === 100 ? kpis.successfulBuilds + 1 : kpis.successfulBuilds,
      trend: kpis.successfulBuildsTrend,
      isPositive: true,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'failed',
      title: 'Failed Builds',
      value: kpis.failedBuilds,
      trend: kpis.failedBuildsTrend,
      isPositive: false,
      icon: XCircle,
      iconBg: 'bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/30',
    },
    {
      id: 'rate',
      title: 'Success Rate',
      value: `${kpis.successRate}%`,
      trend: kpis.successRateTrend,
      isPositive: true,
      icon: Percent,
      iconBg: 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#181C24] border border-[#E2E8F0] dark:border-[#2A303C] shadow-lg shadow-black/10 dark:shadow-black/25 flex items-center justify-between transition-all"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                {card.title}
              </p>
              <div className="flex items-baseline gap-2.5 mt-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                  {card.value}
                </span>
                <span
                  className={`inline-flex items-center text-xs font-semibold ${
                    card.isPositive ? 'text-emerald-500' : 'text-[#E63946]'
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

            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${card.iconBg}`}>
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
