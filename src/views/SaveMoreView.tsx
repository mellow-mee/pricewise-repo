/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Business,
  PriceBenchmark,
  SavingsOpportunity,
} from '../types/index.ts';
import { formatINR } from '../utils/finance.ts';
import { CurrencyDisplay } from '../components/CurrencyDisplay.tsx';
import {
  TrendingDown,
  ShieldCheck,
  Users,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Info,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { updateBusinessConsent } from '../services/api.ts';

interface SaveMoreViewProps {
  business: Business | null;
  opportunities: SavingsOpportunity[];
  benchmarks: PriceBenchmark[];
  onConsentUpdated: (enabled: boolean) => void;
  onNavigate: (route: string) => void;
}

export const SaveMoreView: React.FC<SaveMoreViewProps> = ({
  business,
  opportunities,
  benchmarks,
  onConsentUpdated,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'opportunities' | 'competitive' | 'insufficient'>('all');
  const [isUpdatingConsent, setIsUpdatingConsent] = useState(false);
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);

  const isOptedIn = business?.benchmarkParticipationEnabled ?? true;

  // Toggle Collective Intelligence consent
  const handleToggleConsent = async () => {
    setIsUpdatingConsent(true);
    try {
      const updated = await updateBusinessConsent(!isOptedIn);
      onConsentUpdated(updated.benchmarkParticipationEnabled);
    } catch (err) {
      console.error('Consent update error:', err);
    } finally {
      setIsUpdatingConsent(false);
    }
  };

  // Group opportunities by state
  const meaningfulOpps = useMemo(() => {
    return opportunities.filter((o) => o.state === 'meaningful_opportunity');
  }, [opportunities]);

  const competitiveItems = useMemo(() => {
    return opportunities.filter((o) => o.state === 'already_competitive');
  }, [opportunities]);

  const insufficientItems = useMemo(() => {
    return opportunities.filter((o) => o.state === 'insufficient_data');
  }, [opportunities]);

  const displayedList = useMemo(() => {
    if (activeTab === 'opportunities') return meaningfulOpps;
    if (activeTab === 'competitive') return competitiveItems;
    if (activeTab === 'insufficient') return insufficientItems;
    return opportunities;
  }, [activeTab, opportunities, meaningfulOpps, competitiveItems, insufficientItems]);

  // Aggregate statistics for overview
  const totalPotentialSavings = useMemo(() => {
    return meaningfulOpps.reduce((sum, o) => sum + o.estimatedPotentialSavingsMinor, 0);
  }, [meaningfulOpps]);

  const totalCategoriesEvaluated = useMemo(() => {
    const cats = new Set(opportunities.map((o) => o.category));
    return cats.size;
  }, [opportunities]);

  const reliableComparisonsCount = meaningfulOpps.length + competitiveItems.length;

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#25382D]">
              Collective Purchasing Intelligence
            </h1>
          </div>
          <p className="text-sm text-[#64756A] mt-0.5">
            Anonymized price benchmarks derived from 5+ comparable regional businesses.
          </p>
        </div>

        <button
          onClick={() => setShowMethodologyModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E7E2] bg-[#FFFFFF] text-xs font-semibold text-[#25382D] hover:bg-[#F7F8F5] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Info className="w-3.5 h-3.5 text-[#476C58]" />
          <span>Benchmark Methodology</span>
        </button>
      </div>

      {/* Synthetic Demo Banner Notice */}
      <div className="p-3.5 rounded-xl bg-[#F7F8F5] border border-[#E2E7E2] text-xs text-[#64756A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#476C58] shrink-0" />
          <span>
            <strong className="text-[#25382D]">Demo Benchmark Environment:</strong> Peer medians are generated from realistic synthetic local retail records for testing and demonstration.
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#476C58] whitespace-nowrap bg-[#DCE7DD] px-2 py-0.5 rounded-md">
          Region: Western Maharashtra
        </span>
      </div>

      {/* 2. Purchasing Overview Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-xl p-4">
          <span className="text-xs text-[#64756A] block">Categories Evaluated</span>
          <span className="text-2xl font-bold text-[#25382D] font-mono mt-0.5 block">
            {totalCategoriesEvaluated}
          </span>
          <span className="text-[11px] text-[#64756A] mt-1 block">
            Packaging, Food, Hygiene, Supplies
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-xl p-4">
          <span className="text-xs text-[#64756A] block">Reliable Comparisons</span>
          <span className="text-2xl font-bold text-[#25382D] font-mono mt-0.5 block">
            {reliableComparisonsCount}
          </span>
          <span className="text-[11px] text-[#2E7D4F] mt-1 block">
            Satisfies &ge; 5 business threshold
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-xl p-4">
          <span className="text-xs text-[#64756A] block">Potential Savings Opps</span>
          <span className="text-2xl font-bold text-[#25382D] font-mono mt-0.5 block">
            {meaningfulOpps.length}
          </span>
          <span className="text-[11px] text-[#64756A] mt-1 block">
            Unit prices above peer median
          </span>
        </div>

        <div className="bg-[#EDF7F1] border border-[#CDE8D8] rounded-xl p-4">
          <span className="text-xs text-[#2E7D4F] font-semibold block">Total Estimated Difference</span>
          <CurrencyDisplay
            amountMinor={totalPotentialSavings}
            className="text-2xl font-bold text-[#2E7D4F] mt-0.5 block"
          />
          <span className="text-[11px] text-[#2E7D4F] mt-1 block">
            At typical purchase volumes
          </span>
        </div>
      </div>

      {/* 3. Collective Participation & Privacy Consent Card */}
      <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#476C58]" />
            <h3 className="text-sm font-bold text-[#25382D]">Collective Purchasing Intelligence Network</h3>
          </div>
          <p className="text-xs text-[#64756A] leading-relaxed">
            By voluntarily opting into the benchmark pool, your itemized purchase unit prices are anonymized, aggregated with at least 5 other independent businesses, and used to calculate regional median prices. Individual invoices, receipts, and merchant names are never shared.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-xs font-semibold text-[#25382D] block">
              {isOptedIn ? 'Network Active' : 'Participation Paused'}
            </span>
            <span className="text-[11px] text-[#64756A]">
              {isOptedIn ? 'Contributing anonymously' : 'Not contributing data'}
            </span>
          </div>

          <button
            onClick={handleToggleConsent}
            disabled={isUpdatingConsent}
            className={`p-1 rounded-full transition-colors cursor-pointer ${
              isOptedIn ? 'text-[#476C58]' : 'text-[#64756A]'
            }`}
            title="Toggle Collective Benchmark Participation"
            aria-label="Toggle benchmark participation"
          >
            {isOptedIn ? (
              <ToggleRight className="w-10 h-10" />
            ) : (
              <ToggleLeft className="w-10 h-10" />
            )}
          </button>
        </div>
      </div>

      {/* 4. Tab Navigation for 3 States */}
      <div className="flex items-center gap-2 border-b border-[#E2E7E2] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#DCE7DD] text-[#25382D] font-bold'
              : 'text-[#64756A] hover:text-[#25382D]'
          }`}
        >
          All Categories ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'opportunities'
              ? 'bg-[#DCE7DD] text-[#25382D] font-bold'
              : 'text-[#64756A] hover:text-[#25382D]'
          }`}
        >
          Savings Opportunities ({meaningfulOpps.length})
        </button>
        <button
          onClick={() => setActiveTab('competitive')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'competitive'
              ? 'bg-[#DCE7DD] text-[#25382D] font-bold'
              : 'text-[#64756A] hover:text-[#25382D]'
          }`}
        >
          Already Competitive ({competitiveItems.length})
        </button>
        <button
          onClick={() => setActiveTab('insufficient')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'insufficient'
              ? 'bg-[#DCE7DD] text-[#25382D] font-bold'
              : 'text-[#64756A] hover:text-[#25382D]'
          }`}
        >
          Insufficient Data ({insufficientItems.length})
        </button>
      </div>

      {/* 5. Opportunity & Benchmark Cards */}
      <div className="space-y-4">
        {displayedList.map((item) => {
          if (item.state === 'meaningful_opportunity') {
            // STATE 1: MEANINGFUL OPPORTUNITY
            return (
              <div
                key={item.id}
                className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 hover:border-[#476C58] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-[#64756A] font-medium">{item.category}</span>
                      <span className="text-xs text-[#64756A]">·</span>
                      <span className="text-xs text-[#64756A]">{item.specification}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#25382D] mt-0.5">
                      {item.productName}
                    </h3>
                  </div>

                  <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FDF8F0] text-[#C0772C] border border-[#F3E2CE]">
                    Potential Price Improvement
                  </span>
                </div>

                {/* Pricing comparison metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F8F5] p-3.5 rounded-xl border border-[#E2E7E2] text-xs">
                  <div>
                    <span className="text-[#64756A] block text-[11px]">Your Recorded Price</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <CurrencyDisplay
                        amountMinor={item.currentRecordedPriceMinor}
                        showDecimals
                        className="text-base font-bold text-[#25382D]"
                      />
                      <span className="text-xs text-[#64756A]">/ {item.unit}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#64756A] block text-[11px]">Regional Benchmark</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <CurrencyDisplay
                        amountMinor={item.benchmarkMedianPriceMinor}
                        showDecimals
                        className="text-base font-bold text-[#476C58]"
                      />
                      <span className="text-xs text-[#64756A]">/ {item.unit}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#64756A] block text-[11px]">Difference Per Unit</span>
                    <div className="mt-0.5">
                      <CurrencyDisplay
                        amountMinor={item.differencePerUnitMinor}
                        showDecimals
                        prefix="+"
                        className="text-base font-bold text-[#C0772C]"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[#64756A] block text-[11px]">Estimated Opportunity</span>
                    <CurrencyDisplay
                      amountMinor={item.estimatedPotentialSavingsMinor}
                      className="text-base font-bold text-[#2E7D4F] mt-0.5 block"
                    />
                    <span className="text-[10px] text-[#64756A] block">
                      at {item.typicalPurchaseVolume} {item.unit}s
                    </span>
                  </div>
                </div>

                {/* Evidence & Explanation */}
                <div className="text-xs text-[#64756A] space-y-1">
                  <p className="leading-relaxed">
                    <strong className="text-[#25382D]">Why this comparison is valid:</strong> {item.explanation}
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-[#25382D]">Suggested action:</strong> {item.suggestedAction}
                  </p>
                </div>

                {/* Footer metadata */}
                <div className="pt-3 border-t border-[#E2E7E2] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#64756A]">
                  <div className="flex items-center gap-3">
                    <span>Evidence: {item.independentBusinessesCount} independent businesses</span>
                    <span>·</span>
                    <span>Period: {item.benchmarkPeriod}</span>
                    <span>·</span>
                    <span className="text-[#2E7D4F] font-medium">{item.confidence} Confidence</span>
                  </div>

                  <button
                    onClick={() => onNavigate('/ledger')}
                    className="flex items-center gap-1 font-semibold text-[#476C58] hover:text-[#25382D] cursor-pointer"
                  >
                    <span>View Invoices in Ledger</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          } else if (item.state === 'already_competitive') {
            // STATE 2: ALREADY PURCHASING COMPETITIVELY
            return (
              <div
                key={item.id}
                className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-[#64756A] font-medium">{item.category}</span>
                      <span className="text-xs text-[#64756A]">·</span>
                      <span className="text-xs text-[#64756A]">{item.specification}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#25382D] mt-0.5">
                      {item.productName}
                    </h3>
                  </div>

                  <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EDF7F1] text-[#2E7D4F] border border-[#CDE8D8] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Purchasing Competitively</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8F5] border border-[#E2E7E2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[#64756A] block">Your recorded price</span>
                    <span className="font-mono font-bold text-[#25382D] text-sm mt-0.5 block">
                      {formatINR(item.currentRecordedPriceMinor, { showDecimals: true })} / {item.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64756A] block">Regional benchmark median</span>
                    <span className="font-mono font-bold text-[#476C58] text-sm mt-0.5 block">
                      {formatINR(item.benchmarkMedianPriceMinor, { showDecimals: true })} / {item.unit}
                    </span>
                  </div>
                  <div className="max-w-xs text-[#64756A]">
                    {item.explanation}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3 text-[11px] text-[#64756A]">
                  <span>Validated across {item.independentBusinessesCount} independent businesses</span>
                  <span>·</span>
                  <span>No minor savings fabricated</span>
                </div>
              </div>
            );
          } else {
            // STATE 3: INSUFFICIENT DATA
            return (
              <div
                key={item.id}
                className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3 opacity-90"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#64756A] font-medium">{item.category}</span>
                      <span className="text-xs text-[#64756A]">·</span>
                      <span className="text-xs text-[#64756A]">{item.specification}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#25382D] mt-0.5">
                      {item.productName}
                    </h3>
                  </div>

                  <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F7F8F5] text-[#64756A] border border-[#E2E7E2] flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-[#64756A]" />
                    <span>Insufficient Data Yet</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8F5] border border-[#E2E7E2] text-xs text-[#64756A] space-y-1">
                  <p className="leading-relaxed">
                    {item.explanation}
                  </p>
                  <p className="text-[11px] text-[#25382D] font-medium">
                    {item.suggestedAction}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-[#64756A]">
                  <span>Current contributors: {item.independentBusinessesCount} / 5 required businesses</span>
                  <button
                    onClick={() => onNavigate('/scan')}
                    className="text-[#476C58] font-semibold hover:underline"
                  >
                    Upload Receipt for This Category &rarr;
                  </button>
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* --- BENCHMARK METHODOLOGY MODAL --- */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-[#25382D]">
              Collective Benchmark Methodology
            </h3>
            <div className="text-xs text-[#64756A] space-y-3 leading-relaxed">
              <p>
                Pricewise uses a transparent, evidence-based algorithm to ensure benchmarks reflect genuine market purchasing dynamics:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-[#25382D]">Comparable Unit Normalization:</strong> Products are matched strictly on verified specifications, packaging types, and base units (e.g. per kg, per box, per roll).
                </li>
                <li>
                  <strong className="text-[#25382D]">Threshold of 5 Independent Businesses:</strong> Benchmarks are never published unless at least 5 distinct businesses have contributed transactions in the current rolling 90-day window.
                </li>
                <li>
                  <strong className="text-[#25382D]">Trimmed Median:</strong> We use the median unit price rather than a simple average, filtering statistical outliers caused by one-off rush deliveries or extreme volumes.
                </li>
                <li>
                  <strong className="text-[#25382D]">No Fabricated Savings:</strong> If your purchase price is within 5% of the benchmark, we state clearly that you are purchasing competitively without inventing fake recommendations.
                </li>
              </ul>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="px-4 py-2 rounded-xl bg-[#476C58] text-white text-xs font-semibold hover:bg-[#3a5948] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
