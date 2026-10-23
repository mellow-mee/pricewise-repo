/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { HomeView } from './views/HomeView.tsx';
import { ScanView } from './views/ScanView.tsx';
import { LedgerView } from './views/LedgerView.tsx';
import { SaveMoreView } from './views/SaveMoreView.tsx';
import { AskView } from './views/AskView.tsx';
import {
  Business,
  PriceBenchmark,
  Receipt,
  SavingsOpportunity,
} from './types/index.ts';
import {
  getActiveBusiness,
  getBenchmarks,
  getOpportunities,
  getReceipts,
  resetDemoDatabase,
} from './services/api.ts';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { LanguageProvider } from './context/LanguageContext.tsx';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    const valid = ['/', '/scan', '/ledger', '/save-more', '/ask'];
    return valid.includes(path) ? path : '/';
  });

  const [business, setBusiness] = useState<Business | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [benchmarks, setBenchmarks] = useState<PriceBenchmark[]>([]);
  const [opportunities, setOpportunities] = useState<SavingsOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Sync route with browser history
  const navigateTo = useCallback((route: string) => {
    const pathOnly = route.split('?')[0];
    const valid = ['/', '/scan', '/ledger', '/save-more', '/ask'];
    setCurrentRoute(valid.includes(pathOnly) ? pathOnly : '/');
    if (window.location.pathname + window.location.search !== route) {
      window.history.pushState({}, '', route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const valid = ['/', '/scan', '/ledger', '/save-more', '/ask'];
      setCurrentRoute(valid.includes(path) ? path : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch initial app state from persistent server
  const loadAppData = useCallback(async () => {
    try {
      const [bizData, receiptsData, bmkData, oppsData] = await Promise.all([
        getActiveBusiness(),
        getReceipts(),
        getBenchmarks(),
        getOpportunities(),
      ]);
      setBusiness(bizData);
      setReceipts(receiptsData);
      setBenchmarks(bmkData);
      setOpportunities(oppsData);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  // Show transient toast
  const triggerToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Reset demo database handler
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetDemoDatabase();
      await loadAppData();
      triggerToast('Demo database restored to pristine 6-month state.', 'info');
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  // Handlers for updating state when user modifies receipts
  const handleReceiptSaved = (saved: Receipt) => {
    setReceipts((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
    // Re-fetch opportunities to reflect new purchase
    getOpportunities().then(setOpportunities);
    triggerToast(`Invoice ${saved.invoiceNumber || saved.merchantName} confirmed and added to ledger!`);
  };

  const handleReceiptUpdated = (updated: Receipt) => {
    setReceipts((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    getOpportunities().then(setOpportunities);
    triggerToast('Transaction record updated successfully.');
  };

  const handleReceiptDeleted = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
    getOpportunities().then(setOpportunities);
    triggerToast('Transaction deleted from ledger.', 'info');
  };

  const handleConsentUpdated = (enabled: boolean) => {
    if (business) {
      setBusiness({ ...business, benchmarkParticipationEnabled: enabled });
    }
    triggerToast(
      enabled
        ? 'Opted into collective purchasing intelligence network.'
        : 'Collective benchmark data contribution paused.',
      'info'
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8F5] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#DCE7DD] text-[#476C58] flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-semibold text-[#25382D]">Loading Pricewise</h2>
          <p className="text-xs text-[#64756A]">Preparing your purchasing intelligence ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#F7F8F5] text-[#25382D] flex flex-col font-sans">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-18 right-4 z-50 bg-[#FFFFFF] border border-[#E2E7E2] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#2E7D4F] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#476C58] shrink-0" />
            )}
            <span className="font-medium text-[#25382D]">{toastMessage.text}</span>
          </div>
        )}

        {/* Top Navbar (Desktop & Tablet) */}
        <Navbar
          currentRoute={currentRoute}
          onRouteChange={navigateTo}
          business={business}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
        />

        {/* Main Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {currentRoute === '/' && (
            <HomeView
              business={business}
              receipts={receipts}
              opportunities={opportunities}
              onNavigate={navigateTo}
            />
          )}

          {currentRoute === '/scan' && (
            <ScanView onSaved={handleReceiptSaved} onNavigate={navigateTo} />
          )}

          {currentRoute === '/ledger' && (
            <LedgerView
              receipts={receipts}
              onReceiptUpdated={handleReceiptUpdated}
              onReceiptDeleted={handleReceiptDeleted}
              onNavigate={navigateTo}
            />
          )}

          {currentRoute === '/save-more' && (
            <SaveMoreView
              business={business}
              opportunities={opportunities}
              benchmarks={benchmarks}
              onConsentUpdated={handleConsentUpdated}
              onNavigate={navigateTo}
            />
          )}

          {currentRoute === '/ask' && (
            <AskView business={business} receipts={receipts} onNavigate={navigateTo} />
          )}
        </main>

        {/* Bottom Navigation (Mobile Only) */}
        <BottomNav currentRoute={currentRoute} onRouteChange={navigateTo} />
      </div>
    </LanguageProvider>
  );
}
