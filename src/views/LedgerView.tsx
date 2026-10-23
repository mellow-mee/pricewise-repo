/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  ProductCategory,
  ReceiptLineItem,
} from '../types/index.ts';
import {
  formatINR,
  paiseToRupees,
  rupeesToPaise,
} from '../utils/finance.ts';
import { CurrencyDisplay } from '../components/CurrencyDisplay.tsx';
import { MonthlySpreadsheet } from '../components/MonthlySpreadsheet.tsx';
import { YearlyExpenditureGraph } from '../components/YearlyExpenditureGraph.tsx';
import {
  Search,
  Filter,
  X,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Building,
  Calendar,
  Layers,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { deleteReceipt, updateReceipt } from '../services/api.ts';

interface LedgerViewProps {
  receipts: Receipt[];
  onReceiptUpdated: (updated: Receipt) => void;
  onReceiptDeleted: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  receipts,
  onReceiptUpdated,
  onReceiptDeleted,
  onNavigate,
}) => {
  // Shared Year & Month state driving both the yearly expenditure graph and the monthly spreadsheet
  const [spreadsheetYear, setSpreadsheetYear] = useState<number>(2026);
  const [spreadsheetMonth, setSpreadsheetMonth] = useState<number>(10); // October

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'oct_2026' | 'sep_2026' | 'last_90_days'>('all');
  const [sortField, setSortField] = useState<'date' | 'total'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Modals state
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // List of unique suppliers and categories for filter options
  const uniqueSuppliers = useMemo(() => {
    const set = new Set<string>();
    receipts.forEach((r) => set.add(r.merchantName));
    return Array.from(set).sort();
  }, [receipts]);

  // Filtered and sorted receipts
  const filteredReceipts = useMemo(() => {
    return receipts
      .filter((rec) => {
        // Search query matching merchant, invoice #, or item descriptions
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchMerchant = rec.merchantName.toLowerCase().includes(q);
          const matchInvoice = rec.invoiceNumber.toLowerCase().includes(q);
          const matchItems = rec.items.some((it) =>
            it.productName.toLowerCase().includes(q) || it.originalDescription.toLowerCase().includes(q)
          );
          if (!matchMerchant && !matchInvoice && !matchItems) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          const hasCat = rec.items.some((it) => it.category === selectedCategory);
          if (!hasCat) return false;
        }

        // Supplier filter
        if (selectedSupplier !== 'all' && rec.merchantName !== selectedSupplier) {
          return false;
        }

        // Period filter
        if (periodFilter === 'oct_2026' && !rec.transactionDate.startsWith('2026-10')) {
          return false;
        }
        if (periodFilter === 'sep_2026' && !rec.transactionDate.startsWith('2026-09')) {
          return false;
        }
        if (periodFilter === 'last_90_days') {
          const recDate = new Date(rec.transactionDate).getTime();
          const cutoff = new Date('2026-07-25').getTime();
          if (recDate < cutoff) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const diff = new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
          return sortAsc ? -diff : diff;
        } else {
          const diff = b.totalMinor - a.totalMinor;
          return sortAsc ? -diff : diff;
        }
      });
  }, [receipts, searchQuery, selectedCategory, selectedSupplier, periodFilter, sortField, sortAsc]);

  // Aggregate stats for the current filter selection
  const filteredTotalSpend = useMemo(() => {
    return filteredReceipts.reduce((sum, r) => sum + r.totalMinor, 0);
  }, [filteredReceipts]);

  const pendingReviewCount = useMemo(() => {
    return receipts.filter((r) => r.status === 'pending_review').length;
  }, [receipts]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSupplier('all');
    setPeriodFilter('all');
  };

  // Delete transaction action
  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteReceipt(deletingId);
      onReceiptDeleted(deletingId);
      setDeletingId(null);
      if (viewingReceipt?.id === deletingId) setViewingReceipt(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Save edited transaction
  const handleSaveEdit = async () => {
    if (!editingReceipt) return;
    setIsSavingEdit(true);
    try {
      const updated = await updateReceipt(editingReceipt.id, editingReceipt);
      onReceiptUpdated(updated);
      setEditingReceipt(null);
      if (viewingReceipt?.id === editingReceipt.id) setViewingReceipt(updated);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="space-y-8 pb-24 md:pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#25382D]">
            Expense Ledger
          </h1>
          <p className="text-sm text-[#64756A] mt-0.5">
            Monthly spending spreadsheets, verified supplier invoices, and audit history.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/scan')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#476C58] text-white text-xs font-semibold hover:bg-[#3a5948] transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Scan New Invoice</span>
        </button>
      </div>

      {/* 2. Year-wise Monthly Expenditure Graph */}
      <section aria-label="Yearly Expenditure Graph">
        <YearlyExpenditureGraph
          receipts={receipts}
          selectedYear={spreadsheetYear}
          onYearChange={setSpreadsheetYear}
          selectedMonth={spreadsheetMonth}
          onMonthSelect={setSpreadsheetMonth}
        />
      </section>

      {/* 3. Monthly Spending Spreadsheet Subsection */}
      <section aria-label="Monthly Spending Spreadsheet">
        <MonthlySpreadsheet
          receipts={receipts}
          selectedYear={spreadsheetYear}
          onYearChange={setSpreadsheetYear}
          selectedMonth={spreadsheetMonth}
          onMonthChange={setSpreadsheetMonth}
        />
      </section>

      {/* 4. Past Transactions Subsection */}
      <section className="space-y-4 pt-4 border-t border-[#E2E7E2]" aria-label="Past Transactions">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#25382D]">Past Transactions</h2>
            <p className="text-xs text-[#64756A] mt-0.5">
              All uploaded receipts, invoices, and verified ledger entries.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-xl p-4">
            <span className="text-xs text-[#64756A] block">Total In Filtered View</span>
            <CurrencyDisplay
              amountMinor={filteredTotalSpend}
              className="text-2xl font-bold text-[#25382D] mt-0.5 block"
            />
            <span className="text-[11px] text-[#64756A] mt-1 block">
            Across {filteredReceipts.length} verified transactions
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-xl p-4">
          <span className="text-xs text-[#64756A] block">Total Invoices Saved</span>
          <span className="text-2xl font-bold text-[#25382D] font-mono mt-0.5 block">
            {receipts.length}
          </span>
          <span className="text-[11px] text-[#64756A] mt-1 block">
            6 months of continuous history
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-xl p-4">
          <span className="text-xs text-[#64756A] block">Awaiting Review</span>
          <span className="text-2xl font-bold text-[#25382D] font-mono mt-0.5 block">
            {pendingReviewCount}
          </span>
          <span className="text-[11px] text-[#2E7D4F] mt-1 block">
            {pendingReviewCount === 0 ? 'All receipts reconciled' : 'Action recommended'}
          </span>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64756A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by supplier, invoice number, or product item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E2E7E2] bg-[#F7F8F5] focus:outline-hidden focus:border-[#476C58]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64756A] hover:text-[#25382D]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#E2E7E2] bg-[#F7F8F5] text-[#25382D] focus:outline-hidden focus:border-[#476C58]"
          >
            <option value="all">All Categories</option>
            <option value="Packaging">Packaging</option>
            <option value="Inventory & Food">Inventory & Food</option>
            <option value="Cleaning & Hygiene">Cleaning & Hygiene</option>
            <option value="Store Supplies">Store Supplies</option>
            <option value="Utilities & Facilities">Utilities & Facilities</option>
            <option value="Equipment">Equipment</option>
          </select>

          {/* Supplier Filter */}
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#E2E7E2] bg-[#F7F8F5] text-[#25382D] focus:outline-hidden focus:border-[#476C58]"
          >
            <option value="all">All Suppliers ({uniqueSuppliers.length})</option>
            {uniqueSuppliers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Time Range Filter */}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-[#E2E7E2] bg-[#F7F8F5] text-[#25382D] focus:outline-hidden focus:border-[#476C58]"
          >
            <option value="all">All Time (6 Months)</option>
            <option value="oct_2026">October 2026</option>
            <option value="sep_2026">September 2026</option>
            <option value="last_90_days">Last 90 Days</option>
          </select>

          {(searchQuery || selectedCategory !== 'all' || selectedSupplier !== 'all' || periodFilter !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-medium text-[#B83E3E] hover:bg-[#FDF2F2] rounded-xl border border-[#F5C2C2] transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 3. Transaction Display */}
      {filteredReceipts.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-12 text-center space-y-3">
          <Layers className="w-10 h-10 text-[#64756A] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#25382D]">No transactions found</h3>
          <p className="text-xs text-[#64756A] max-w-sm mx-auto">
            No purchases match the selected filters. Try clearing your search or scan a new receipt to record an expense.
          </p>
          <button
            onClick={() => onNavigate('/scan')}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#476C58] text-white text-xs font-semibold hover:bg-[#3a5948] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scan Receipt</span>
          </button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F8F5] border-b border-[#E2E7E2] text-[#64756A]">
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer select-none"
                    onClick={() => {
                      if (sortField === 'date') setSortAsc(!sortAsc);
                      else {
                        setSortField('date');
                        setSortAsc(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3 text-[#64756A]" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold">Supplier & Invoice</th>
                  <th className="py-3 px-4 font-semibold">Purchased Items</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th
                    className="py-3 px-4 font-semibold text-right cursor-pointer select-none"
                    onClick={() => {
                      if (sortField === 'total') setSortAsc(!sortAsc);
                      else {
                        setSortField('total');
                        setSortAsc(false);
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Total Amount</span>
                      <ArrowUpDown className="w-3 h-3 text-[#64756A]" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E7E2]">
                {filteredReceipts.map((rec) => {
                  const firstCategory = rec.items[0]?.category || 'Store Supplies';
                  const itemsSummary =
                    rec.items.length === 1
                      ? rec.items[0].productName
                      : `${rec.items[0]?.productName || 'Items'} +${rec.items.length - 1} more`;

                  return (
                    <tr key={rec.id} className="hover:bg-[#FAFBF9] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#25382D] whitespace-nowrap">
                        {rec.transactionDate}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#25382D] block">{rec.merchantName}</span>
                        {rec.invoiceNumber && (
                          <span className="text-[11px] font-mono text-[#64756A] block">
                            {rec.invoiceNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-[#64756A]" title={itemsSummary}>
                        {itemsSummary}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[#64756A] text-[11px]">{firstCategory}</span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <CurrencyDisplay
                          amountMinor={rec.totalMinor}
                          className="font-bold text-[#25382D]"
                        />
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            rec.status === 'confirmed' ? 'text-[#2E7D4F]' : 'text-[#C0772C]'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Confirmed</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingReceipt(rec)}
                            className="p-1.5 text-[#64756A] hover:text-[#476C58] hover:bg-[#F7F8F5] rounded-lg transition-colors cursor-pointer"
                            title="View Transaction Details"
                            aria-label="View receipt details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingReceipt(JSON.parse(JSON.stringify(rec)))}
                            className="p-1.5 text-[#64756A] hover:text-[#476C58] hover:bg-[#F7F8F5] rounded-lg transition-colors cursor-pointer"
                            title="Edit Transaction"
                            aria-label="Edit receipt"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(rec.id)}
                            className="p-1.5 text-[#64756A] hover:text-[#B83E3E] hover:bg-[#FDF2F2] rounded-lg transition-colors cursor-pointer"
                            title="Delete Transaction"
                            aria-label="Delete receipt"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-3">
            {filteredReceipts.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-xl p-4 space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-sm text-[#25382D] block">
                      {rec.merchantName}
                    </span>
                    <span className="text-[11px] font-mono text-[#64756A]">
                      {rec.transactionDate} · {rec.invoiceNumber}
                    </span>
                  </div>
                  <CurrencyDisplay
                    amountMinor={rec.totalMinor}
                    className="font-bold text-sm text-[#25382D]"
                  />
                </div>

                <div className="text-xs text-[#64756A] truncate">
                  {rec.items.map((i) => i.productName).join(', ')}
                </div>

                <div className="pt-2 border-t border-[#E2E7E2] flex items-center justify-between">
                  <span className="text-[11px] text-[#2E7D4F] flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Confirmed</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingReceipt(rec)}
                      className="px-2.5 py-1 text-xs font-medium text-[#476C58] bg-[#F7F8F5] border border-[#E2E7E2] rounded-lg"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setEditingReceipt(JSON.parse(JSON.stringify(rec)))}
                      className="px-2.5 py-1 text-xs font-medium text-[#64756A] bg-[#F7F8F5] border border-[#E2E7E2] rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(rec.id)}
                      className="px-2 py-1 text-xs text-[#B83E3E] bg-[#FDF2F2] border border-[#F5C2C2] rounded-lg"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      </section>

      {/* --- DETAIL MODAL --- */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between border-b border-[#E2E7E2] pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#64756A] font-semibold">
                  Transaction Receipt Details
                </span>
                <h3 className="text-xl font-bold text-[#25382D] mt-0.5">
                  {viewingReceipt.merchantName}
                </h3>
                <div className="flex items-center gap-3 text-xs text-[#64756A] mt-1 font-mono">
                  <span>Invoice: {viewingReceipt.invoiceNumber}</span>
                  <span>·</span>
                  <span>Date: {viewingReceipt.transactionDate}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1.5 text-[#64756A] hover:text-[#25382D] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#25382D] uppercase tracking-wider block">
                Itemized Line Breakdown ({viewingReceipt.items.length})
              </span>
              <div className="border border-[#E2E7E2] rounded-xl overflow-hidden divide-y divide-[#E2E7E2] text-xs">
                {viewingReceipt.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-[#25382D] block">{item.productName}</span>
                      <span className="text-[11px] text-[#64756A] block">
                        {item.quantity} {item.unit} @ {formatINR(item.unitPriceMinor, { showDecimals: true })}/{item.unit}
                      </span>
                      {item.specification && (
                        <span className="text-[10px] text-[#64756A] italic block">
                          Spec: {item.specification}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-sm text-[#25382D]">
                      {formatINR(item.lineTotalMinor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="bg-[#F7F8F5] rounded-xl p-4 border border-[#E2E7E2] space-y-2 text-xs">
              <div className="flex justify-between text-[#64756A]">
                <span>Items Subtotal:</span>
                <span className="font-mono font-medium text-[#25382D]">
                  {formatINR(viewingReceipt.subtotalMinor)}
                </span>
              </div>
              <div className="flex justify-between text-[#64756A]">
                <span>Taxes & GST:</span>
                <span className="font-mono font-medium text-[#25382D]">
                  {formatINR(viewingReceipt.taxMinor)}
                </span>
              </div>
              {viewingReceipt.discountMinor > 0 && (
                <div className="flex justify-between text-[#2E7D4F]">
                  <span>Discounts Applied:</span>
                  <span className="font-mono font-medium">-{formatINR(viewingReceipt.discountMinor)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[#E2E7E2] text-sm font-bold text-[#25382D]">
                <span>Reconciled Total Amount:</span>
                <span className="font-mono">{formatINR(viewingReceipt.totalMinor)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setEditingReceipt(JSON.parse(JSON.stringify(viewingReceipt)));
                  setViewingReceipt(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#E2E7E2] text-xs font-semibold text-[#25382D] hover:bg-[#F7F8F5] cursor-pointer"
              >
                Edit Transaction
              </button>
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 rounded-xl bg-[#476C58] text-white text-xs font-semibold hover:bg-[#3a5948] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {editingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E7E2] pb-3">
              <h3 className="text-lg font-bold text-[#25382D]">Edit Receipt Record</h3>
              <button
                onClick={() => setEditingReceipt(null)}
                className="p-1 text-[#64756A] hover:text-[#25382D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-[#64756A] block mb-1">Merchant / Supplier</label>
                <input
                  type="text"
                  value={editingReceipt.merchantName}
                  onChange={(e) => setEditingReceipt({ ...editingReceipt, merchantName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E7E2] bg-[#F7F8F5] focus:outline-hidden focus:border-[#476C58]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[#64756A] block mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={editingReceipt.invoiceNumber}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E7E2] bg-[#F7F8F5] font-mono focus:outline-hidden focus:border-[#476C58]"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#64756A] block mb-1">Transaction Date</label>
                  <input
                    type="date"
                    value={editingReceipt.transactionDate}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, transactionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E7E2] bg-[#F7F8F5] focus:outline-hidden focus:border-[#476C58]"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-[#64756A] block mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paiseToRupees(editingReceipt.totalMinor)}
                  onChange={(e) => {
                    const newTotal = rupeesToPaise(parseFloat(e.target.value) || 0);
                    setEditingReceipt({ ...editingReceipt, totalMinor: newTotal });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E7E2] bg-[#F7F8F5] font-mono font-bold focus:outline-hidden focus:border-[#476C58]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E7E2]">
              <button
                onClick={() => setEditingReceipt(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E7E2] text-xs font-semibold text-[#64756A] hover:bg-[#F7F8F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-4 py-2 rounded-xl bg-[#476C58] text-white text-xs font-semibold hover:bg-[#3a5948] cursor-pointer disabled:opacity-50"
              >
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-[#25382D]">Confirm Transaction Deletion</h3>
            <p className="text-xs text-[#64756A] leading-relaxed">
              Are you sure you want to delete this transaction from your ledger? Derived spending figures and benchmark calculations will be updated.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E7E2] text-xs font-semibold text-[#64756A] hover:bg-[#F7F8F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-[#B83E3E] text-white text-xs font-semibold hover:bg-[#962f2f] cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
