/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  Business,
  Receipt,
  SavingsOpportunity,
} from '../types/index.ts';
import {
  calculateSpendingSummary,
  formatINR,
  generateMonthlySpendingSeries,
} from '../utils/finance.ts';
import { CurrencyDisplay } from '../components/CurrencyDisplay.tsx';
import {
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Receipt as ReceiptIcon,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface HomeViewProps {
  business: Business | null;
  receipts: Receipt[];
  opportunities: SavingsOpportunity[];
  onNavigate: (route: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  business,
  receipts,
  opportunities,
  onNavigate,
}) => {
  // Time-appropriate greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const ownerName = business?.ownerName || 'Business Owner';
  const businessName = business?.name || 'Green Basket Stores';

  // Derived spending summary & 6-month chart series
  const summary = useMemo(() => {
    return calculateSpendingSummary(receipts, opportunities);
  }, [receipts, opportunities]);

  const chartData = useMemo(() => {
    return generateMonthlySpendingSeries(receipts, opportunities);
  }, [receipts, opportunities]);

  // Priority insights derived from real data
  const insights = useMemo(() => {
    const list = [];
    const meaningfulOpps = opportunities.filter((o) => o.state === 'meaningful_opportunity');

    if (meaningfulOpps.length > 0) {
      const topOpp = meaningfulOpps[0];
      list.push({
        id: 'opp-top',
        type: 'opportunity',
        title: `${topOpp.productName} — Potential Price Improvement`,
        description: `Your recorded unit price (${formatINR(topOpp.currentRecordedPriceMinor)}) is above the regional benchmark (${formatINR(topOpp.benchmarkMedianPriceMinor)}). Potential difference: ${formatINR(topOpp.estimatedPotentialSavingsMinor)} at typical volumes.`,
        actionLabel: 'Review Benchmark',
        route: '/save-more',
      });
    }

    if (summary.monthOverMonthChangePercentage !== 0) {
      const isUp = summary.monthOverMonthChangePercentage > 0;
      list.push({
        id: 'mom-trend',
        type: isUp ? 'alert' : 'positive',
        title: `Purchasing Spend ${isUp ? 'Increased' : 'Decreased'} by ${Math.abs(summary.monthOverMonthChangePercentage)}%`,
        description: `Total recorded purchasing this month is ${formatINR(summary.currentMonthSpendingMinor)} compared with ${formatINR(summary.previousMonthSpendingMinor)} in the preceding month.`,
        actionLabel: 'View in Ledger',
        route: '/ledger',
      });
    }

    const competitive = opportunities.find((o) => o.state === 'already_competitive');
    if (competitive) {
      list.push({
        id: 'competitive-tea',
        type: 'positive',
        title: `${competitive.productName} is Purchasing Competitively`,
        description: `Your current unit price is aligned with or better than the regional benchmark (${formatINR(competitive.benchmarkMedianPriceMinor)}).`,
        actionLabel: 'Compare Category',
        route: '/save-more',
      });
    }

    return list.slice(0, 3);
  }, [opportunities, summary]);

  // Recent 5 receipts
  const recentReceipts = useMemo(() => {
    return receipts.slice(0, 5);
  }, [receipts]);

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* 1. Header Greeting */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#25382D]">
            {greeting}, {ownerName}
          </h1>
          <p className="text-sm text-[#64756A] mt-0.5">
            {businessName} · Here is how your purchasing is performing this month.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/scan')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#476C58] text-white text-sm font-medium hover:bg-[#3a5948] transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upload New Receipt</span>
        </button>
      </section>

      {/* 2. Primary Spending Card */}
      <section className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64756A]">
              Monthly Purchasing Overview · October 2026
            </span>

            <div className="flex items-baseline gap-3 flex-wrap">
              <CurrencyDisplay
                amountMinor={summary.currentMonthSpendingMinor}
                className="text-3xl sm:text-4xl font-bold text-[#25382D] tracking-tight"
              />
              <span className="text-xs text-[#64756A]">actual recorded spend</span>
            </div>

            {summary.hasEnoughBenchmarkData && summary.benchmarkSpendingMinor !== null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#E2E7E2]">
                <div className="bg-[#F7F8F5] rounded-xl p-3.5 border border-[#E2E7E2]">
                  <span className="text-xs text-[#64756A] block">Estimated Competitive Benchmark</span>
                  <CurrencyDisplay
                    amountMinor={summary.benchmarkSpendingMinor}
                    className="text-xl font-bold text-[#25382D] mt-0.5 block"
                  />
                  <span className="text-[11px] text-[#64756A] mt-1 block">
                    Derived from 5+ comparable regional businesses
                  </span>
                </div>

                <div className="bg-[#EDF7F1] rounded-xl p-3.5 border border-[#CDE8D8]">
                  <span className="text-xs text-[#2E7D4F] font-medium block">Potential Price Difference</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <CurrencyDisplay
                      amountMinor={summary.potentialDifferenceMinor || 0}
                      className="text-xl font-bold text-[#2E7D4F]"
                    />
                    {summary.differencePercentage !== null && summary.differencePercentage > 0 && (
                      <span className="text-xs font-semibold text-[#2E7D4F]">
                        ({summary.differencePercentage}%)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#2E7D4F] mt-1 block">
                    Potential opportunity, not guaranteed savings
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#FDF8F0] border border-[#F3E2CE] rounded-xl p-3.5 text-xs text-[#C0772C]">
                <span className="font-semibold block mb-0.5">Not enough comparable purchasing data yet</span>
                Pricewise requires at least 5 independent businesses per category to calculate reliable regional benchmarks.
              </div>
            )}

            <p className="text-xs text-[#64756A] leading-relaxed">
              {summary.benchmarkExplanation}
            </p>
          </div>

          {/* Quick Action Box */}
          <div className="lg:w-72 bg-[#F7F8F5] rounded-xl p-4 border border-[#E2E7E2] space-y-3 shrink-0">
            <span className="text-xs font-semibold text-[#25382D] block">
              Purchasing Health Check
            </span>
            <ul className="text-xs text-[#64756A] space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
                <span>6 months of verified purchasing history</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
                <span>{receipts.length} itemized receipts in ledger</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
                <span>Collective Benchmarking opted-in</span>
              </li>
            </ul>
            <button
              onClick={() => onNavigate('/save-more')}
              className="w-full mt-2 inline-flex items-center justify-between px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#E2E7E2] text-xs font-medium text-[#25382D] hover:bg-[#DCE7DD] transition-colors cursor-pointer"
            >
              <span>Explore Benchmark Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#476C58]" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Spending Trend Chart (6 Months) */}
      <section className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#25382D]">
              Purchasing Expenditure Trend (Last 6 Months)
            </h2>
            <p className="text-xs text-[#64756A] mt-0.5">
              Actual recorded monthly purchases vs estimated competitive benchmark
            </p>
          </div>
          <div className="text-xs text-[#64756A] font-medium bg-[#F7F8F5] px-3 py-1.5 rounded-lg border border-[#E2E7E2] self-start sm:self-auto">
            Currency: INR (₹)
          </div>
        </div>

        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E7E2" vertical={false} />
              <XAxis
                dataKey="monthLabel"
                stroke="#64756A"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E2E7E2' }}
              />
              <YAxis
                stroke="#64756A"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E7E2' }}
                tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const actualVal = payload[0]?.value as number;
                    const bmkVal = payload[1]?.value as number;
                    return (
                      <div className="bg-[#FFFFFF] border border-[#E2E7E2] p-3 rounded-xl shadow-md text-xs space-y-1">
                        <span className="font-semibold text-[#25382D] block border-b border-[#E2E7E2] pb-1">
                          {label}
                        </span>
                        <div className="flex items-center justify-between gap-4 text-[#25382D]">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#476C58]" />
                            Actual Spend:
                          </span>
                          <span className="font-mono font-bold">{formatINR(actualVal)}</span>
                        </div>
                        {bmkVal && (
                          <div className="flex items-center justify-between gap-4 text-[#64756A]">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#A9BCAE]" />
                              Benchmark:
                            </span>
                            <span className="font-mono font-medium">{formatINR(bmkVal)}</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: '#64756A' }}
              />
              <Line
                type="monotone"
                dataKey="actualSpendingMinor"
                name="Actual Spend"
                stroke="#476C58"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#476C58' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="benchmarkSpendingMinor"
                name="Competitive Benchmark"
                stroke="#A9BCAE"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#A9BCAE' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. Priority Insights */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#25382D]">Priority Purchasing Insights</h2>
          <span className="text-xs text-[#64756A]">Computed from verified records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-xl p-4 flex flex-col justify-between hover:border-[#476C58] transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {insight.type === 'opportunity' ? (
                    <TrendingDown className="w-4 h-4 text-[#C0772C]" />
                  ) : insight.type === 'alert' ? (
                    <AlertCircle className="w-4 h-4 text-[#C0772C]" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" />
                  )}
                  <span className="text-xs font-semibold text-[#25382D]">{insight.title}</span>
                </div>
                <p className="text-xs text-[#64756A] leading-relaxed">{insight.description}</p>
              </div>

              <button
                onClick={() => onNavigate(insight.route)}
                className="mt-4 pt-3 border-t border-[#E2E7E2] flex items-center justify-between text-xs font-medium text-[#476C58] hover:text-[#25382D] cursor-pointer"
              >
                <span>{insight.actionLabel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recent Activity */}
      <section className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#25382D]">Recent Activity</h2>
            <p className="text-xs text-[#64756A]">Latest itemized receipts saved to your ledger</p>
          </div>
          <button
            onClick={() => onNavigate('/ledger')}
            className="text-xs font-semibold text-[#476C58] hover:text-[#25382D] flex items-center gap-1 cursor-pointer"
          >
            <span>View all in Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#E2E7E2]">
          {recentReceipts.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onNavigate('/ledger')}
              className="py-3 flex items-center justify-between gap-4 hover:bg-[#F7F8F5] px-2 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#DCE7DD] text-[#476C58] flex items-center justify-center shrink-0">
                  <ReceiptIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-[#25382D] block truncate">
                    {rec.merchantName}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#64756A]">
                    <span>{rec.transactionDate}</span>
                    <span>·</span>
                    <span>{rec.items.length} line {rec.items.length === 1 ? 'item' : 'items'}</span>
                    {rec.invoiceNumber && (
                      <>
                        <span>·</span>
                        <span className="font-mono">{rec.invoiceNumber}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <CurrencyDisplay
                  amountMinor={rec.totalMinor}
                  className="text-sm font-bold text-[#25382D] block"
                />
                <span className="text-[11px] text-[#2E7D4F] font-medium">
                  {rec.status === 'confirmed' ? 'Confirmed' : 'Needs Review'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
