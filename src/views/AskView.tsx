/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  AssistantChatMessage,
  Business,
  Receipt,
} from '../types/index.ts';
import { askAssistant } from '../services/api.ts';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Receipt as ReceiptIcon,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { formatINR } from '../utils/finance.ts';

interface AskViewProps {
  business: Business | null;
  receipts: Receipt[];
  onNavigate: (route: string) => void;
}

export const AskView: React.FC<AskViewProps> = ({ business, receipts, onNavigate }) => {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      text: `Hello Rahul. I am your **Pricewise Purchasing Assistant** for **${business?.name || 'Green Basket Stores'}**.\n\nI have access to your verified 6-month purchasing history (${receipts.length} itemized invoices) and regional peer price benchmarks. You can ask me any question about your suppliers, categories, or price competitiveness.`,
      suggestedFollowUps: [
        'How much did I spend this month?',
        'Which suppliers received the most money?',
        'Am I paying a competitive price for packaging?',
        'Where can I realistically reduce purchasing costs?',
      ],
      isDemo: true,
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterQuestions = [
    'How much did I spend this month?',
    'Which suppliers received the most money?',
    'What are my largest expense categories?',
    'Which comparable products might offer savings?',
    'How has my spending changed over six months?',
    'Am I paying a competitive price for packaging?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputValue).trim();
    if (!prompt || isLoading) return;

    const userMsg: AssistantChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const assistantResponse = await askAssistant(prompt);
      setMessages((prev) => [...prev, assistantResponse]);
    } catch (err) {
      console.error('Ask assistant error:', err);
      const fallbackMsg: AssistantChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: 'I encountered an error analyzing your purchasing ledger. Please check your network connection and try again.',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto pb-16 md:pb-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-[#E2E7E2] pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#DCE7DD] text-[#476C58] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#25382D]">Purchasing AI Assistant</h1>
            <p className="text-xs text-[#64756A]">
              Grounded in {receipts.length} verified invoices for {business?.name || 'Green Basket Stores'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#2E7D4F] bg-[#EDF7F1] px-2.5 py-1 rounded-lg border border-[#CDE8D8]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Private Business Tenancy</span>
        </div>
      </div>

      {/* 2. Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser
                    ? 'bg-[#25382D] text-white'
                    : 'bg-[#DCE7DD] text-[#476C58]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-3 leading-relaxed ${
                  isUser
                    ? 'bg-[#476C58] text-white'
                    : 'bg-[#FFFFFF] border border-[#E2E7E2] text-[#25382D] shadow-xs'
                }`}
              >
                {/* Message Body */}
                <div className="whitespace-pre-line space-y-2">
                  {msg.text.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Grounded Metrics Badges */}
                {msg.groundedMetrics && msg.groundedMetrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E2E7E2]">
                    {msg.groundedMetrics.map((met, i) => (
                      <div key={i} className="p-2 rounded-lg bg-[#F7F8F5] border border-[#E2E7E2]">
                        <span className="text-[10px] text-[#64756A] block">{met.label}</span>
                        <span className="font-mono font-bold text-xs text-[#25382D] block mt-0.5">
                          {met.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Referenced Transactions */}
                {msg.referencedReceiptIds && msg.referencedReceiptIds.length > 0 && (
                  <div className="pt-2 border-t border-[#E2E7E2] flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-[#64756A] font-semibold">
                      Referenced Invoices:
                    </span>
                    {msg.referencedReceiptIds.map((id) => (
                      <button
                        key={id}
                        onClick={() => onNavigate('/ledger')}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F7F8F5] border border-[#E2E7E2] text-[10px] font-mono text-[#476C58] hover:bg-[#DCE7DD] cursor-pointer"
                      >
                        <ReceiptIcon className="w-3 h-3" />
                        <span>{id}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-2 border-t border-[#E2E7E2] space-y-1.5">
                    <span className="text-[10px] text-[#64756A] font-semibold block">
                      Suggested follow-ups:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((fu, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(fu)}
                          className="px-2.5 py-1 rounded-lg bg-[#F7F8F5] border border-[#E2E7E2] text-[11px] text-[#25382D] hover:bg-[#DCE7DD] hover:text-[#25382D] transition-colors cursor-pointer text-left"
                        >
                          {fu}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#DCE7DD] text-[#476C58] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-4 text-xs text-[#64756A] shadow-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#476C58]" />
              <span>Analyzing itemized ledger and peer benchmarks...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Starter Questions Chips (if conversation is fresh) */}
      {messages.length <= 2 && (
        <div className="py-2 space-y-1.5">
          <span className="text-[11px] text-[#64756A] font-medium block">
            Suggested starter queries:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {starterQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-3 py-1.5 rounded-xl border border-[#E2E7E2] bg-[#FFFFFF] text-xs font-medium text-[#25382D] hover:bg-[#DCE7DD] whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-2 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ask about spending, suppliers, packaging prices, or benchmarks..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 text-xs rounded-xl border border-[#E2E7E2] bg-[#FFFFFF] focus:outline-hidden focus:border-[#476C58] shadow-xs"
          />
        </div>

        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="p-3 rounded-xl bg-[#476C58] text-white hover:bg-[#3a5948] transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
          aria-label="Send query to assistant"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
