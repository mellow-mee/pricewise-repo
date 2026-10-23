/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Receipt } from '../types/index.ts';
import { MonthlySpreadsheet } from '../components/MonthlySpreadsheet.tsx';
import { YearlyExpenditureGraph } from '../components/YearlyExpenditureGraph.tsx';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface LedgerViewProps {
  receipts: Receipt[];
  onReceiptUpdated?: (updated: Receipt) => void;
  onReceiptDeleted?: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  receipts,
  onNavigate,
}) => {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  // Shared Year & Month state driving both the monthly spreadsheet and the yearly expenditure graph
  const [spreadsheetYear, setSpreadsheetYear] = useState<number>(2026);
  const [spreadsheetMonth, setSpreadsheetMonth] = useState<number>(10); // October

  return (
    <div className="space-y-8 pb-24 md:pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            {t('ledger_title')}
          </h1>
          <p className="text-sm text-[#475569] mt-0.5">
            {t('ledger_subtitle')}
          </p>
        </div>

        <button
          onClick={() => onNavigate('/scan')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#172554] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isHi ? 'Naya Bill Scan Karein' : 'Scan New Invoice'}</span>
        </button>
      </div>

      {/* 2. Monthly Spending Spreadsheet (Positioned above Yearly Expenditure Analysis) */}
      <section aria-label="Monthly Spending Spreadsheet">
        <MonthlySpreadsheet
          receipts={receipts}
          selectedYear={spreadsheetYear}
          onYearChange={setSpreadsheetYear}
          selectedMonth={spreadsheetMonth}
          onMonthChange={setSpreadsheetMonth}
        />
      </section>

      {/* 3. Year-wise Monthly Expenditure Graph & Analytics */}
      <section className="space-y-4 pt-2" aria-label="Yearly Expenditure Graph">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              {isHi ? 'Kharche Ka Varshik Vishleshan' : 'Yearly Expenditure Analysis'}
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">
              {isHi
                ? 'Mahina-dar-mahina kharche ka graph aur category trend.'
                : 'Month-by-month spending trends and historical patterns.'}
            </p>
          </div>
        </div>
        <YearlyExpenditureGraph
          receipts={receipts}
          selectedYear={spreadsheetYear}
          onYearChange={setSpreadsheetYear}
          selectedMonth={spreadsheetMonth}
          onMonthSelect={setSpreadsheetMonth}
        />
      </section>
    </div>
  );
};
