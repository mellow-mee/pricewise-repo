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
import { useLanguage } from '../context/LanguageContext.tsx';

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
  const { language, t, tCategory } = useLanguage();
  const isHi = language === 'hi';

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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              {isHi ? 'Samuhik Khareed Bhaav Benchmarks' : 'Collective Purchasing Intelligence'}
            </h1>
          </div>
          <p className="text-sm text-[#475569] mt-0.5">
            {isHi
              ? '5+ aas-paas ke vyapariyon ke anonymized data par aadharit thok market rate.'
              : 'Anonymized price benchmarks derived from 5+ comparable regional businesses.'}
          </p>
        </div>

        <button
          onClick={() => setShowMethodologyModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Info className="w-3.5 h-3.5 text-[#1D4ED8]" />
          <span>{isHi ? 'Benchmark Vidhi' : 'Benchmark Methodology'}</span>
        </button>
      </div>

      {/* Synthetic Demo Banner Notice */}
      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1D4ED8] shrink-0" />
          <span>
            <strong className="text-[#0F172A]">{isHi ? 'Demo Benchmark Vatavaran: ' : 'Demo Benchmark Environment: '}</strong>
            {isHi
              ? 'Regional comparison ke liye peer medians local retail records par aadharit hain.'
              : 'Peer medians are generated from realistic synthetic local retail records for testing and demonstration.'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#1D4ED8] whitespace-nowrap bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#BFDBFE]">
          {isHi ? 'Kshetr: Western Maharashtra' : 'Region: Western Maharashtra'}
        </span>
      </div>

      {/* 2. Purchasing Overview Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4">
          <span className="text-xs text-[#475569] block font-medium">{isHi ? 'Jaanchi Gayi Categories' : 'Categories Evaluated'}</span>
          <span className="text-2xl font-bold text-[#0F172A] font-mono mt-0.5 block">
            {totalCategoriesEvaluated}
          </span>
          <span className="text-[11px] text-[#475569] mt-1 block">
            Packaging, Food, Hygiene, Supplies
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4">
          <span className="text-xs text-[#475569] block font-medium">{isHi ? 'Vishwasniya Tulnayein' : 'Reliable Comparisons'}</span>
          <span className="text-2xl font-bold text-[#0F172A] font-mono mt-0.5 block">
            {reliableComparisonsCount}
          </span>
          <span className="text-[11px] text-[#1D4ED8] mt-1 block font-medium">
            {isHi ? '≥ 5 dukanon ka threshold' : 'Satisfies ≥ 5 business threshold'}
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4">
          <span className="text-xs text-[#475569] block font-medium">{isHi ? 'Bachat Ke Avasar' : 'Potential Savings Opps'}</span>
          <span className="text-2xl font-bold text-[#0F172A] font-mono mt-0.5 block">
            {meaningfulOpps.length}
          </span>
          <span className="text-[11px] text-[#475569] mt-1 block">
            {isHi ? 'Market median se mehenge bhaav' : 'Unit prices above peer median'}
          </span>
        </div>

        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4">
          <span className="text-xs text-[#1D4ED8] font-semibold block">{isHi ? 'Kul Sambhavit Bachat' : 'Total Estimated Difference'}</span>
          <CurrencyDisplay
            amountMinor={totalPotentialSavings}
            className="text-2xl font-bold text-[#1D4ED8] mt-0.5 block"
          />
          <span className="text-[11px] text-[#1D4ED8] mt-1 block font-medium">
            {isHi ? 'Aam khareed volume par' : 'At typical purchase volumes'}
          </span>
        </div>
      </div>

      {/* 3. Tab Navigation for 3 States */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          {isHi ? `Sabhi Categories (${opportunities.length})` : `All Categories (${opportunities.length})`}
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'opportunities'
              ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          {isHi ? `Bachat Ke Avasar (${meaningfulOpps.length})` : `Savings Opportunities (${meaningfulOpps.length})`}
        </button>
        <button
          onClick={() => setActiveTab('competitive')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'competitive'
              ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          {isHi ? `Pehle Se Sahi Bhaav (${competitiveItems.length})` : `Already Competitive (${competitiveItems.length})`}
        </button>
        <button
          onClick={() => setActiveTab('insufficient')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'insufficient'
              ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          {isHi ? `Kam Data (${insufficientItems.length})` : `Insufficient Data (${insufficientItems.length})`}
        </button>
      </div>

      {/* 5. Opportunity & Benchmark Cards */}
      <div className="space-y-4">
        {displayedList.map((item) => {
          if (item.state === 'meaningful_opportunity') {
            // STATE 1: MEANINGFUL OPPORTUNITY (Orange warning for items that need attention)
            return (
              <div
                key={item.id}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 hover:border-[#1D4ED8]/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-[#475569] font-medium">{tCategory(item.category)}</span>
                      <span className="text-xs text-[#475569]">·</span>
                      <span className="text-xs text-[#475569]">{item.specification}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">
                      {item.productName}
                    </h3>
                  </div>

                  {/* Orange: warnings and items that need attention */}
                  <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
                    {isHi ? 'Bhaav Sudhar Ka Avasar' : 'Potential Price Improvement'}
                  </span>
                </div>

                {/* Pricing comparison metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs">
                  <div>
                    <span className="text-[#475569] block text-[11px] font-medium">{isHi ? 'Aapka Darj Bhaav' : 'Your Recorded Price'}</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <CurrencyDisplay
                        amountMinor={item.currentRecordedPriceMinor}
                        showDecimals
                        className="text-base font-bold text-[#0F172A]"
                      />
                      <span className="text-xs text-[#475569]">/ {item.unit}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#475569] block text-[11px] font-medium">{isHi ? 'Regional Thok Benchmark' : 'Regional Benchmark'}</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <CurrencyDisplay
                        amountMinor={item.benchmarkMedianPriceMinor}
                        showDecimals
                        className="text-base font-bold text-[#1D4ED8]"
                      />
                      <span className="text-xs text-[#475569]">/ {item.unit}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#475569] block text-[11px] font-medium">{isHi ? 'Prati Unit Antar' : 'Difference Per Unit'}</span>
                    <div className="mt-0.5">
                      <CurrencyDisplay
                        amountMinor={item.differencePerUnitMinor}
                        showDecimals
                        prefix="+"
                        className="text-base font-bold text-[#C2410C]"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[#475569] block text-[11px] font-medium">{isHi ? 'Sambhavit Bachat' : 'Estimated Opportunity'}</span>
                    <CurrencyDisplay
                      amountMinor={item.estimatedPotentialSavingsMinor}
                      className="text-base font-bold text-[#1D4ED8] mt-0.5 block"
                    />
                    <span className="text-[10px] text-[#475569] block">
                      {isHi
                        ? `${item.typicalPurchaseVolume} ${item.unit}s par`
                        : `at ${item.typicalPurchaseVolume} ${item.unit}s`}
                    </span>
                  </div>
                </div>

                {/* Evidence & Explanation */}
                <div className="text-xs text-[#334155] space-y-1">
                  <p className="leading-relaxed">
                    <strong className="text-[#0F172A]">{isHi ? 'Tulna kyu sahi hai: ' : 'Why this comparison is valid: '}</strong>
                    {item.explanation}
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-[#0F172A]">{isHi ? 'Sujhav: ' : 'Suggested action: '}</strong>
                    {item.suggestedAction}
                  </p>
                </div>

                {/* Footer metadata */}
                <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#475569]">
                  <div className="flex items-center gap-3">
                    <span>
                      {isHi
                        ? `Saboot: ${item.independentBusinessesCount} alag-alag vyapari`
                        : `Evidence: ${item.independentBusinessesCount} independent businesses`}
                    </span>
                    <span>·</span>
                    <span>{isHi ? `Samay: ${item.benchmarkPeriod}` : `Period: ${item.benchmarkPeriod}`}</span>
                    <span>·</span>
                    <span className="text-[#1D4ED8] font-medium">
                      {isHi ? `${item.confidence} Vishwasniyata` : `${item.confidence} Confidence`}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate('/ledger')}
                    className="flex items-center gap-1 font-semibold text-[#1D4ED8] hover:text-[#1E40AF] cursor-pointer"
                  >
                    <span>{isHi ? 'Khata Me Bill Dekhein' : 'View Invoices in Ledger'}</span>
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
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-[#475569] font-medium">{tCategory(item.category)}</span>
                      <span className="text-xs text-[#475569]">·</span>
                      <span className="text-xs text-[#475569]">{item.specification}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">
                      {item.productName}
                    </h3>
                  </div>

                  <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isHi ? 'Kifayati Bhaav Par Khareed' : 'Purchasing Competitively'}</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[#475569] block font-medium">{isHi ? 'Aapka darj bhaav' : 'Your recorded price'}</span>
                    <span className="font-mono font-bold text-[#0F172A] text-sm mt-0.5 block">
                      {formatINR(item.currentRecordedPriceMinor, { showDecimals: true })} / {item.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#475569] block font-medium">{isHi ? 'Regional benchmark median' : 'Regional benchmark median'}</span>
                    <span className="font-mono font-bold text-[#1D4ED8] text-sm mt-0.5 block">
                      {formatINR(item.benchmarkMedianPriceMinor, { showDecimals: true })} / {item.unit}
                    </span>
                  </div>
                  <div className="max-w-xs text-[#475569]">
                    {item.explanation}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3 text-[11px] text-[#475569]">
                  <span>
                    {isHi
                      ? `${item.independentBusinessesCount} alag vyapariyon me satyapit`
                      : `Validated across ${item.independentBusinessesCount} independent businesses`}
                  </span>
                  <span>·</span>
                  <span>{isHi ? 'Koi banawati bachat nahi' : 'No minor savings fabricated'}</span>
                </div>
              </div>
            );
          } else {
            // STATE 3: INSUFFICIENT DATA
            return (
              <div
                key={item.id}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3 opacity-90"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#475569] font-medium">{tCategory(item.category)}</span>
                      <span className="text-xs text-[#475569]">·</span>
                      <span className="text-xs text-[#475569]">{item.specification}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">
                      {item.productName}
                    </h3>
                  </div>

                  <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-[#475569]" />
                    <span>{isHi ? 'Abhi Pura Data Nahi Hai' : 'Insufficient Data Yet'}</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] space-y-1">
                  <p className="leading-relaxed">
                    {item.explanation}
                  </p>
                  <p className="text-[11px] text-[#0F172A] font-semibold">
                    {item.suggestedAction}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-[#475569]">
                  <span>
                    {isHi
                      ? `Yogdan: ${item.independentBusinessesCount} / 5 zaroori vyapari`
                      : `Current contributors: ${item.independentBusinessesCount} / 5 required businesses`}
                  </span>
                  <button
                    onClick={() => onNavigate('/scan')}
                    className="text-[#1D4ED8] font-semibold hover:underline"
                  >
                    {isHi ? 'Is Category Ka Bill Upload Karein →' : 'Upload Receipt for This Category →'}
                  </button>
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* 5. Collective Participation & Privacy Consent Card (Placed at the bottom of the page) */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1D4ED8]" />
            <h3 className="text-sm font-bold text-[#0F172A]">
              {isHi ? 'Samuhik Khareed Bhaav Network' : 'Collective Purchasing Intelligence Network'}
            </h3>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            {isHi
              ? 'Benchmark network me shamil hone par aapke khareed bhaav anonymously 5+ vyapariyon ke sath aggregate hote hain. Bill number, dukan ka naam ya vyaktigat jankari kabhi share nahi hoti.'
              : 'By voluntarily opting into the benchmark pool, your itemized purchase unit prices are anonymized, aggregated with at least 5 other independent businesses, and used to calculate regional median prices. Individual invoices, receipts, and merchant names are never shared.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-xs font-semibold text-[#0F172A] block">
              {isHi
                ? isOptedIn
                  ? 'Network Sakriya Hai'
                  : 'Yogdan Ruka Hua Hai'
                : isOptedIn
                ? 'Network Active'
                : 'Participation Paused'}
            </span>
            <span className="text-[11px] text-[#475569]">
              {isHi
                ? isOptedIn
                  ? 'Gumnam roop se yogdan de rahe hain'
                  : 'Data share nahi ho raha hai'
                : isOptedIn
                ? 'Contributing anonymously'
                : 'Not contributing data'}
            </span>
          </div>

          <button
            onClick={handleToggleConsent}
            disabled={isUpdatingConsent}
            className={`p-1 rounded-full transition-colors cursor-pointer ${
              isOptedIn ? 'text-[#1D4ED8]' : 'text-[#94A3B8]'
            }`}
            title={isHi ? 'Benchmark bhagidari toggle karein' : 'Toggle Collective Benchmark Participation'}
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

      {/* --- BENCHMARK METHODOLOGY MODAL --- */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-[#0F172A]">
              {isHi ? 'Samuhik Benchmark Vidhi' : 'Collective Benchmark Methodology'}
            </h3>
            <div className="text-xs text-[#475569] space-y-3 leading-relaxed">
              <p>
                {isHi
                  ? 'Pricewise ek spasht, saboot-aadhaarit algorithm use karta hai taaki benchmarks sachhe market rate darshayein:'
                  : 'Pricewise uses a transparent, evidence-based algorithm to ensure benchmarks reflect genuine market purchasing dynamics:'}
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-[#0F172A]">{isHi ? 'Sahi Unit Normalization: ' : 'Comparable Unit Normalization: '}</strong>
                  {isHi
                    ? 'Products ko strictly verified specifications aur base units (jaise per kg, per box, per roll) ke aadhar par compare kiya jata hai.'
                    : 'Products are matched strictly on verified specifications, packaging types, and base units (e.g. per kg, per box, per roll).'}
                </li>
                <li>
                  <strong className="text-[#0F172A]">{isHi ? '5 Alag Vyapariyon Ka Threshold: ' : 'Threshold of 5 Independent Businesses: '}</strong>
                  {isHi
                    ? 'Benchmarks tabhi publish hote hain jab kam se kam 5 alag vyapariyon ne 90 dino ke dauraan khareed darj ki ho.'
                    : 'Benchmarks are never published unless at least 5 distinct businesses have contributed transactions in the current rolling 90-day window.'}
                </li>
                <li>
                  <strong className="text-[#0F172A]">{isHi ? 'Trimmed Median: ' : 'Trimmed Median: '}</strong>
                  {isHi
                    ? 'Aam average ke bajay hum median rate nikaalte hain taaki achanak rush deliveries ya abnormal rates se bacha ja sake.'
                    : 'We use the median unit price rather than a simple average, filtering statistical outliers caused by one-off rush deliveries or extreme volumes.'}
                </li>
                <li>
                  <strong className="text-[#0F172A]">{isHi ? 'Koi Jhoothi Bachat Nahi: ' : 'No Fabricated Savings: '}</strong>
                  {isHi
                    ? 'Agar aapka khareed bhaav benchmark se 5% ke daayre me hai, toh hum saaf kehte hain ki aap pehle se sahi bhaav par khareed rahe hain.'
                    : 'If your purchase price is within 5% of the benchmark, we state clearly that you are purchasing competitively without inventing fake recommendations.'}
                </li>
              </ul>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1D4ED8] text-white text-xs font-semibold hover:bg-[#1E40AF] cursor-pointer"
              >
                {isHi ? 'Band Karein' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
