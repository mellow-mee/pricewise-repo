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
    <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* 1. Header with Title & Year Selection (Synced with Spreadsheet) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E7E2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#476C58]" />
            <h2 className="text-lg font-bold text-[#25382D]">
              Yearly Expenditure Graph ({selectedYear})
            </h2>
          </div>
          <p className="text-xs text-[#64756A] mt-0.5">
            Total store expenditure broken down month-by-month for {selectedYear}.
          </p>
        </div>

        {/* Year Selector Button / Dropdown (Exact same control as the spreadsheet) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#64756A] font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Select Year:</span>
          </span>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange?.(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#476C58] bg-[#FAFBF9] text-[#25382D] focus:outline-hidden focus:ring-2 focus:ring-[#476C58]/20 cursor-pointer font-mono shadow-2xs hover:bg-[#F2F6F3] transition-colors"
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F8F5] p-3 rounded-xl border border-[#E2E7E2] text-xs">
        <div>
          <span className="text-[11px] text-[#64756A] block">Total {selectedYear} Spend</span>
          <CurrencyDisplay
            amountMinor={yearlyData.totalYearSpendMinor}
            className="text-base sm:text-lg font-bold text-[#25382D] mt-0.5 block"
          />
        </div>

        <div>
          <span className="text-[11px] text-[#64756A] block">Monthly Average</span>
          <CurrencyDisplay
            amountMinor={yearlyData.averageMonthlySpendMinor}
            className="text-base sm:text-lg font-bold text-[#476C58] mt-0.5 block"
          />
        </div>

        <div>
          <span className="text-[11px] text-[#64756A] block">Peak Spending Month</span>
          <span className="text-xs sm:text-sm font-bold text-[#25382D] mt-0.5 block truncate">
            {peakMonth ? `${peakMonth.shortMonth} (${formatINR(peakMonth.totalSpendMinor)})` : 'None'}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-[#64756A] block">Active Months</span>
          <span className="text-xs sm:text-sm font-bold text-[#25382D] font-mono mt-0.5 block">
            {yearlyData.activeMonthsCount} / 12 months
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
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E7E2" vertical={false} />
            <XAxis
              dataKey="shortMonth"
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
              tickFormatter={(val) => (val === 0 ? '₹0' : `₹${(val / 1000).toFixed(0)}k`)}
            />
            <Tooltip
              cursor={{ fill: '#EDF1EE', opacity: 0.6 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#FFFFFF] border border-[#E2E7E2] p-3 rounded-xl shadow-lg text-xs space-y-1.5 min-w-[180px]">
                      <div className="flex items-center justify-between border-b border-[#E2E7E2] pb-1">
                        <span className="font-bold text-[#25382D]">
                          {data.monthName} {selectedYear}
                        </span>
                        {data.isSelected && (
                          <span className="text-[10px] bg-[#DCE7DD] text-[#476C58] font-semibold px-1.5 py-0.5 rounded">
                            Active in Table
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#64756A]">Total Spend:</span>
                        <span className="font-mono font-bold text-[#25382D]">
                          {formatINR(data.totalSpendMinor)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-[#64756A]">
                        <span>Invoices / Bills:</span>
                        <span className="font-mono font-medium">
                          {data.receiptCount} {data.receiptCount === 1 ? 'bill' : 'bills'}
                        </span>
                      </div>
                      {onMonthSelect && (
                        <p className="text-[10px] text-[#476C58] font-medium pt-1 border-t border-[#E2E7E2] text-center">
                          Click bar to open in monthly spreadsheet ↓
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
                // If selected in spreadsheet, highlight with rich forest green; otherwise soft sage green
                const isSelected = entry.isSelected;
                const hasSpend = entry.totalSpendMinor > 0;
                const fill = isSelected
                  ? '#25382D'
                  : hasSpend
                  ? '#476C58'
                  : '#DCE7DD';
                return (
                  <Cell
                    key={`cell-${entry.monthIndex}`}
                    fill={fill}
                    stroke={isSelected ? '#18241D' : 'transparent'}
                    strokeWidth={isSelected ? 1.5 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Footer hint & Month Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E2E7E2] text-[11px] text-[#64756A]">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#25382D]" />
            <span>Active month in spreadsheet</span>
          </span>
          <span className="flex items-center gap-1.5 ml-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#476C58]" />
            <span>Recorded spending</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#64756A]">
          <Info className="w-3.5 h-3.5 text-[#476C58] shrink-0" />
          <span>Tip: Click any month column above to switch the spreadsheet view below.</span>
        </div>
      </div>
    </div>
  );
};
