/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrandLogo } from './BrandLogo.tsx';
import { Business } from '../types/index.ts';
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
  const navItems = [
    { id: '/', label: 'Home', icon: LayoutDashboard },
    { id: '/scan', label: 'Scan', icon: ScanLine },
    { id: '/ledger', label: 'Ledger', icon: ReceiptText },
    { id: '/save-more', label: 'Save More', icon: TrendingDown },
    { id: '/ask', label: 'Ask', icon: Sparkles },
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

          {/* Business & Demo Environment State */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#F7F8F5] border border-[#E2E7E2] text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#476C58] shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium text-[#25382D] truncate max-w-[100px] sm:max-w-[140px] text-[11px] sm:text-xs">
                  {business?.name || 'Green Basket Stores'}
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#64756A] truncate">
                  {business?.isDemo ? 'Demo (INR)' : 'Live'}
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
              <span className="hidden lg:inline">{isResetting ? 'Resetting...' : 'Reset Demo'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
