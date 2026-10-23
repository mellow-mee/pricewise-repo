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
  PackageCheck,
  RotateCcw,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { Receipt, ReceiptLineItem, ProductCategory } from '../types/index.ts';
import { createReceipt, extractReceiptImage } from '../services/api.ts';
import { formatINR, paiseToRupees, reconcileReceipt, rupeesToPaise } from '../utils/finance.ts';
import { CurrencyDisplay } from '../components/CurrencyDisplay.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface ScanViewProps {
  onSaved: (receipt: Receipt) => void;
  onNavigate: (route: string) => void;
}

export const ScanView: React.FC<ScanViewProps> = ({ onSaved, onNavigate }) => {
  const { language, t, tCategory } = useLanguage();
  const isHi = language === 'hi';

  // 3-step workflow state: 1 (Scan bill) | 2 (Check items) | 3 (Added to stock)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review screen state (Step 2)
  const [draftReceipt, setDraftReceipt] = useState<Receipt | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Success state (Step 3)
  const [savedReceipt, setSavedReceipt] = useState<Receipt | null>(null);

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
      setErrorMessage('Unsupported file format. Please upload a JPEG, PNG, or WebP image.');
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
    setProgressStep('Uploading bill to secure memory...');
    try {
      await new Promise((r) => setTimeout(r, 500));
      setProgressStep('Extracting product names, quantities, and prices...');

      const extracted = await extractReceiptImage(base64, mimeType);
      setProgressStep('Validating line items and identifying products...');
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
          // If confidence is lower or description is generic, mark as unidentified for review
          isUnidentified: it.confidence < 0.92 || !it.canonicalProductId || it.productName.toLowerCase().includes('generic'),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDraftReceipt(newReceipt);
      setIsProcessing(false);
      setProgressStep('');
      setCurrentStep(2); // Advance to Step 2: Check the items
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
  const handleLoadSample = (sampleType: 'packaging' | 'cleaning' | 'unidentified') => {
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
              originalDescription: 'Unbranded packing rolls (barcode unreadable)',
              productName: 'Unidentified Packaging Roll (Unverified)',
              specification: 'Unverified packing tape roll 50mm',
              quantity: 15,
              unit: 'roll',
              unitPriceMinor: 14000,
              lineTotalMinor: 210000,
              category: 'Packaging',
              reviewFlags: ['unidentified_product'],
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
      setCurrentStep(2); // Move to Step 2
    }, 450);
  };

  // Step 2: Line Item Edit Handlers
  const handleUpdateItem = (index: number, field: keyof ReceiptLineItem, value: any) => {
    if (!draftReceipt) return;
    const items = [...draftReceipt.items];
    const item = { ...items[index], [field]: value };

    // Auto-update lineTotal if qty or unitPrice changed
    if (field === 'quantity' || field === 'unitPriceMinor') {
      item.lineTotalMinor = Math.round(Number(item.quantity) * Number(item.unitPriceMinor));
    }

    // If user edited product name, clear unverified flag
    if (field === 'productName' && item.reviewFlags) {
      item.reviewFlags = item.reviewFlags.filter((f) => f !== 'unidentified_product');
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
      unitPriceMinor: 10000,
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

  // Step 3: Single Confirmation Button Handler ("Add to Stock")
  const handleConfirmAddToStock = async () => {
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
      setSavedReceipt(saved);
      setIsSaving(false);
      onSaved(saved);
      // Advance to Step 3: Explain stock update only after update succeeds!
      setCurrentStep(3);
    } catch (err: any) {
      console.error('Error saving to stock:', err);
      setErrorMessage(err.message || 'Failed to update stock. Please try again.');
      setIsSaving(false);
    }
  };

  // Reset to Step 1
  const handleScanAnother = () => {
    setDraftReceipt(null);
    setSelectedImage(null);
    setSavedReceipt(null);
    setErrorMessage(null);
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      {/* 3-Step Wizard Navigation Header */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between">
          {/* Step 1 Pill */}
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 1
                  ? 'bg-[#1D4ED8] text-white ring-4 ring-[#DBEAFE]'
                  : currentStep > 1
                  ? 'bg-[#1D4ED8] text-white'
                  : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'
              }`}
            >
              {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </span>
            <div className="hidden sm:block">
              <span className="text-[11px] uppercase tracking-wider text-[#475569] font-semibold block">
                {isHi ? 'Kadam 1' : 'Step 1'}
              </span>
              <span
                className={`text-xs font-bold ${
                  currentStep === 1 ? 'text-[#0F172A]' : 'text-[#475569]'
                }`}
              >
                {isHi ? 'Bill scan karein' : 'Scan your bill'}
              </span>
            </div>
          </div>

          <div className="w-8 sm:w-16 h-px bg-[#E2E8F0]" />

          {/* Step 2 Pill */}
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 2
                  ? 'bg-[#1D4ED8] text-white ring-4 ring-[#DBEAFE]'
                  : currentStep > 2
                  ? 'bg-[#1D4ED8] text-white'
                  : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'
              }`}
            >
              {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </span>
            <div className="hidden sm:block">
              <span className="text-[11px] uppercase tracking-wider text-[#475569] font-semibold block">
                {isHi ? 'Kadam 2' : 'Step 2'}
              </span>
              <span
                className={`text-xs font-bold ${
                  currentStep === 2 ? 'text-[#0F172A]' : 'text-[#475569]'
                }`}
              >
                {isHi ? 'Saman check karein' : 'Check the items'}
              </span>
            </div>
          </div>

          <div className="w-8 sm:w-16 h-px bg-[#E2E8F0]" />

          {/* Step 3 Pill */}
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 3
                  ? 'bg-[#1D4ED8] text-white ring-4 ring-[#DBEAFE]'
                  : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'
              }`}
            >
              {currentStep === 3 ? <PackageCheck className="w-4 h-4" /> : '3'}
            </span>
            <div className="hidden sm:block">
              <span className="text-[11px] uppercase tracking-wider text-[#475569] font-semibold block">
                {isHi ? 'Kadam 3' : 'Step 3'}
              </span>
              <span
                className={`text-xs font-bold ${
                  currentStep === 3 ? 'text-[#1D4ED8]' : 'text-[#475569]'
                }`}
              >
                {isHi ? 'Stock me jodein' : 'Add to stock'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-[#FEE2E2] rounded-md cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* --- EXTRACTION PROGRESS OVERLAY --- */}
      {isProcessing && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-10 text-center space-y-4 shadow-sm animate-pulse">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#0F172A]">
              {isHi ? 'Bill jaanch aur saman extract ho raha hai...' : 'Analyzing Bill & Extracting Items'}
            </h3>
            <p className="text-xs text-[#475569]">{progressStep || (isHi ? 'Document process kiya ja raha hai...' : 'Processing document...')}</p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 1: SCAN YOUR BILL                                         */}
      {/* ============================================================== */}
      {currentStep === 1 && !isProcessing && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              {isHi ? 'Kadam 1 — Apna bill scan karein' : 'Step 1 — Scan your bill'}
            </h1>
            <p className="text-sm text-[#475569] mt-0.5">
              {isHi
                ? 'Mobile camera se photo lein ya desktop par bill upload/drag-drop karein.'
                : 'Use the camera on mobile, or upload/drag and drop a bill on desktop.'}
            </p>
          </div>

          {/* Desktop Drag and Drop Interface */}
          <div className="hidden md:block">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => desktopFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[#1D4ED8] bg-[#EFF6FF] scale-[1.005]'
                  : 'border-[#CBD5E1] bg-[#FFFFFF] hover:border-[#1D4ED8] hover:bg-[#F8FAFC]'
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

              <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8 stroke-[2]" />
              </div>

              <h2 className="text-lg font-bold text-[#0F172A]">
                {isHi ? 'Apna bill ya invoice yahan drag aur drop karein' : 'Drag and drop your bill or invoice here'}
              </h2>
              <p className="text-xs text-[#475569] mt-1 mb-5 max-w-sm mx-auto">
                {isHi
                  ? 'JPEG, PNG, ya WebP image 20MB tak upload karein. Automatic OCR saman ke naam, quantity aur bhaav nikaal lega.'
                  : 'Upload JPEG, PNG, or WebP images up to 20MB. Optical character recognition will extract product names, quantities, and prices.'}
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  desktopFileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D4ED8] text-white text-xs font-semibold hover:bg-[#1E40AF] active:bg-[#172554] transition-colors cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>{isHi ? 'File chunein' : 'Browse files'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Camera Interface */}
          <div className="md:hidden space-y-4">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 stroke-[2]" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  {isHi ? 'Mobile camera ka upyog karein' : 'Use Camera on Mobile'}
                </h2>
                <p className="text-xs text-[#475569] mt-1">
                  {isHi
                    ? 'Camera ko bill ke samne rakhein taaki saman ke naam aur bhaav saaf dikhein.'
                    : 'Point camera at the printed or digital bill ensuring product names and prices are clearly visible.'}
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
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1D4ED8] text-white text-sm font-semibold hover:bg-[#1E40AF] active:bg-[#172554] transition-colors shadow-xs cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isHi ? 'Camera kholein' : 'Open Camera'}</span>
                </button>

                <button
                  onClick={() => mobileGalleryInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] text-xs font-semibold hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-[#475569]" />
                  <span>{isHi ? 'Gallery ya Files se upload karein' : 'Choose from Gallery / Files'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Demo Test Bills */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                {isHi ? 'Quick Test Billein (1-Click Demo)' : 'Quick Test Bills (1-Click Demo)'}
              </span>
              <span className="text-[11px] text-[#475569]">{isHi ? 'Turant sample bill jaanch' : 'Instant sample scan'}</span>
            </div>
            <p className="text-xs text-[#475569]">
              {isHi
                ? 'Asli bills ke sath testing karein aur automatic line item extraction dekhein:'
                : 'Test the full workflow with realistic bills to see product extraction and review:'}
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleLoadSample('packaging')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:border-[#BFDBFE] text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>{isHi ? 'Packaging Bill (1 item verify karne ke liye)' : 'Packaging Bill (Includes 1 item to verify)'}</span>
              </button>

              <button
                onClick={() => handleLoadSample('cleaning')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:border-[#BFDBFE] text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>{isHi ? 'Eco Cleaning Saman Bill' : 'Eco Cleaner Supplies Bill'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: CHECK THE ITEMS                                        */}
      {/* ============================================================== */}
      {currentStep === 2 && draftReceipt && !isProcessing && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  {isHi ? 'Kadam 2 — Saman check karein' : 'Step 2 — Check the items'}
                </h2>
              </div>
              <p className="text-xs text-[#475569] mt-0.5">
                {isHi
                  ? 'Extract kiye gaye saman ke naam, quantity aur bhaav verify karein. Jis item me jaanch ki zaroorat hai use highlight kiya gaya hai.'
                  : 'Check extracted product names, quantities, and prices. Items needing verification are highlighted below.'}
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-[#475569] hover:text-[#0F172A] flex items-center gap-1 self-start sm:self-auto cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>{isHi ? 'Doosra bill scan karein' : 'Scan different bill'}</span>
            </button>
          </div>

          {/* Supplier & Bill Header Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs">
            <div>
              <span className="text-[#475569] block text-[11px]">{isHi ? 'Vyapari / Supplier' : 'Supplier / Merchant'}</span>
              <span className="font-bold text-[#0F172A] text-sm mt-0.5 block truncate">
                {draftReceipt.merchantName}
              </span>
            </div>
            <div>
              <span className="text-[#475569] block text-[11px]">{isHi ? 'Bill / Invoice Number' : 'Bill / Invoice Number'}</span>
              <span className="font-mono font-bold text-[#0F172A] text-sm mt-0.5 block">
                {draftReceipt.invoiceNumber}
              </span>
            </div>
            <div>
              <span className="text-[#475569] block text-[11px]">{isHi ? 'Bill ki Tarikh' : 'Bill Date'}</span>
              <span className="font-bold text-[#0F172A] text-sm mt-0.5 block">
                {draftReceipt.transactionDate}
              </span>
            </div>
          </div>

          {/* Readable List of Items with Highlight for Unidentified Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                {isHi ? `Extract kiya gaya saman (${draftReceipt.items.length})` : `Extracted Items (${draftReceipt.items.length})`}
              </span>
              <button
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#1D4ED8] hover:bg-[#EFF6FF] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isHi ? 'Saman Jodein' : 'Add Item'}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {draftReceipt.items.map((item, idx) => {
                const isUnidentified =
                  (item.reviewFlags && item.reviewFlags.includes('unidentified_product')) ||
                  item.productName.toLowerCase().includes('unidentified') ||
                  item.productName.toLowerCase().includes('unverified');

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl p-3.5 border transition-all ${
                      isUnidentified
                        ? 'border-[#FED7AA] bg-[#FFF7ED] ring-2 ring-[#FED7AA]/50'
                        : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#1D4ED8]/40'
                    }`}
                  >
                    {/* Unidentified Alert Pill (Orange: warnings and items that need attention) */}
                    {isUnidentified && (
                      <div className="flex items-center gap-1.5 text-xs text-[#C2410C] font-semibold mb-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-[#EA580C]" />
                        <span>
                          {isHi
                            ? 'Is product ko automatically verify nahi kiya ja saka — kripya details check karein:'
                            : 'Could not automatically verify this product — please check details:'}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
                      {/* Product Name */}
                      <div className="md:col-span-5 space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-[#475569] font-semibold block">
                          {isHi ? 'Saman ka Naam' : 'Product Name'}
                        </label>
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => handleUpdateItem(idx, 'productName', e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:outline-hidden ${
                            isUnidentified
                              ? 'border-[#FDBA74] bg-[#FFFFFF] text-[#0F172A] focus:border-[#1D4ED8]'
                              : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] focus:border-[#1D4ED8]'
                          }`}
                        />
                      </div>

                      {/* Quantity & Unit */}
                      <div className="md:col-span-3 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-[#475569] font-semibold block">
                            {isHi ? 'Quantity' : 'Qty'}
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono font-medium text-[#0F172A] text-center focus:border-[#1D4ED8]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-[#475569] font-semibold block">
                            {isHi ? 'Unit' : 'Unit'}
                          </label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#0F172A] text-center focus:border-[#1D4ED8]"
                          />
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-[#475569] font-semibold block">
                          {isHi ? 'Unit Bhaav (₹)' : 'Unit Price (₹)'}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={paiseToRupees(item.unitPriceMinor)}
                          onChange={(e) =>
                            handleUpdateItem(idx, 'unitPriceMinor', rupeesToPaise(parseFloat(e.target.value) || 0))
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono font-medium text-[#0F172A] text-right focus:border-[#1D4ED8]"
                        />
                      </div>

                      {/* Total and Delete */}
                      <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3 pt-1 md:pt-0">
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-[#475569] block md:hidden">
                            {isHi ? 'Kul Rakam' : 'Total'}
                          </span>
                          <CurrencyDisplay
                            amountMinor={item.lineTotalMinor}
                            className="font-bold text-sm text-[#0F172A]"
                          />
                        </div>

                        {/* Red: Errors and genuinely urgent / destructive actions only */}
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-[#475569] hover:text-[#DC2626] p-1.5 rounded-lg hover:bg-[#FEF2F2] cursor-pointer transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals & Reconciliation */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
            <div className="max-w-md">
              {reconciliation && reconciliation.discrepancyMinor > 0 ? (
                <div className="p-3 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-xs text-[#C2410C] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#EA580C]" />
                  <div>
                    <span className="font-semibold block">{isHi ? 'Reconciliation Suchna' : 'Reconciliation Note'}</span>
                    {isHi
                      ? `Items ka jod (${formatINR(reconciliation.itemsSumMinor)}) subtotal (${formatINR(draftReceipt.subtotalMinor)}) se match nahi karta.`
                      : `Sum of items (${formatINR(reconciliation.itemsSumMinor)}) differs from subtotal (${formatINR(draftReceipt.subtotalMinor)}).`}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1D4ED8] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1D4ED8]" />
                  <span className="font-medium">
                    {isHi
                      ? 'Sabhi line items aur kul rakam ganitiya roop se match karte hain.'
                      : 'All line items and totals match mathematically.'}
                  </span>
                </div>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-[#475569]">
              <div className="flex justify-between items-center">
                <span>{isHi ? 'Mool Rakam (Subtotal):' : 'Subtotal:'}</span>
                <CurrencyDisplay amountMinor={draftReceipt.subtotalMinor} className="font-semibold text-[#0F172A]" />
              </div>
              <div className="flex justify-between items-center">
                <span>{isHi ? 'GST / Tax:' : 'GST / Tax:'}</span>
                <CurrencyDisplay amountMinor={draftReceipt.taxMinor} className="font-semibold text-[#0F172A]" />
              </div>
              <div className="flex justify-between items-center border-t border-[#E2E8F0] pt-2 text-base font-bold text-[#0F172A]">
                <span>{isHi ? 'Kul Rakam (Total):' : 'Total Amount:'}</span>
                <CurrencyDisplay amountMinor={draftReceipt.totalMinor} className="text-[#0F172A]" />
              </div>
            </div>
          </div>

          {/* STEP 3 ACTION: ONE CLEAR CONFIRMATION BUTTON (Primary Blue) */}
          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#475569]">
              {isHi
                ? 'Stock update karne ke liye taiyar hain? Neeche diye gaye button par click karein.'
                : 'Ready to update stock? Click the confirmation button below.'}
            </span>

            <button
              onClick={handleConfirmAddToStock}
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1D4ED8] text-white text-sm font-bold hover:bg-[#1E40AF] active:bg-[#172554] transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isHi ? 'Stock Update Ho Raha Hai...' : 'Updating Stock...'}</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-5 h-5" />
                  <span>{isHi ? 'Stock Me Jodein' : 'Add to Stock'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: STOCK UPDATED CONFIRMATION (ONLY AFTER UPDATE SUCCEEDS)*/}
      {/* ============================================================== */}
      {currentStep === 3 && savedReceipt && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-xs animate-in fade-in zoom-in-95 duration-200">
          {/* Success Check Icon (Light blue container, primary blue icon) */}
          <div className="w-16 h-16 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] flex items-center justify-center mx-auto shadow-xs">
            <PackageCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-[#0F172A]">
              {isHi ? 'Stock Safaltapoorvak Update Ho Gaya!' : 'Stock Updated Successfully!'}
            </h2>
            <p className="text-sm text-[#334155] leading-relaxed">
              {isHi ? (
                <>
                  <strong>{savedReceipt.merchantName}</strong> (Bill #{savedReceipt.invoiceNumber}) ke sabhi items aapke dukan stock me jud gaye hain aur kharcha khata me darj ho chuke hain.
                </>
              ) : (
                <>
                  The items from <strong>{savedReceipt.merchantName}</strong> (Bill #{savedReceipt.invoiceNumber}) have been successfully added to your store inventory and recorded in your expense ledger.
                </>
              )}
            </p>
          </div>

          {/* Added Stock Items Card */}
          <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] max-w-md mx-auto text-left space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] block">
              {isHi ? 'Stock Me Joda Gaya Saman:' : 'Items Added to Stock:'}
            </span>
            <ul className="text-xs text-[#0F172A] divide-y divide-[#E2E8F0]">
              {savedReceipt.items.map((it) => (
                <li key={it.id} className="py-2 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold block text-[#0F172A]">{it.productName}</span>
                    <span className="text-[11px] text-[#475569]">
                      {it.quantity} {it.unit}s @ {formatINR(it.unitPriceMinor)}/{it.unit}
                    </span>
                  </div>
                  <CurrencyDisplay amountMinor={it.lineTotalMinor} className="font-bold font-mono text-[#0F172A]" />
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#0F172A]">
              <span>{isHi ? 'Darj Ki Gayi Kul Bill Rakam:' : 'Total Bill Amount Recorded:'}</span>
              <CurrencyDisplay amountMinor={savedReceipt.totalMinor} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleScanAnother}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#1D4ED8]" />
              <span>{isHi ? 'Naya Bill Scan Karein' : 'Scan Another Bill'}</span>
            </button>

            <button
              onClick={() => onNavigate('/ledger')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D4ED8] text-white text-xs font-semibold hover:bg-[#1E40AF] active:bg-[#172554] transition-colors cursor-pointer shadow-xs"
            >
              <span>{isHi ? 'Khata Me Dekhein' : 'View in Ledger'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
