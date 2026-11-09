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
      iconBg: 'bg-[#FAF8F5] dark:bg-[#1A1E29] text-[#0A1128] dark:text-[#D4AF37]',
    },
    {
      id: 'successful',
      title: 'Successful Builds',
      value: isSimulating && simPercent === 100 ? kpis.successfulBuilds + 1 : kpis.successfulBuilds,
      trend: kpis.successfulBuildsTrend,
      isPositive: true,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'failed',
      title: 'Failed Builds',
      value: kpis.failedBuilds,
      trend: kpis.failedBuildsTrend,
      isPositive: true,
      icon: XCircle,
      iconBg: 'bg-[#E63946]/10 text-[#E63946]',
    },
    {
      id: 'rate',
      title: 'Success Rate',
      value: `${kpis.successRate}%`,
      trend: kpis.successRateTrend,
      isPositive: true,
      icon: Percent,
      iconBg: 'bg-[#D4AF37]/15 text-[#C5A059] dark:text-[#D4AF37]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="p-3 sm:p-3.5 rounded-lg bg-white dark:bg-[#14171F] border border-[#E2E8F0] dark:border-[#262930] flex items-center justify-between transition-colors"
          >
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                {card.title}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                  {card.value}
                </span>
                <span
                  className={`inline-flex items-center text-[10px] font-mono ${
                    card.isPositive ? 'text-emerald-500' : 'text-[#E63946]'
                  }`}
                >
                  {card.trend.startsWith('+') ? (
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />
                  )}
                  {card.trend}
                </span>
              </div>
            </div>

            <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${card.iconBg} border border-[#E2E8F0] dark:border-[#262930]`}>
              <Icon className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
