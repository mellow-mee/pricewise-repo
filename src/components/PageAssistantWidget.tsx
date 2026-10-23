/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RefreshCw,
  ChevronDown,
  Layers,
  ArrowUpRight,
  Bot,
  User,
  Info,
} from 'lucide-react';
import {
  AssistantChatMessage,
  Business,
  PageAssistantContext,
  PriceBenchmark,
  Receipt,
  SavingsOpportunity,
} from '../types/index.ts';
import { askAssistant } from '../services/api.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { formatINR } from '../utils/finance.ts';

interface PageAssistantWidgetProps {
  currentRoute: string;
  business: Business | null;
  receipts: Receipt[];
  opportunities: SavingsOpportunity[];
  benchmarks: PriceBenchmark[];
  onNavigate: (route: string) => void;
}

export const PageAssistantWidget: React.FC<PageAssistantWidgetProps> = ({
  currentRoute,
  business,
  receipts,
  opportunities,
  benchmarks,
  onNavigate,
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derive current page title, summary and quick questions based on the route
  const pageMeta = React.useMemo(() => {
    switch (currentRoute) {
      case '/ledger':
        return {
          title: isHi ? 'Kharcha Khata (Ledger)' : 'Purchase Ledger & Spreadsheet',
          badge: isHi ? 'Ledger' : 'Ledger',
          summary: isHi
            ? `${receipts.length} bills · Monthly Spending Spreadsheet · Yearly Expenditure Bar Chart`
            : `${receipts.length} bills recorded · Monthly Spending Spreadsheet · Yearly Expenditure Analysis`,
          quickPrompts: isHi
            ? [
                'Sabse zyada kharcha kis mahine hua?',
                'Monthly spreadsheet mein categories ka kya hisaab hai?',
                'Top vendors kaun se hain?',
              ]
            : [
                'Which month had the highest spending?',
                'Explain the monthly spreadsheet breakdown',
                'Who are our top suppliers?',
              ],
          initialGreeting: isHi
            ? `Namaste! Main aapka **Purchase Ledger Assistant** hoon. Main is page par chal rahe **Monthly Spending Spreadsheet**, **Yearly Expenditure Analysis**, aur aapke **${receipts.length} itemized bills** ke har hisaab ko jaanta hoon. Aap spreadsheet ya kisi bhi mahine ke kharche ke baare mein pooch sakte hain!`
            : `Hello! I'm your **Purchase Ledger Assistant**. I have direct visibility into the **Monthly Spending Spreadsheet**, the **Yearly Expenditure Analysis**, and all **${receipts.length} itemized receipts** visible on this page. Ask me anything about monthly totals, category splits, or vendor history!`,
        };
      case '/save-more':
        return {
          title: isHi ? 'Bachat Benchmarks (Save More)' : 'Save More & Price Benchmarks',
          badge: isHi ? 'Bachat' : 'Save More',
          summary: isHi
            ? `${benchmarks.length} benchmarks · ₹3,850 identified bachat · 14 peer dukaanein`
            : `${benchmarks.length} collective benchmarks · ₹3,850 potential savings · 14 peer stores`,
          quickPrompts: isHi
            ? [
                'Sabse zyada bachat kis item par mil sakti hai?',
                'Wholesale median bhaav kaise nikalte hain?',
                'Kya hamara tea rate competitive hai?',
              ]
            : [
                'Which item has our highest savings opportunity?',
                'How are regional benchmarks calculated?',
                'Are our tea purchases already competitive?',
              ],
          initialGreeting: isHi
            ? `Namaste! Main aapka **Savings Intelligence Assistant** hoon. Is page par maujood **Collective Price Benchmarks**, regional wholesale medians aur identified **₹3,850 savings opportunities** par meri poori nazar hai. Poochiye ki kahan discount ya renegotiation ka scope hai!`
            : `Hello! I'm your **Savings Intelligence Assistant**. I'm analyzing the **Collective Price Benchmarks** and identified **₹3,850 in potential savings** shown on this screen. Ask me about unit price differences, peer medians, or renegotiation tips!`,
        };
      case '/scan':
        return {
          title: isHi ? 'Bill Scanner (Invoices)' : 'Bill & Invoice Scanner',
          badge: isHi ? 'Scanner' : 'Scanner',
          summary: isHi
            ? `3-step AI OCR digitizer · Line-item reconciliation · Review flags`
            : `3-step AI OCR digitizer · Line-item reconciliation · Review flags`,
          quickPrompts: isHi
            ? [
                'Bill scan kaise kaam karta hai?',
                'Review flag lagne par kya karein?',
                'Add to Stock button kab dabana chahiye?',
              ]
            : [
                'How does the receipt scanning work?',
                'What causes an item review flag?',
                'What should I verify before clicking Add to Stock?',
              ],
          initialGreeting: isHi
            ? `Namaste! Main aapka **Bill Scanner Assistant** hoon. Is page par aap paper receipts ya bills upload karke digitalize kar sakte hain. Main OCR extraction, unit-price flags aur tax discrepancy verify karne mein madad kar sakta hoon!`
            : `Hello! I'm your **Invoice Scanner Assistant**. I can help you with the 3-step receipt digitization process, explaining line-item OCR extraction, review flags, or reconciling tax differences before you save!`,
        };
      case '/ask':
        return {
          title: isHi ? 'Purchasing Assistant' : 'Purchasing Intelligence',
          badge: isHi ? 'AI Tab' : 'Ask AI',
          summary: isHi
            ? `Store purchasing intelligence · Category breakdown · Vendor analytics`
            : `Store purchasing intelligence · Category breakdown · Vendor analytics`,
          quickPrompts: isHi
            ? [
                'Is mahine ka kharcha samjhaiye',
                'Kharche mein turant bachat kahan se shuru karein?',
              ]
            : [
                "Explain this month's spending",
                'Where can I reduce purchasing costs?',
              ],
          initialGreeting: isHi
            ? `Aap abhi **Ask Tab** par hain! Yahan aap dukaani purchasing se juda koi bhi general ya deep intelligence sawaal pooch sakte hain.`
            : `You are currently on the full **Ask Tab**! You can ask deep cross-store purchasing queries or use the floating assistant for instant page answers.`,
        };
      default: // '/' Home
        return {
          title: isHi ? 'Dukaan Overview (Home)' : 'Business Overview',
          badge: isHi ? 'Overview' : 'Overview',
          summary: isHi
            ? `Total Purchases This Month · Possible Savings · 12 Bills Recorded · 1 Needs Review`
            : `Total Purchases This Month · Possible Savings · Bills Recorded · Needs Review`,
          quickPrompts: isHi
            ? [
                'Is mahine ka kul kharcha samjhaiye',
                'Review card mein kaunsa bill pending hai?',
                'Sambhavit bachat ka hisaab kaisa hai?',
              ]
            : [
                "Explain this month's spending breakdown",
                'Which bill is currently flagged in Needs Review?',
                'How was the possible savings calculated?',
              ],
          initialGreeting: isHi
            ? `Namaste! Main aapka **Store Overview Assistant** hoon. Main is homepage ke charon cards — **Total Purchases This Month**, **Possible Savings**, **Bills Recorded**, aur **Needs Review** — ke sabhi live data par aadharit sawaalon ke jawab de sakta hoon!`
            : `Hello! I'm your **Store Overview Assistant**. I'm directly monitoring the cards on this dashboard: **Total Purchases This Month**, **Possible Savings**, **Bills Recorded**, and **Needs Review**. Ask me anything about what's shown on this screen!`,
        };
    }
  }, [currentRoute, isHi, receipts.length, benchmarks.length]);

  // Reset or load initial page greeting when page changes or widget opened
  useEffect(() => {
    setMessages([
      {
        id: `greeting-${currentRoute}-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: pageMeta.initialGreeting,
      },
    ]);
  }, [currentRoute, pageMeta.initialGreeting]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: AssistantChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const pageContext: PageAssistantContext = {
      route: currentRoute,
      pageTitle: pageMeta.title,
      visibleContentSummary: pageMeta.summary,
    };

    try {
      const assistantReply = await askAssistant(query, language, pageContext);
      setMessages((prev) => [...prev, assistantReply]);
    } catch (err: any) {
      console.error('Page assistant error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          text: isHi
            ? 'Maaf kijiye, is sawaal ka uttar lene mein samasya aayi. Kripya punah prayas karein.'
            : 'Sorry, I encountered an issue retrieving the response. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `greeting-reset-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: pageMeta.initialGreeting,
      },
    ]);
  };

  return (
    <>
      {/* 1. Floating Trigger Button at Bottom Right of Each Page */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Page Assistant"
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#172554] text-white shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer border border-white/20 select-none animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center gap-1.5 text-left">
              <span className="text-xs sm:text-sm font-semibold tracking-tight">
                {isHi ? 'Page Assistant' : 'Ask about this page'}
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/20 text-white">
                {pageMeta.badge}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* 2. Floating Popover Card at Bottom Right */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Page AI Assistant Dialog"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[540px] max-h-[82vh] bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* A. Header */}
          <div className="px-4 py-3.5 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-[#0F172A] truncate">
                    {isHi ? 'Page Assistant' : 'Page Assistant'}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                    {pageMeta.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#475569] truncate">
                  {pageMeta.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleResetChat}
                title={isHi ? 'Chat reset karein' : 'Clear conversation'}
                className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#475569] flex items-center justify-center transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title={isHi ? 'Band karein' : 'Close'}
                className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#475569] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* B. Grounding Context Strip */}
          <div className="px-3.5 py-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between gap-2 text-[11px] text-[#475569] shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Info className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
              <span className="truncate">{pageMeta.summary}</span>
            </div>
            {currentRoute !== '/ask' && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('/ask');
                }}
                className="inline-flex items-center gap-0.5 text-[#1D4ED8] hover:underline font-semibold shrink-0 cursor-pointer"
              >
                <span>{isHi ? 'Ask Tab' : 'Ask Tab'}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* C. Conversation Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FFFFFF]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl text-xs sm:text-[13px] leading-relaxed p-3 ${
                    msg.sender === 'user'
                      ? 'bg-[#1D4ED8] text-white rounded-br-none shadow-xs'
                      : 'bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-1">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>
                        {paragraph.split('\n').map((line, lIdx) => {
                          // Format bold bullet lines
                          if (line.trim().startsWith('•')) {
                            return (
                              <span key={lIdx} className="block pl-1 my-0.5">
                                {line}
                              </span>
                            );
                          }
                          return (
                            <span key={lIdx} className="block">
                              {line}
                            </span>
                          );
                        })}
                      </p>
                    ))}
                  </div>

                  {/* Grounded metrics pills */}
                  {msg.groundedMetrics && msg.groundedMetrics.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] flex flex-wrap gap-1.5">
                      {msg.groundedMetrics.map((gm, gmIdx) => (
                        <div
                          key={gmIdx}
                          className="px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#BFDBFE] text-[10px] font-semibold text-[#1D4ED8]"
                        >
                          <span className="text-[#475569] font-normal mr-1">{gm.label}:</span>
                          <span>{gm.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested follow-up buttons */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#475569] tracking-wider block">
                        {isHi ? 'Agla Sawaal:' : 'Suggested follow-up:'}
                      </span>
                      {msg.suggestedFollowUps.slice(0, 2).map((fu, fuIdx) => (
                        <button
                          key={fuIdx}
                          onClick={() => handleSendMessage(fu)}
                          className="w-full text-left text-[11px] p-1.5 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] font-medium transition-colors cursor-pointer flex items-center justify-between"
                        >
                          <span className="truncate">{fu}</span>
                          <ArrowUpRight className="w-3 h-3 shrink-0 ml-1 text-[#1D4ED8]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl rounded-bl-none p-3 text-xs text-[#475569] flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1D4ED8]" />
                  <span>{isHi ? 'Page content analyze kar rahe hain...' : 'Analyzing page content...'}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* D. Quick Context Prompts */}
          <div className="px-3 py-2 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            <span className="text-[10px] font-semibold uppercase text-[#475569] shrink-0 mr-0.5">
              {isHi ? 'Sujhav:' : 'Ask:'}
            </span>
            {pageMeta.quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[#FFFFFF] hover:bg-[#EFF6FF] hover:text-[#1D4ED8] text-[#334155] border border-[#E2E8F0] shrink-0 font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* E. Input Bar */}
          <div className="p-3 bg-[#FFFFFF] border-t border-[#E2E8F0] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isHi
                    ? `Is page ke baare mein poochein...`
                    : `Ask about ${pageMeta.badge.toLowerCase()} content...`
                }
                disabled={isLoading}
                className="flex-1 px-3 py-2 rounded-xl border border-[#CBD5E1] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#DBEAFE] text-xs sm:text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all bg-[#FFFFFF] min-h-[40px]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                aria-label="Send question"
                className="w-10 h-10 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#172554] text-white flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
