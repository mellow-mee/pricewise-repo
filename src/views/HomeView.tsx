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
} from '../utils/finance.ts';
import { CurrencyDisplay } from '../components/CurrencyDisplay.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  ArrowRight,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Receipt as ReceiptIcon,
  ChevronRight,
  FileCheck,
  Sparkles,
} from 'lucide-react';

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
  const { language } = useLanguage();
  const isHi = language === 'hi';

  // Derived spending summary
  const summary = useMemo(() => {
    return calculateSpendingSummary(receipts, opportunities);
  }, [receipts, opportunities]);

  // Current month receipts (October 2026 or active month)
  const currentMonthReceipts = useMemo(() => {
    return receipts.filter((r) => r.transactionDate?.startsWith('2026-10'));
  }, [receipts]);

  // Recorded count (confirmed & successfully saved receipts)
  const recordedCount = useMemo(() => {
    return receipts.filter((r) => r.status === 'confirmed').length;
  }, [receipts]);

  // Needs review count
  const needsReviewCount = useMemo(() => {
    return receipts.filter(
      (r) =>
        r.status === 'pending_review' ||
        r.reviewStatus === 'needs_review' ||
        r.items.some((it) => it.reviewFlags && it.reviewFlags.length > 0)
    ).length;
  }, [receipts]);

  // Recent 5 purchases
  const recentReceipts = useMemo(() => {
    return receipts.slice(0, 5);
  }, [receipts]);

  return (
    <div className="space-y-6 pb-24 md:pb-14">
      {/* A. Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#202B27]">
            {isHi ? 'Dukaan Overview' : 'Business overview'}
          </h1>
          <p className="text-sm sm:text-base text-[#65736C] mt-0.5">
            {isHi
              ? 'Aapke kharche, purchase records aur bachat ke avasar.'
              : 'Your purchases, records and savings opportunities.'}
          </p>
        </div>

        {business?.name && (
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF4ED] border border-[#CDE8D8] text-xs font-medium text-[#216747]">
            <span className="w-2 h-2 rounded-full bg-[#216747]"></span>
            <span>{business.name}</span>
          </div>
        )}
      </section>

      {/* B. Card 1 — Total Purchases This Month (Full-width Forest Green Hero) */}
      <section
        aria-label="Total purchases this month"
        className="bg-[#216747] text-white rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden transition-all"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#EAF4ED]/90 text-sm font-medium">
              <ReceiptIcon className="w-4 h-4 text-[#A8D7B8]" />
              <span>
                {isHi ? 'Is Mahine Ka Kharcha' : 'Total purchases this month'}
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <CurrencyDisplay
                amountMinor={summary.currentMonthSpendingMinor}
                className="text-3xl sm:text-4xl font-bold tracking-tight text-white tabular-nums"
              />
              <span className="text-xs sm:text-sm text-[#EAF4ED]/80 font-normal">
                {isHi
                  ? `· ${currentMonthReceipts.length || receipts.length} bills is mahine darj hue`
                  : `· ${currentMonthReceipts.length || receipts.length} bills recorded this month`}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#EAF4ED]/85 leading-relaxed max-w-xl">
              {summary.monthOverMonthChangePercentage !== 0 ? (
                isHi ? (
                  <>
                    Pichhle mahine ke mukable kharcha{' '}
                    <span className="font-semibold text-white">
                      {Math.abs(summary.monthOverMonthChangePercentage)}%{' '}
                      {summary.monthOverMonthChangePercentage > 0 ? 'badha' : 'ghata'}
                    </span>
                    . Sabhi vendor payments ledger mein surakshit hain.
                  </>
                ) : (
                  <>
                    Spending{' '}
                    <span className="font-semibold text-white">
                      {summary.monthOverMonthChangePercentage > 0 ? 'increased' : 'decreased'} by{' '}
                      {Math.abs(summary.monthOverMonthChangePercentage)}%
                    </span>{' '}
                    compared to last month. All vendor records are verified in your ledger.
                  </>
                )
              ) : (
                isHi
                  ? 'Aapke sabhi dukaani kharche aur vendor invoices yahan darj hain.'
                  : 'All your store purchase transactions and vendor invoices are tracked here.'
              )}
            </p>
          </div>

          <div className="shrink-0 self-start md:self-center">
            <button
              onClick={() => onNavigate('/ledger')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/25 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer backdrop-blur-xs min-h-[44px]"
            >
              <span>{isHi ? 'Purchase Ledger Dekhein' : 'View purchase ledger'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* C. Card 2 — Possible Savings (Full-width Pale Green Card) */}
      <section
        aria-label="Possible savings"
        className="bg-[#EAF4ED] border border-[#CDE8D8] rounded-2xl p-5 sm:p-6 shadow-xs transition-all"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#216747]/10 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4 text-[#216747]" />
              </div>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#216747]">
                {isHi ? 'Sambhavit Bachat' : 'Possible savings'}
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <CurrencyDisplay
                amountMinor={summary.potentialDifferenceMinor || 0}
                className="text-2xl sm:text-[32px] font-bold text-[#216747] tabular-nums tracking-tight"
              />
              {summary.differencePercentage !== null && summary.differencePercentage > 0 && (
                <span className="text-xs sm:text-sm font-semibold text-[#216747] bg-white/70 px-2 py-0.5 rounded-md border border-[#CDE8D8]">
                  {isHi ? `Lagbhag ${summary.differencePercentage}% bachat` : `~${summary.differencePercentage}% opportunity`}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#355B45] leading-relaxed max-w-2xl">
              {isHi
                ? 'Bazaar rates ki tulna se anumanit bachat avasar. Ye anumanit bachat hai jo samaan dukaano ke thok bhaav par aadharit hai.'
                : 'Estimated opportunity from price comparisons. Based on purchase prices from similar stores in your region.'}
            </p>
          </div>

          <div className="shrink-0 self-start md:self-center">
            <button
              onClick={() => onNavigate('/save-more')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#216747] hover:bg-[#1a5339] active:bg-[#15422d] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-[#A8D7B8]" />
              <span>{isHi ? 'Bachat Avasar Dekhein' : 'Explore savings opportunities'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* D. Card 3 (Bills Recorded) & Card 4 (Needs Review) — Side-by-Side on Desktop */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Card 3: Bills Recorded */}
        <div
          onClick={() => onNavigate('/ledger')}
          className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#216747]/40 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#65736C]">
              {isHi ? 'Darj kiye gaye Bills' : 'Bills recorded'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EAF4ED] text-[#216747] flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 text-[#216747]" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-bold text-[#202B27] tabular-nums block">
              {recordedCount || receipts.length}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#216747]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isHi ? 'Safaltapoorvak saved' : 'Successfully saved'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E2E7E2]/60 flex items-center justify-between text-xs font-semibold text-[#216747]">
            <span>{isHi ? 'Ledger mein dekhein' : 'View in ledger'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Needs Review */}
        <div
          onClick={() => onNavigate('/ledger?filter=needs_review')}
          className="bg-[#FFF3D8] border border-[#F3E2CE] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#E8C896] hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4 text-[#754A0A]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#754A0A]">
              {isHi ? 'Review ki Zaroorat' : 'Needs review'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FFE7B3] text-[#754A0A] flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-[#754A0A]" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-bold text-[#754A0A] tabular-nums block">
              {needsReviewCount}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#754A0A]">
              <span>
                {needsReviewCount === 0
                  ? isHi
                    ? 'Sabhi bills reconciled'
                    : 'All records clear'
                  : isHi
                  ? 'Details check karein'
                  : 'Check details'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F3E2CE] flex items-center justify-between text-xs font-semibold text-[#754A0A]">
            <span>{isHi ? 'Review items filter karein' : 'Filter review items'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* E. Section 5 — Recent Purchases */}
      <section
        aria-label="Recent purchases"
        className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#202B27]">
              {isHi ? 'Haal hi ke Purchases' : 'Recent purchases'}
            </h2>
            <p className="text-xs text-[#65736C] mt-0.5">
              {isHi
                ? 'Khate mein darj aakhiri purchases aur invoices'
                : 'Latest purchases added to your ledger'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('/ledger')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#216747] hover:text-[#1a5339] hover:underline cursor-pointer transition-colors"
          >
            <span>{isHi ? 'Sabhi Dekhein' : 'View all'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#E2E7E2]">
          {recentReceipts.map((rec) => {
            const isPending =
              rec.status === 'pending_review' ||
              rec.reviewStatus === 'needs_review' ||
              rec.items.some((it) => it.reviewFlags && it.reviewFlags.length > 0);

            return (
              <div
                key={rec.id}
                onClick={() => onNavigate('/ledger')}
                className="py-3.5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-[#F5F7F6] px-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EAF4ED] text-[#216747] flex items-center justify-center shrink-0">
                    <ReceiptIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm sm:text-base font-semibold text-[#202B27] block truncate">
                      {rec.merchantName}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-[#65736C] flex-wrap mt-0.5">
                      <span>{rec.transactionDate}</span>
                      <span>·</span>
                      <span>
                        {rec.items.length}{' '}
                        {isHi
                          ? 'items'
                          : rec.items.length === 1
                          ? 'item'
                          : 'items'}
                      </span>
                      {rec.invoiceNumber && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[#65736C]">
                            {rec.invoiceNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <CurrencyDisplay
                    amountMinor={rec.totalMinor}
                    className="text-sm sm:text-base font-bold text-[#202B27] tabular-nums block"
                  />
                  {isPending ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#754A0A] bg-[#FFF3D8] border border-[#F3E2CE] px-2 py-0.5 rounded-md">
                      <AlertCircle className="w-3 h-3 text-[#754A0A]" />
                      <span>{isHi ? 'Review Baaqi' : 'Needs Review'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#216747] bg-[#EAF4ED] border border-[#CDE8D8] px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-[#216747]" />
                      <span>{isHi ? 'Confirmed' : 'Confirmed'}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
