/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Camera,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  RefreshCw,
  ArrowRight,
  Sparkles,
  X,
  FileCheck,
} from 'lucide-react';
import { Receipt, ReceiptLineItem, ProductCategory } from '../types/index.ts';
import { createReceipt, extractReceiptImage } from '../services/api.ts';
import { formatINR, paiseToRupees, reconcileReceipt, rupeesToPaise } from '../utils/finance.ts';
import { CurrencyDisplay } from '../components/CurrencyDisplay.tsx';

interface ScanViewProps {
  onSaved: (receipt: Receipt) => void;
  onNavigate: (route: string) => void;
}

export const ScanView: React.FC<ScanViewProps> = ({ onSaved, onNavigate }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review screen state
  const [draftReceipt, setDraftReceipt] = useState<Receipt | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // File input refs
  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const mobileGalleryInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection from drag-and-drop or file picker
  const handleFileProcess = (file: File) => {
    setErrorMessage(null);

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size exceeds 20MB limit. Please upload a smaller image.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload JPEG, PNG, or WEBP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      await runExtraction(base64, file.type);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file from disk.');
    };
    reader.readAsDataURL(file);
  };

  // Run server extraction pipeline
  const runExtraction = async (base64: string, mimeType: string) => {
    setIsProcessing(true);
    setProgressStep('Uploading document to secure memory...');
    try {
      await new Promise((r) => setTimeout(r, 600));
      setProgressStep('Running Gemini vision extraction on merchant and line items...');

      const extracted = await extractReceiptImage(base64, mimeType);
      setProgressStep('Normalizing line items and unit pricing...');
      await new Promise((r) => setTimeout(r, 400));

      const newReceipt: Receipt = {
        id: `rec-${Date.now()}`,
        businessId: 'biz_green_basket',
        merchantName: extracted.merchantName,
        invoiceNumber: extracted.invoiceNumber,
        transactionDate: extracted.transactionDate,
        currency: 'INR',
        subtotalMinor: extracted.subtotalMinor,
        taxMinor: extracted.taxMinor,
        discountMinor: extracted.discountMinor || 0,
        extraChargesMinor: extracted.extraChargesMinor || 0,
        totalMinor: extracted.totalMinor,
        paymentMethod: extracted.paymentMethod || 'Commercial UPI',
        status: 'pending_review',
        extractionStatus: 'completed',
        reviewStatus: 'needs_review',
        imageUrl: base64.startsWith('data:image') ? base64 : undefined,
        notes: extracted.notes,
        items: extracted.items.map((it: any, idx: number) => ({
          ...it,
          id: `item-${Date.now()}-${idx + 1}`,
          receiptId: `rec-${Date.now()}`,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDraftReceipt(newReceipt);
      setIsProcessing(false);
      setProgressStep('');
    } catch (err: any) {
      console.error('Extraction error:', err);
      setErrorMessage('Receipt extraction failed. You can still input receipt details manually.');
      setIsProcessing(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Sample receipt generator for quick demonstration
  const handleLoadSample = (sampleType: 'packaging' | 'cleaning') => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProgressStep('Loading verified invoice sample...');
    setTimeout(() => {
      if (sampleType === 'packaging') {
        const sample: Receipt = {
          id: `rec-${Date.now()}`,
          businessId: 'biz_green_basket',
          merchantName: 'Metro Packaging & Supplies LLP',
          invoiceNumber: 'MPS-2026-904',
          transactionDate: new Date().toISOString().split('T')[0],
          currency: 'INR',
          subtotalMinor: 1150000,
          taxMinor: 57500,
          discountMinor: 0,
          extraChargesMinor: 0,
          totalMinor: 1207500,
          paymentMethod: 'Bank Transfer NEFT',
          status: 'pending_review',
          extractionStatus: 'completed',
          reviewStatus: 'needs_review',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [
            {
              id: 'it-1',
              receiptId: `rec-${Date.now()}`,
              originalDescription: '10x8x6 inch 3-Ply Corrugated Kraft Boxes',
              productName: 'Packaging Boxes (3-Ply Kraft 10x8x6)',
              canonicalProductId: 'prod-box-3ply',
              specification: '10x8x6 inch 3-ply brown corrugated kraft box',
              quantity: 500,
              unit: 'box',
              unitPriceMinor: 1180,
              lineTotalMinor: 590000,
              category: 'Packaging',
            },
            {
              id: 'it-2',
              receiptId: `rec-${Date.now()}`,
              originalDescription: 'Medium Kraft Twisted Handle Bags 12x10',
              productName: 'Kraft Paper Carry Bags (Medium)',
              canonicalProductId: 'prod-kraft-bags',
              specification: '12x10 inch 120 GSM twisted handle kraft paper bag',
              quantity: 500,
              unit: 'bag',
              unitPriceMinor: 700,
              lineTotalMinor: 350000,
              category: 'Packaging',
            },
            {
              id: 'it-3',
              receiptId: `rec-${Date.now()}`,
              originalDescription: 'Reinforced Kraft Paper Packing Tape 50mm',
              productName: 'Biodegradable Paper Tape (50mm x 50m)',
              canonicalProductId: 'prod-paper-tape',
              specification: 'Water-activated reinforced kraft packaging tape 50mm',
              quantity: 15,
              unit: 'roll',
              unitPriceMinor: 14000,
              lineTotalMinor: 210000,
              category: 'Packaging',
            },
          ],
        };
        setDraftReceipt(sample);
      } else {
        const sample: Receipt = {
          id: `rec-${Date.now()}`,
          businessId: 'biz_green_basket',
          merchantName: 'Apex Clean & Hygiene Corp',
          invoiceNumber: 'ACH-2026-104',
          transactionDate: new Date().toISOString().split('T')[0],
          currency: 'INR',
          subtotalMinor: 510000,
          taxMinor: 25500,
          discountMinor: 0,
          extraChargesMinor: 0,
          totalMinor: 535500,
          paymentMethod: 'Commercial Direct UPI',
          status: 'pending_review',
          extractionStatus: 'completed',
          reviewStatus: 'needs_review',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [
            {
              id: 'it-1',
              receiptId: `rec-${Date.now()}`,
              originalDescription: 'Eco Surface Disinfectant 5L Concentrated',
              productName: 'Eco Surface Disinfectant (5L Can)',
              canonicalProductId: 'prod-disinfectant-5l',
              specification: '5 Litre concentrated herbal floor & surface cleaner',
              quantity: 6,
              unit: 'can',
              unitPriceMinor: 85000,
              lineTotalMinor: 510000,
              category: 'Cleaning & Hygiene',
            },
          ],
        };
        setDraftReceipt(sample);
      }
      setIsProcessing(false);
      setProgressStep('');
    }, 500);
  };

  // Review Screen Line Item Edit Handlers
  const handleUpdateItem = (index: number, field: keyof ReceiptLineItem, value: any) => {
    if (!draftReceipt) return;
    const items = [...draftReceipt.items];
    const item = { ...items[index], [field]: value };

    // Auto-update lineTotal if qty or unitPrice changed
    if (field === 'quantity' || field === 'unitPriceMinor') {
      item.lineTotalMinor = Math.round(Number(item.quantity) * Number(item.unitPriceMinor));
    }

    items[index] = item;
    const newSubtotal = items.reduce((acc, cur) => acc + cur.lineTotalMinor, 0);
    const newTotal = newSubtotal + draftReceipt.taxMinor + draftReceipt.extraChargesMinor - draftReceipt.discountMinor;

    setDraftReceipt({
      ...draftReceipt,
      items,
      subtotalMinor: newSubtotal,
      totalMinor: newTotal,
    });
  };

  const handleAddItem = () => {
    if (!draftReceipt) return;
    const newItem: ReceiptLineItem = {
      id: `item-${Date.now()}`,
      receiptId: draftReceipt.id,
      originalDescription: 'New Product Item',
      productName: 'New Product Item',
      specification: 'Standard specification',
      quantity: 1,
      unit: 'unit',
      unitPriceMinor: 10000, // ₹100
      lineTotalMinor: 10000,
      category: 'Packaging',
    };
    const items = [...draftReceipt.items, newItem];
    const newSubtotal = items.reduce((acc, cur) => acc + cur.lineTotalMinor, 0);
    const newTotal = newSubtotal + draftReceipt.taxMinor + draftReceipt.extraChargesMinor - draftReceipt.discountMinor;

    setDraftReceipt({
      ...draftReceipt,
      items,
      subtotalMinor: newSubtotal,
      totalMinor: newTotal,
    });
  };

  const handleRemoveItem = (index: number) => {
    if (!draftReceipt) return;
    const items = draftReceipt.items.filter((_, i) => i !== index);
    const newSubtotal = items.reduce((acc, cur) => acc + cur.lineTotalMinor, 0);
    const newTotal = newSubtotal + draftReceipt.taxMinor + draftReceipt.extraChargesMinor - draftReceipt.discountMinor;

    setDraftReceipt({
      ...draftReceipt,
      items,
      subtotalMinor: newSubtotal,
      totalMinor: newTotal,
    });
  };

  // Reconcile line items against total
  const reconciliation = draftReceipt
    ? reconcileReceipt(
        draftReceipt.items.map((i) => i.lineTotalMinor),
        draftReceipt.subtotalMinor,
        draftReceipt.taxMinor,
        draftReceipt.discountMinor,
        draftReceipt.extraChargesMinor
      )
    : null;

  // Confirm and Save to Ledger
  const handleSaveToLedger = async () => {
    if (!draftReceipt) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const confirmedReceipt: Receipt = {
        ...draftReceipt,
        status: 'confirmed',
        reviewStatus: 'confirmed',
        updatedAt: new Date().toISOString(),
      };

      const saved = await createReceipt(confirmedReceipt);
      setIsSaving(false);
      onSaved(saved);
      onNavigate('/ledger');
    } catch (err: any) {
      console.error('Error saving to ledger:', err);
      setErrorMessage(err.message || 'Failed to persist transaction to ledger.');
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#25382D]">
          Scan & Upload Receipts
        </h1>
        <p className="text-sm text-[#64756A] mt-0.5">
          Extract line items, units, and purchasing prices with Gemini purchasing intelligence.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#F5C2C2] text-xs text-[#B83E3E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-[#FBE8E8] rounded-md">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* --- EXTRACTION PROGRESS OVERLAY --- */}
      {isProcessing && (
        <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-8 text-center space-y-4 shadow-sm animate-pulse">
          <div className="w-12 h-12 rounded-full bg-[#DCE7DD] text-[#476C58] flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#25382D]">Extracting Purchasing Details</h3>
            <p className="text-xs text-[#64756A]">{progressStep || 'Processing invoice...'}</p>
          </div>
        </div>
      )}

      {/* --- REVIEW & CONFIRMATION SCREEN (When draft is ready) --- */}
      {draftReceipt && !isProcessing && (
        <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E2E7E2] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#2E7D4F]" />
                <h2 className="text-lg font-bold text-[#25382D]">Review & Verify Extraction</h2>
              </div>
              <p className="text-xs text-[#64756A] mt-0.5">
                Verify merchant details, line items, and unit prices before saving to your ledger.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setDraftReceipt(null);
                  setSelectedImage(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#E2E7E2] text-xs font-medium text-[#64756A] hover:text-[#25382D] hover:bg-[#F7F8F5] cursor-pointer"
              >
                Discard / Retake
              </button>
              <button
                onClick={handleSaveToLedger}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#476C58] text-white text-xs font-semibold hover:bg-[#3a5948] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span>{isSaving ? 'Saving...' : 'Confirm & Save to Ledger'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Receipt Header Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-[#64756A] block mb-1">
                Supplier / Merchant
              </label>
              <input
                type="text"
                value={draftReceipt.merchantName}
                onChange={(e) => setDraftReceipt({ ...draftReceipt, merchantName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E7E2] focus:outline-hidden focus:border-[#476C58] bg-[#F7F8F5]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#64756A] block mb-1">
                Invoice / Bill Number
              </label>
              <input
                type="text"
                value={draftReceipt.invoiceNumber}
                onChange={(e) => setDraftReceipt({ ...draftReceipt, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E7E2] focus:outline-hidden focus:border-[#476C58] bg-[#F7F8F5] font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#64756A] block mb-1">
                Transaction Date
              </label>
              <input
                type="date"
                value={draftReceipt.transactionDate}
                onChange={(e) => setDraftReceipt({ ...draftReceipt, transactionDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E7E2] focus:outline-hidden focus:border-[#476C58] bg-[#F7F8F5]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#64756A] block mb-1">
                Payment Method
              </label>
              <input
                type="text"
                value={draftReceipt.paymentMethod || ''}
                onChange={(e) => setDraftReceipt({ ...draftReceipt, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E7E2] focus:outline-hidden focus:border-[#476C58] bg-[#F7F8F5]"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64756A]">
                Extracted Line Items ({draftReceipt.items.length})
              </span>
              <button
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2E7E2] text-xs font-medium text-[#476C58] hover:bg-[#F7F8F5] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-[#E2E7E2] rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F7F8F5] border-b border-[#E2E7E2] text-[#64756A]">
                    <th className="py-2.5 px-3 font-semibold">Description</th>
                    <th className="py-2.5 px-3 font-semibold w-24">Qty</th>
                    <th className="py-2.5 px-3 font-semibold w-20">Unit</th>
                    <th className="py-2.5 px-3 font-semibold w-28">Unit Price (₹)</th>
                    <th className="py-2.5 px-3 font-semibold w-32">Category</th>
                    <th className="py-2.5 px-3 font-semibold text-right w-28">Total (₹)</th>
                    <th className="py-2.5 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E7E2]">
                  {draftReceipt.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-[#FAFBF9]">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => handleUpdateItem(idx, 'productName', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-[#E2E7E2] focus:border-[#476C58] text-xs"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded border border-[#E2E7E2] focus:border-[#476C58] text-xs font-mono"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-[#E2E7E2] focus:border-[#476C58] text-xs"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.01"
                          value={paiseToRupees(item.unitPriceMinor)}
                          onChange={(e) =>
                            handleUpdateItem(idx, 'unitPriceMinor', rupeesToPaise(parseFloat(e.target.value) || 0))
                          }
                          className="w-full px-2 py-1 rounded border border-[#E2E7E2] focus:border-[#476C58] text-xs font-mono"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateItem(idx, 'category', e.target.value as ProductCategory)}
                          className="w-full px-2 py-1 rounded border border-[#E2E7E2] focus:border-[#476C58] text-xs"
                        >
                          <option value="Packaging">Packaging</option>
                          <option value="Inventory & Food">Inventory & Food</option>
                          <option value="Cleaning & Hygiene">Cleaning & Hygiene</option>
                          <option value="Store Supplies">Store Supplies</option>
                          <option value="Utilities & Facilities">Utilities & Facilities</option>
                          <option value="Equipment">Equipment</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <CurrencyDisplay
                          amountMinor={item.lineTotalMinor}
                          className="font-medium text-[#25382D]"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-[#64756A] hover:text-[#B83E3E] p-1 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Reconciliation */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-4 border-t border-[#E2E7E2]">
            {/* Reconciliation Warning or Confirmation */}
            <div className="max-w-md">
              {reconciliation && reconciliation.discrepancyMinor > 0 ? (
                <div className="p-3 rounded-xl bg-[#FDF8F0] border border-[#F3E2CE] text-xs text-[#C0772C] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Total Reconciled Discrepancy</span>
                    Sum of line items ({formatINR(reconciliation.itemsSumMinor)}) does not match subtotal ({formatINR(draftReceipt.subtotalMinor)}). Check tax or individual line amounts.
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#EDF7F1] border border-[#CDE8D8] text-xs text-[#2E7D4F] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All line items reconcile mathematically with receipt totals.</span>
                </div>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-[#64756A]">
              <div className="flex justify-between items-center">
                <span>Subtotal:</span>
                <CurrencyDisplay
                  amountMinor={draftReceipt.subtotalMinor}
                  className="font-medium text-[#25382D]"
                />
              </div>
              <div className="flex justify-between items-center">
                <span>GST / Tax:</span>
                <input
                  type="number"
                  step="0.01"
                  value={paiseToRupees(draftReceipt.taxMinor)}
                  onChange={(e) => {
                    const newTax = rupeesToPaise(parseFloat(e.target.value) || 0);
                    setDraftReceipt({
                      ...draftReceipt,
                      taxMinor: newTax,
                      totalMinor: draftReceipt.subtotalMinor + newTax + draftReceipt.extraChargesMinor - draftReceipt.discountMinor,
                    });
                  }}
                  className="w-24 px-2 py-0.5 text-right font-mono text-xs border border-[#E2E7E2] rounded"
                />
              </div>
              <div className="flex justify-between items-center border-t border-[#E2E7E2] pt-2 text-sm font-bold text-[#25382D]">
                <span>Total Amount:</span>
                <CurrencyDisplay
                  amountMinor={draftReceipt.totalMinor}
                  className="text-[#25382D]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SCAN INTERFACES (When no draft is active) --- */}
      {!draftReceipt && !isProcessing && (
        <div className="space-y-6">
          {/* A. MANDATORY DESKTOP DRAG-AND-DROP INTERFACE */}
          <div className="hidden md:block">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => desktopFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[#476C58] bg-[#EBF1EC] scale-[1.005]'
                  : 'border-[#D4DDD5] bg-[#FFFFFF] hover:border-[#476C58] hover:bg-[#FAFBF9]'
              }`}
            >
              <input
                ref={desktopFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-[#DCE7DD] text-[#476C58] flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8 stroke-[2]" />
              </div>

              <h2 className="text-lg font-bold text-[#25382D]">
                Drag and drop your receipt or invoice here
              </h2>
              <p className="text-xs text-[#64756A] mt-1 mb-5 max-w-sm mx-auto">
                Supports JPEG, PNG, and WebP images up to 20MB. Optical character recognition will extract merchant, items, and unit prices.
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  desktopFileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#476C58] text-white text-xs font-semibold hover:bg-[#3a5948] transition-colors cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Browse files</span>
              </button>
            </div>
          </div>

          {/* B. MOBILE CAMERA-FIRST INTERFACE */}
          <div className="md:hidden space-y-4">
            <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#DCE7DD] text-[#476C58] flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 stroke-[2]" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#25382D]">Take Receipt Photo</h2>
                <p className="text-xs text-[#64756A] mt-1">
                  Point camera at the invoice or receipt ensuring prices and items are well-lit.
                </p>
              </div>

              {/* Direct camera capture input */}
              <input
                ref={mobileCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />

              {/* Gallery upload fallback */}
              <input
                ref={mobileGalleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />

              <div className="space-y-2">
                <button
                  onClick={() => mobileCameraInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#476C58] text-white text-sm font-semibold hover:bg-[#3a5948] transition-colors shadow-xs cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Camera</span>
                </button>

                <button
                  onClick={() => mobileGalleryInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E2E7E2] bg-[#FFFFFF] text-[#25382D] text-xs font-medium hover:bg-[#F7F8F5] transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-[#64756A]" />
                  <span>Choose from Gallery / Files</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Demo Sample Invoices */}
          <div className="bg-[#FFFFFF] border border-[#E2E7E2] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64756A]">
                Quick Test Invoices (1-Click Demo)
              </span>
              <span className="text-[11px] text-[#64756A]">Instant sample data</span>
            </div>
            <p className="text-xs text-[#64756A]">
              Don't have a receipt file ready? Click below to test extraction and line-item review with realistic retail invoices:
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleLoadSample('packaging')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E2E7E2] bg-[#F7F8F5] hover:bg-[#DCE7DD] text-xs font-medium text-[#25382D] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#476C58]" />
                <span>Load Packaging Boxes Invoice (₹12,075)</span>
              </button>

              <button
                onClick={() => handleLoadSample('cleaning')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E2E7E2] bg-[#F7F8F5] hover:bg-[#DCE7DD] text-xs font-medium text-[#25382D] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#476C58]" />
                <span>Load Eco Cleaner Invoice (₹5,355)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
