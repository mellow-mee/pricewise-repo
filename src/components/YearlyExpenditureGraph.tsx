/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Receipt } from '../types/index.ts';
import { formatINR, generateYearlyExpenditureSeries } from '../utils/finance.ts';
import { CurrencyDisplay } from './CurrencyDisplay.tsx';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { BarChart3, Calendar, TrendingUp, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface YearlyExpenditureGraphProps {
  receipts: Receipt[];
  selectedYear: number;
  onYearChange?: (year: number) => void;
  selectedMonth?: number;
  onMonthSelect?: (month: number) => void;
  availableYears?: number[];
}

export const YearlyExpenditureGraph: React.FC<YearlyExpenditureGraphProps> = ({
  receipts,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthSelect,
  availableYears = [2026, 2025, 2024],
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const yearlyData = useMemo(() => {
    return generateYearlyExpenditureSeries(receipts, selectedYear);
  }, [receipts, selectedYear]);

  // Find peak month
  const peakMonth = useMemo(() => {
    if (yearlyData.totalYearSpendMinor === 0) return null;
    let highest = yearlyData.months[0];
    for (const m of yearlyData.months) {
      if (m.totalSpendMinor > highest.totalSpendMinor) {
        highest = m;
      }
    }
    return highest.totalSpendMinor > 0 ? highest : null;
  }, [yearlyData]);

  // Chart data formatted for Recharts
  const chartPoints = useMemo(() => {
    return yearlyData.months.map((m) => ({
      monthIndex: m.monthIndex,
      monthName: m.monthName,
      shortMonth: m.shortMonth,
      spendRupees: m.totalSpendMinor / 100,
      totalSpendMinor: m.totalSpendMinor,
      receiptCount: m.receiptCount,
      itemCount: m.itemCount,
      isSelected: selectedMonth === m.monthIndex,
    }));
  }, [yearlyData, selectedMonth]);

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* 1. Header with Title & Year Selection (Synced with Spreadsheet) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              {isHi ? `Salana Kharcha Graph (${selectedYear})` : `Yearly Expenditure Graph (${selectedYear})`}
            </h2>
          </div>
          <p className="text-xs text-[#475569] mt-0.5">
            {isHi
              ? `${selectedYear} me har mahine dukan ke kul kharche ka aalokan.`
              : `Total store expenditure broken down month-by-month for ${selectedYear}.`}
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#475569] font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>{isHi ? 'Saal Chunein:' : 'Select Year:'}</span>
          </span>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange?.(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] focus:outline-hidden focus:border-[#1D4ED8] cursor-pointer font-mono shadow-2xs hover:bg-[#EFF6FF] hover:border-[#BFDBFE] transition-colors"
            aria-label="Select year for expenditure graph and spreadsheet"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-xs">
        <div>
          <span className="text-[11px] font-medium text-[#475569] block">
            {isHi ? `Kul ${selectedYear} Kharcha` : `Total ${selectedYear} Spend`}
          </span>
          <CurrencyDisplay
            amountMinor={yearlyData.totalYearSpendMinor}
            className="text-base sm:text-lg font-bold text-[#0F172A] mt-0.5 block"
          />
        </div>

        <div>
          <span className="text-[11px] font-medium text-[#475569] block">
            {isHi ? 'Ausat Mahina Kharcha' : 'Monthly Average'}
          </span>
          <CurrencyDisplay
            amountMinor={yearlyData.averageMonthlySpendMinor}
            className="text-base sm:text-lg font-bold text-[#1D4ED8] mt-0.5 block"
          />
        </div>

        <div>
          <span className="text-[11px] font-medium text-[#475569] block">
            {isHi ? 'Sabse Zyada Kharcha Mahina' : 'Peak Spending Month'}
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#0F172A] mt-0.5 block truncate">
            {peakMonth ? `${peakMonth.shortMonth} (${formatINR(peakMonth.totalSpendMinor)})` : (isHi ? 'Koi nahi' : 'None')}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-medium text-[#475569] block">
            {isHi ? 'Active Mahine' : 'Active Months'}
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#0F172A] font-mono mt-0.5 block">
            {yearlyData.activeMonthsCount} / 12 {isHi ? 'mahine' : 'months'}
          </span>
        </div>
      </div>

      {/* 3. The 12-Month Bar Graph */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartPoints}
            margin={{ top: 15, right: 10, left: 5, bottom: 5 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const clickedMonth = state.activePayload[0].payload.monthIndex;
                if (clickedMonth && onMonthSelect) {
                  onMonthSelect(clickedMonth);
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="shortMonth"
              stroke="#475569"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tickFormatter={(val) => (val === 0 ? '₹0' : `₹${(val / 1000).toFixed(0)}k`)}
            />
            <Tooltip
              cursor={{ fill: '#F1F5F9', opacity: 0.8 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-3 rounded-xl shadow-lg text-xs space-y-1.5 min-w-[180px]">
                      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1">
                        <span className="font-bold text-[#0F172A]">
                          {data.monthName} {selectedYear}
                        </span>
                        {data.isSelected && (
                          <span className="text-[10px] bg-[#EFF6FF] text-[#1D4ED8] font-semibold px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                            {isHi ? 'Spreadsheet me active' : 'Active in Spreadsheet'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#475569]">{isHi ? 'Kul Kharcha:' : 'Total Spend:'}</span>
                        <span className="font-mono font-bold text-[#0F172A]">
                          {formatINR(data.totalSpendMinor)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-[#475569]">
                        <span>{isHi ? 'Billein / Invoices:' : 'Invoices / Bills:'}</span>
                        <span className="font-mono font-medium text-[#0F172A]">
                          {data.receiptCount} {isHi ? 'billein' : data.receiptCount === 1 ? 'bill' : 'bills'}
                        </span>
                      </div>
                      {onMonthSelect && (
                        <p className="text-[10px] text-[#1D4ED8] font-semibold pt-1 border-t border-[#E2E8F0] text-center">
                          {isHi ? 'Upar spreadsheet kholne ke liye click karein ↑' : 'Click bar to inspect in spreadsheet above ↑'}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="spendRupees"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
              cursor="pointer"
            >
              {chartPoints.map((entry) => {
                const isSelected = entry.isSelected;
                const hasSpend = entry.totalSpendMinor > 0;
                const fill = isSelected
                  ? '#1D4ED8'
                  : hasSpend
                  ? '#3B82F6'
                  : '#E2E8F0';
                return (
                  <Cell
                    key={`cell-${entry.monthIndex}`}
                    fill={fill}
                    stroke={isSelected ? '#1E40AF' : 'transparent'}
                    strokeWidth={isSelected ? 1.5 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Footer hint & Month indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] text-[11px] text-[#475569]">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#1D4ED8]" />
            <span className="text-[#0F172A] font-medium">{isHi ? 'Spreadsheet me active mahina' : 'Active month in spreadsheet'}</span>
          </span>
          <span className="flex items-center gap-1.5 ml-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]" />
            <span>{isHi ? 'Darj kharcha' : 'Recorded spending'}</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#475569]">
          <Info className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
          <span>
            {isHi
              ? 'Sujhav: Kisi bhi mahine ke column par click karke upar spreadsheet dekhein.'
              : 'Tip: Click any month column above to switch the monthly spreadsheet.'}
          </span>
        </div>
      </div>
    </div>
  );
};
