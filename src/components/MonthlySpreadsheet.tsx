/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Receipt } from '../types/index.ts';
import { CurrencyDisplay } from './CurrencyDisplay.tsx';
import { formatINR, paiseToRupees } from '../utils/finance.ts';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface MonthlySpreadsheetProps {
  receipts: Receipt[];
  initialYear?: number;
  initialMonth?: number; // 1-12
  selectedYear?: number;
  onYearChange?: (year: number) => void;
  selectedMonth?: number;
  onMonthChange?: (month: number) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const AVAILABLE_YEARS = [2026, 2025, 2024];

export const MonthlySpreadsheet: React.FC<MonthlySpreadsheetProps> = ({
  receipts,
  initialYear = 2026,
  initialMonth = 10, // October
  selectedYear: propSelectedYear,
  onYearChange: propOnYearChange,
  selectedMonth: propSelectedMonth,
  onMonthChange: propOnMonthChange,
}) => {
  const [internalYear, setInternalYear] = useState<number>(initialYear);
  const [internalMonth, setInternalMonth] = useState<number>(initialMonth);

  const selectedYear = propSelectedYear !== undefined ? propSelectedYear : internalYear;
  const setSelectedYear = (valOrFn: number | ((prev: number) => number)) => {
    const next = typeof valOrFn === 'function' ? valOrFn(selectedYear) : valOrFn;
    if (propOnYearChange) {
      propOnYearChange(next);
    } else {
      setInternalYear(next);
    }
  };

  const selectedMonth = propSelectedMonth !== undefined ? propSelectedMonth : internalMonth;
  const setSelectedMonth = (valOrFn: number | ((prev: number) => number)) => {
    const next = typeof valOrFn === 'function' ? valOrFn(selectedMonth) : valOrFn;
    if (propOnMonthChange) {
      propOnMonthChange(next);
    } else {
      setInternalMonth(next);
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthName = MONTH_NAMES[selectedMonth - 1];

  // Receipts in the selected month
  const monthReceipts = useMemo(() => {
    return receipts
      .filter((r) => r.transactionDate && r.transactionDate.startsWith(monthPrefix))
      .sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());
  }, [receipts, monthPrefix]);

  // Flattened spreadsheet rows from receipts and their line items
  const spreadsheetRows = useMemo(() => {
    const rows: {
      rowIndex: number;
      receiptId: string;
      date: string;
      supplier: string;
      invoiceNumber: string;
      category: string;
      description: string;
      qty: number;
      unit: string;
      unitPriceMinor: number;
      taxMinor: number;
      totalMinor: number;
    }[] = [];

    let count = 1;
    monthReceipts.forEach((r) => {
      if (r.items && r.items.length > 0) {
        r.items.forEach((item) => {
          // Attribute proportional tax to item if available
          const itemTaxShare = r.subtotalMinor > 0 ? Math.round((item.lineTotalMinor / r.subtotalMinor) * r.taxMinor) : 0;
          rows.push({
            rowIndex: count++,
            receiptId: r.id,
            date: r.transactionDate,
            supplier: r.merchantName,
            invoiceNumber: r.invoiceNumber,
            category: item.category,
            description: item.productName || item.originalDescription,
            qty: item.quantity,
            unit: item.unit,
            unitPriceMinor: item.unitPriceMinor,
            taxMinor: itemTaxShare,
            totalMinor: item.lineTotalMinor + itemTaxShare,
          });
        });
      } else {
        rows.push({
          rowIndex: count++,
          receiptId: r.id,
          date: r.transactionDate,
          supplier: r.merchantName,
          invoiceNumber: r.invoiceNumber,
          category: 'Store Supplies',
          description: 'Invoice Total',
          qty: 1,
          unit: 'bill',
          unitPriceMinor: r.subtotalMinor,
          taxMinor: r.taxMinor,
          totalMinor: r.totalMinor,
        });
      }
    });

    return rows;
  }, [monthReceipts]);

  // Aggregate totals for the month
  const totalSpendMinor = useMemo(() => {
    return monthReceipts.reduce((sum, r) => sum + r.totalMinor, 0);
  }, [monthReceipts]);

  const totalTaxMinor = useMemo(() => {
    return monthReceipts.reduce((sum, r) => sum + r.taxMinor, 0);
  }, [monthReceipts]);

  // Category breakdown for summary
  const categorySummary = useMemo(() => {
    const map: Record<string, { totalMinor: number; count: number }> = {};
    spreadsheetRows.forEach((row) => {
      if (!map[row.category]) {
        map[row.category] = { totalMinor: 0, count: 0 };
      }
      map[row.category].totalMinor += row.totalMinor;
      map[row.category].count += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].totalMinor - a[1].totalMinor);
  }, [spreadsheetRows]);

  // Export current monthly spreadsheet as CSV
  const handleExportCSV = () => {
    if (spreadsheetRows.length === 0) return;

    const headers = [
      'Row',
      'Date',
      'Supplier',
      'Invoice #',
      'Category',
      'Item Description',
      'Quantity',
      'Unit',
      'Unit Price (INR)',
      'Estimated GST/Tax (INR)',
      'Total Amount (INR)',
    ];

    const csvLines = [
      `"Pricewise Monthly Spending Spreadsheet - ${monthName} ${selectedYear}"`,
      `"Generated on: ${new Date().toLocaleDateString()}"`,
      '',
      headers.join(','),
      ...spreadsheetRows.map((r) =>
        [
          r.rowIndex,
          `"${r.date}"`,
          `"${r.supplier.replace(/"/g, '""')}"`,
          `"${r.invoiceNumber}"`,
          `"${r.category}"`,
          `"${r.description.replace(/"/g, '""')}"`,
          r.qty,
          `"${r.unit}"`,
          paiseToRupees(r.unitPriceMinor).toFixed(2),
          paiseToRupees(r.taxMinor).toFixed(2),
          paiseToRupees(r.totalMinor).toFixed(2),
        ].join(',')
      ),
      '',
      `"TOTAL MONTHLY SPENDING",,,,,,,,,,"${paiseToRupees(totalSpendMinor).toFixed(2)}"`,
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pricewise_Spreadsheet_${monthName}_${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* 1. Header with Month & Year Switcher Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E7E2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#476C58]" />
            <h2 className="text-lg font-bold text-[#25382D]">Monthly Spending Spreadsheet</h2>
          </div>
          <p className="text-xs text-[#64756A] mt-0.5">
            Spreadsheet ledger view of line items, unit prices, taxes, and category totals.
          </p>
        </div>

        {/* Month & Year Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Previous Month */}
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-[#E2E7E2] bg-[#F7F8F5] text-[#25382D] hover:bg-[#DCE7DD] transition-colors cursor-pointer"
            aria-label="Previous month"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E2E7E2] bg-[#F7F8F5] text-[#25382D] focus:outline-hidden focus:border-[#476C58] cursor-pointer"
            aria-label="Select month"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E2E7E2] bg-[#F7F8F5] text-[#25382D] focus:outline-hidden focus:border-[#476C58] cursor-pointer font-mono"
            aria-label="Select year"
          >
            {AVAILABLE_YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {/* Next Month */}
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-[#E2E7E2] bg-[#F7F8F5] text-[#25382D] hover:bg-[#DCE7DD] transition-colors cursor-pointer"
            aria-label="Next month"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={spreadsheetRows.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E7E2] bg-[#FFFFFF] text-xs font-medium text-[#25382D] hover:bg-[#F7F8F5] transition-colors cursor-pointer disabled:opacity-40"
            title="Export monthly spreadsheet to CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#476C58]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Monthly Summary Pill Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F8F5] p-3 rounded-xl border border-[#E2E7E2] text-xs">
        <div>
          <span className="text-[11px] text-[#64756A] block">Selected Period</span>
          <span className="font-bold text-[#25382D] text-sm mt-0.5 block">
            {monthName} {selectedYear}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-[#64756A] block">Total Monthly Spending</span>
          <CurrencyDisplay
            amountMinor={totalSpendMinor}
            className="font-bold text-[#25382D] text-sm mt-0.5 block"
          />
        </div>

        <div>
          <span className="text-[11px] text-[#64756A] block">Recorded Purchases</span>
          <span className="font-bold text-[#25382D] text-sm mt-0.5 block">
            {monthReceipts.length} bills ({spreadsheetRows.length} line items)
          </span>
        </div>

        <div>
          <span className="text-[11px] text-[#64756A] block">GST & Taxes</span>
          <CurrencyDisplay
            amountMinor={totalTaxMinor}
            className="font-bold text-[#64756A] text-sm mt-0.5 block"
          />
        </div>
      </div>

      {/* 3. The Spreadsheet Table */}
      <div className="border border-[#D4DDD5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-[440px]">
          <table className="w-full text-left border-collapse text-xs select-text">
            {/* Spreadsheet Table Header */}
            <thead className="sticky top-0 z-10 bg-[#EDF1EE] border-b border-[#D4DDD5] text-[#25382D] font-mono shadow-2xs">
              <tr>
                <th className="py-2.5 px-3 font-semibold w-10 text-center border-r border-[#D4DDD5] bg-[#E5EBE6]">
                  #
                </th>
                <th className="py-2.5 px-3 font-semibold w-24 border-r border-[#D4DDD5]">Date</th>
                <th className="py-2.5 px-3 font-semibold border-r border-[#D4DDD5] min-w-[160px]">
                  Supplier / Payee
                </th>
                <th className="py-2.5 px-3 font-semibold border-r border-[#D4DDD5] min-w-[130px]">
                  Category
                </th>
                <th className="py-2.5 px-3 font-semibold border-r border-[#D4DDD5] min-w-[220px]">
                  Item Description
                </th>
                <th className="py-2.5 px-3 font-semibold text-right w-16 border-r border-[#D4DDD5]">Qty</th>
                <th className="py-2.5 px-3 font-semibold w-16 border-r border-[#D4DDD5]">Unit</th>
                <th className="py-2.5 px-3 font-semibold text-right border-r border-[#D4DDD5] min-w-[100px]">
                  Unit Price
                </th>
                <th className="py-2.5 px-3 font-semibold text-right border-r border-[#D4DDD5] min-w-[90px]">
                  GST
                </th>
                <th className="py-2.5 px-3 font-semibold text-right min-w-[110px] bg-[#E5EBE6]">
                  Total
                </th>
              </tr>
            </thead>

            {/* Spreadsheet Rows */}
            <tbody className="divide-y divide-[#E2E7E2] bg-[#FFFFFF]">
              {spreadsheetRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-[#64756A] space-y-1">
                    <Layers className="w-6 h-6 mx-auto text-[#A9BCAE] mb-2" />
                    <p className="font-semibold text-[#25382D]">
                      No purchases recorded for {monthName} {selectedYear}
                    </p>
                    <p className="text-[11px]">
                      Use the month switcher above to browse previous months or upload a receipt in the Scan tab.
                    </p>
                  </td>
                </tr>
              ) : (
                spreadsheetRows.map((row) => (
                  <tr
                    key={`${row.receiptId}-${row.rowIndex}`}
                    className="hover:bg-[#F7F8F5] transition-colors border-b border-[#E8ECE8]"
                  >
                    <td className="py-2 px-3 text-center font-mono text-[11px] text-[#64756A] border-r border-[#E8ECE8] bg-[#FAFBF9]">
                      {row.rowIndex}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-[#25382D] border-r border-[#E8ECE8] whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-2 px-3 font-medium text-[#25382D] border-r border-[#E8ECE8] truncate max-w-[180px]">
                      {row.supplier}
                    </td>
                    <td className="py-2 px-3 text-[#64756A] border-r border-[#E8ECE8] whitespace-nowrap">
                      {row.category}
                    </td>
                    <td className="py-2 px-3 text-[#25382D] border-r border-[#E8ECE8] truncate max-w-[240px]">
                      {row.description}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[#25382D] border-r border-[#E8ECE8]">
                      {row.qty}
                    </td>
                    <td className="py-2 px-3 text-[#64756A] border-r border-[#E8ECE8]">
                      {row.unit}
                    </td>
                    <td className="py-2 px-3 text-right border-r border-[#E8ECE8] whitespace-nowrap">
                      <CurrencyDisplay
                        amountMinor={row.unitPriceMinor}
                        showDecimals
                        className="font-medium text-[#25382D]"
                      />
                    </td>
                    <td className="py-2 px-3 text-right border-r border-[#E8ECE8] whitespace-nowrap text-[#64756A]">
                      <CurrencyDisplay amountMinor={row.taxMinor} />
                    </td>
                    <td className="py-2 px-3 text-right font-bold whitespace-nowrap bg-[#FAFBF9]">
                      <CurrencyDisplay amountMinor={row.totalMinor} className="text-[#25382D]" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Spreadsheet Total Summary Row */}
            {spreadsheetRows.length > 0 && (
              <tfoot className="bg-[#EDF1EE] border-t-2 border-[#D4DDD5] text-xs font-bold text-[#25382D]">
                <tr>
                  <td colSpan={5} className="py-2.5 px-3 text-right border-r border-[#D4DDD5] font-sans">
                    TOTAL MONTHLY SPENDING (SUM):
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono border-r border-[#D4DDD5]">
                    {spreadsheetRows.reduce((acc, r) => acc + r.qty, 0)}
                  </td>
                  <td className="py-2.5 px-3 border-r border-[#D4DDD5]">-</td>
                  <td className="py-2.5 px-3 text-right border-r border-[#D4DDD5]">-</td>
                  <td className="py-2.5 px-3 text-right border-r border-[#D4DDD5]">
                    <CurrencyDisplay amountMinor={totalTaxMinor} />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm bg-[#E5EBE6]">
                    <CurrencyDisplay amountMinor={totalSpendMinor} className="text-[#25382D]" />
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 4. Category Breakdown Subtotals for the Month */}
      {categorySummary.length > 0 && (
        <div className="pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64756A] block mb-2">
            Category Breakdown for {monthName} {selectedYear}
          </span>
          <div className="flex flex-wrap gap-2">
            {categorySummary.map(([cat, data]) => {
              const percentage = totalSpendMinor > 0 ? ((data.totalMinor / totalSpendMinor) * 100).toFixed(0) : '0';
              return (
                <div
                  key={cat}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F7F8F5] border border-[#E2E7E2] text-xs"
                >
                  <span className="font-semibold text-[#25382D]">{cat}:</span>
                  <CurrencyDisplay amountMinor={data.totalMinor} className="font-bold text-[#476C58]" />
                  <span className="text-[10px] text-[#64756A]">({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
