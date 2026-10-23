import React from 'react';
import { BrandLogo } from './BrandLogo.tsx';
import { Business } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  LayoutDashboard,
  ScanLine,
  ReceiptText,
  TrendingDown,
  Sparkles,
  RotateCcw,
  Building2,
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
  business: Business | null;
  onResetDemo: () => void;
  isResetting?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onRouteChange,
  business,
  onResetDemo,
  isResetting = false,
}) => {
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { id: '/', label: t('nav_home'), icon: LayoutDashboard },
    { id: '/scan', label: t('nav_scan'), icon: ScanLine },
    { id: '/ledger', label: t('nav_ledger'), icon: ReceiptText },
    { id: '/save-more', label: t('nav_save_more'), icon: TrendingDown },
    { id: '/ask', label: t('nav_ask'), icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E2E7E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark */}
          <button
            onClick={() => onRouteChange('/')}
            className="flex items-center text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#476C58] rounded-md"
            aria-label="Pricewise Home"
          >
            <BrandLogo size="md" />
          </button>

          {/* Desktop Horizontal Navigation (Mandatory: No persistent sidebar) */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onRouteChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#DCE7DD] text-[#25382D] font-semibold'
                      : 'text-[#64756A] hover:text-[#25382D] hover:bg-[#F7F8F5]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#476C58]' : 'text-[#64756A]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Business & Demo Environment State + Language Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Top-Right English / Hinglish Toggle */}
            <div
              className="flex items-center p-0.5 rounded-lg border border-[#E2E7E2] bg-[#F7F8F5] text-xs font-medium"
              role="group"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  language === 'en'
                    ? 'bg-[#FFFFFF] text-[#25382D] shadow-xs font-semibold'
                    : 'text-[#64756A] hover:text-[#25382D]'
                }`}
                aria-pressed={language === 'en'}
                title="Switch to English"
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  language === 'hi'
                    ? 'bg-[#FFFFFF] text-[#25382D] shadow-xs font-semibold'
                    : 'text-[#64756A] hover:text-[#25382D]'
                }`}
                aria-pressed={language === 'hi'}
                title="Switch to Hinglish"
              >
                Hinglish
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#F7F8F5] border border-[#E2E7E2] text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#476C58] shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium text-[#25382D] truncate max-w-[100px] sm:max-w-[130px] text-[11px] sm:text-xs">
                  {business?.name || 'Green Basket Stores'}
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#64756A] truncate">
                  {business?.isDemo ? t('demo_badge') : t('live_badge')}
                </span>
              </div>
            </div>

            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E7E2] bg-[#FFFFFF] text-xs font-medium text-[#64756A] hover:text-[#25382D] hover:bg-[#F7F8F5] transition-colors cursor-pointer disabled:opacity-50"
              title="Reset data to initial demo state"
              aria-label="Reset demo data"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline">{isResetting ? t('resetting') : t('reset_demo')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
