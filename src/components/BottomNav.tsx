import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  ReceiptText,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface BottomNavProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onRouteChange }) => {
  const { t } = useLanguage();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] border-t border-[#E2E8F0] px-2 py-1.5 pb-safe shadow-lg"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around">
        {/* 1. Home */}
        <button
          onClick={() => onRouteChange('/')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer min-w-[56px] min-h-[48px] ${
            currentRoute === '/'
              ? 'text-[#1D4ED8]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
          aria-label="Home Dashboard"
          aria-current={currentRoute === '/' ? 'page' : undefined}
        >
          <LayoutDashboard className={`w-5 h-5 mb-0.5 ${currentRoute === '/' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] truncate max-w-[70px]">{t('nav_home')}</span>
        </button>

        {/* 2. Ledger */}
        <button
          onClick={() => onRouteChange('/ledger')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer min-w-[56px] min-h-[48px] ${
            currentRoute === '/ledger'
              ? 'text-[#1D4ED8]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
          aria-label="Expense Ledger"
          aria-current={currentRoute === '/ledger' ? 'page' : undefined}
        >
          <ReceiptText className={`w-5 h-5 mb-0.5 ${currentRoute === '/ledger' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] truncate max-w-[70px]">{t('nav_ledger')}</span>
        </button>

        {/* 3. Central Scan Action */}
        <button
          onClick={() => onRouteChange('/scan')}
          className="flex flex-col items-center justify-center -mt-4 transition-transform active:scale-95 cursor-pointer"
          aria-label="Scan Receipt or Invoice"
          aria-current={currentRoute === '/scan' ? 'page' : undefined}
        >
          <div
            className={`w-13 h-13 rounded-full flex items-center justify-center shadow-md transition-colors ${
              currentRoute === '/scan'
                ? 'bg-[#1E40AF] text-white ring-4 ring-[#DBEAFE]'
                : 'bg-[#1D4ED8] text-white hover:bg-[#1E40AF] ring-4 ring-[#FFFFFF]'
            }`}
          >
            <ScanLine className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span
            className={`text-[11px] mt-1 font-semibold truncate max-w-[70px] ${
              currentRoute === '/scan' ? 'text-[#1E40AF]' : 'text-[#1D4ED8]'
            }`}
          >
            {t('nav_scan')}
          </span>
        </button>

        {/* 4. Save More */}
        <button
          onClick={() => onRouteChange('/save-more')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer min-w-[56px] min-h-[48px] ${
            currentRoute === '/save-more'
              ? 'text-[#1D4ED8]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
          aria-label="Save More Benchmarks"
          aria-current={currentRoute === '/save-more' ? 'page' : undefined}
        >
          <TrendingDown className={`w-5 h-5 mb-0.5 ${currentRoute === '/save-more' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] truncate max-w-[70px]">{t('nav_save_more')}</span>
        </button>

        {/* 5. Ask Assistant */}
        <button
          onClick={() => onRouteChange('/ask')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer min-w-[56px] min-h-[48px] ${
            currentRoute === '/ask'
              ? 'text-[#1D4ED8]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
          aria-label="Ask AI Assistant"
          aria-current={currentRoute === '/ask' ? 'page' : undefined}
        >
          <Sparkles className={`w-5 h-5 mb-0.5 ${currentRoute === '/ask' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] truncate max-w-[70px]">{t('nav_ask')}</span>
        </button>
      </div>
    </nav>
  );
};
