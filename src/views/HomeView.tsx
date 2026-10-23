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
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  // Time-appropriate greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (isHi) {
      if (hour < 12) return 'Shubh Prabhat';
      if (hour < 17) return 'Shubh Dopahar';
      return 'Shubh Sandhya';
    }
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, [isHi]);

  const ownerName = business?.ownerName || (isHi ? 'Dukaandar' : 'Store Owner');
  const businessName = business?.name || 'Green Basket Stores';

  // Derived spending summary
  const summary = useMemo(() => {
    return calculateSpendingSummary(receipts, opportunities);
  }, [receipts, opportunities]);

  // Priority insights written in simple, layman-friendly language
  // Priority insights written in simple, business-friendly language
  const insights = useMemo(() => {
    const list = [];
    const meaningfulOpps = opportunities.filter((o) => o.state === 'meaningful_opportunity');

    if (meaningfulOpps.length > 0) {
      const topOpp = meaningfulOpps[0];
      list.push({
        id: 'opp-top',
        type: 'opportunity',
        title: isHi
          ? `${topOpp.productName} — Bachat ka Mauka`
          : `${topOpp.productName} — Possible Savings`,
        description: isHi
          ? `Aap per ${topOpp.unit} ${formatINR(topOpp.currentRecordedPriceMinor)} chuka rahe hain, jabki bazaar ka median rate lagbhag ${formatINR(topOpp.benchmarkMedianPriceMinor)} hai. Aap lagbhag ${formatINR(topOpp.estimatedPotentialSavingsMinor)} bacha sakte hain.`
          : `You pay ${formatINR(topOpp.currentRecordedPriceMinor)} per ${topOpp.unit}, while nearby stores pay about ${formatINR(topOpp.benchmarkMedianPriceMinor)}. You could save around ${formatINR(topOpp.estimatedPotentialSavingsMinor)}.`,
        actionLabel: isHi ? 'Rates Compare Karein' : 'Compare Prices',
        route: '/save-more',
      });
    }

    if (summary.monthOverMonthChangePercentage !== 0) {
      const isUp = summary.monthOverMonthChangePercentage > 0;
      list.push({
        id: 'mom-trend',
        type: isUp ? 'alert' : 'positive',
        title: isHi
          ? `Kharcha ${isUp ? 'badha' : 'ghata'} ${Math.abs(summary.monthOverMonthChangePercentage)}% se`
          : `Spending ${isUp ? 'went up' : 'went down'} by ${Math.abs(summary.monthOverMonthChangePercentage)}%`,
        description: isHi
          ? `Is mahine aapka kharcha ${formatINR(summary.currentMonthSpendingMinor)} raha, pichhle mahine ${formatINR(summary.previousMonthSpendingMinor)} ke mukable.`
          : `You spent ${formatINR(summary.currentMonthSpendingMinor)} this month compared to ${formatINR(summary.previousMonthSpendingMinor)} last month.`,
        actionLabel: isHi ? 'Khate Mein Dekhein' : 'View in Ledger',
        route: '/ledger',
      });
    }

    const competitive = opportunities.find((o) => o.state === 'already_competitive');
    if (competitive) {
      list.push({
        id: 'competitive-tea',
        type: 'positive',
        title: isHi
          ? `${competitive.productName} ke rates bilkul sahi hain`
          : `${competitive.productName} has good pricing`,
        description: isHi
          ? `Aapka khareed rate local wholesale market ke average (${formatINR(competitive.benchmarkMedianPriceMinor)}) ke barabar ya kam hai.`
          : `Your purchase price is at or below the local market average (${formatINR(competitive.benchmarkMedianPriceMinor)}). Keep it up!`,
        actionLabel: isHi ? 'Rate Check Karein' : 'Check Price',
        route: '/save-more',
      });
    }

    return list.slice(0, 3);
  }, [opportunities, summary, isHi]);

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
            {businessName} · {isHi ? 'Is mahine aapki dukaan ke kharche aur bachat ka pura hisaab-kitab:' : 'Here is how your store spending looks this month.'}
          </p>
        </div>
      </section>

      {/* 2. Primary Spending Card */}
      <section className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64756A]">
              {isHi ? 'Is Mahine Ka Kharcha · October 2026' : "This Month's Spending · October 2026"}
            </span>

            <div className="flex items-baseline gap-3 flex-wrap">
              <CurrencyDisplay
                amountMinor={summary.currentMonthSpendingMinor}
                className="text-3xl sm:text-4xl font-bold text-[#25382D] tracking-tight"
              />
              <span className="text-xs text-[#64756A]">
                {isHi ? 'dukaan saman aur vendor payments par kharch' : 'spent on store supplies & bills'}
              </span>
            </div>

            {summary.hasEnoughBenchmarkData && summary.benchmarkSpendingMinor !== null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#E2E7E2]">
                <div className="bg-[#F7F8F5] rounded-xl p-3.5 border border-[#E2E7E2]">
                  <span className="text-xs text-[#64756A] block">
                    {isHi ? 'Regional Bazaar Thok Bhaav' : 'Market Average (Similar Stores)'}
                  </span>
                  <CurrencyDisplay
                    amountMinor={summary.benchmarkSpendingMinor}
                    className="text-xl font-bold text-[#25382D] mt-0.5 block"
                  />
                  <span className="text-[11px] text-[#64756A] mt-1 block">
                    {isHi ? 'Area ki 5+ dukaano ke verified data par aadharit' : 'Based on 5+ local stores in your area'}
                  </span>
                </div>

                <div className="bg-[#EDF7F1] rounded-xl p-3.5 border border-[#CDE8D8]">
                  <span className="text-xs text-[#2E7D4F] font-medium block">
                    {isHi ? 'Sambhavit Kul Bachat' : 'Estimated Possible Savings'}
                  </span>
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
                    {isHi ? 'Anumanit bachat, rate negotiation par nirbhar' : 'Potential savings, not guaranteed'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#FDF8F0] border border-[#F3E2CE] rounded-xl p-3.5 text-xs text-[#C0772C]">
                <span className="font-semibold block mb-0.5">
                  {isHi ? 'Abhi peer data kam hai' : 'Not enough store data yet'}
                </span>
                {isHi
                  ? 'Bhaav compare karne ke liye Pricewise ko kam se kam 5 dukaano ka verified data chahiye.'
                  : 'Pricewise needs data from at least 5 local stores before comparing prices.'}
              </div>
            )}

            <p className="text-xs text-[#64756A] leading-relaxed">
              {summary.potentialDifferenceMinor && summary.potentialDifferenceMinor > 0
                ? isHi
                  ? `Packaging aur store supplies par local market median rates match karke aap lagbhag ${formatINR(summary.potentialDifferenceMinor)} (${summary.differencePercentage}%) tak bacha sakte hain.`
                  : `You could potentially save ${formatINR(summary.potentialDifferenceMinor)} (${summary.differencePercentage}%) by matching local market prices on packaging and supplies.`
                : isHi
                  ? 'Aapke khareed rates local bazaar ke median average ke bilkul barabar hain.'
                  : 'Your current purchase prices are close to the local market average.'}
            </p>
          </div>

          {/* Quick Action Box */}
          <div className="lg:w-72 bg-[#F7F8F5] rounded-xl p-4 border border-[#E2E7E2] space-y-3 shrink-0">
            <span className="text-xs font-semibold text-[#25382D] block">
              {isHi ? 'Dukaan Khata Status' : 'Store Status'}
            </span>
            <ul className="text-xs text-[#64756A] space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
                <span>{isHi ? '6 mahine ka kharcha record active' : '6 months of purchase records'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
                <span>{receipts.length} {isHi ? 'verified bills darj hain' : 'bills and receipts saved'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
                <span>{isHi ? 'Collective thok bhaav network chalu' : 'Community price sharing on'}</span>
              </li>
            </ul>
            <button
              onClick={() => onNavigate('/save-more')}
              className="w-full mt-2 inline-flex items-center justify-between px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#E2E7E2] text-xs font-medium text-[#25382D] hover:bg-[#DCE7DD] transition-colors cursor-pointer"
            >
              <span>{isHi ? 'Bachat Bhaav Dekhein' : 'See Market Prices'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#476C58]" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Priority Insights */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#25382D]">
            {isHi ? 'Zaroori Kharcha & Bachat Sujhav' : 'Helpful Spending Insights'}
          </h2>
          <span className="text-xs text-[#64756A]">
            {isHi ? 'Aapke verified bills ke mutabiq' : 'Based on your saved bills'}
          </span>
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

      {/* 4. Recent Activity */}
      <section className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#25382D]">
              {isHi ? 'Haal hi ke Bills & Invoices' : 'Recent Bills & Invoices'}
            </h2>
            <p className="text-xs text-[#64756A]">
              {isHi ? 'Khate mein darj aakhiri purchases' : 'Latest purchases added to your ledger'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('/ledger')}
            className="text-xs font-semibold text-[#476C58] hover:text-[#25382D] flex items-center gap-1 cursor-pointer"
          >
            <span>{isHi ? 'Saare bills dekhein' : 'View all bills'}</span>
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
                    <span>
                      {rec.items.length} {isHi ? 'items' : rec.items.length === 1 ? 'item' : 'items'}
                    </span>
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
                  {rec.status === 'confirmed'
                    ? isHi ? 'Verified Bill' : 'Confirmed'
                    : isHi ? 'Check Karein' : 'Needs Review'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
