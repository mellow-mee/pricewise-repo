/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CurrencyCode = 'INR';

export interface Business {
  id: string;
  name: string;
  industry: string;
  region: string;
  currency: CurrencyCode;
  createdAt: string;
  benchmarkParticipationEnabled: boolean;
  ownerName: string;
  isDemo: boolean;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  businessId: string;
  role: 'owner' | 'manager' | 'accountant';
}

export type ProductCategory =
  | 'Packaging'
  | 'Inventory & Food'
  | 'Cleaning & Hygiene'
  | 'Store Supplies'
  | 'Utilities & Facilities'
  | 'Equipment';

export interface ReceiptLineItem {
  id: string;
  receiptId: string;
  originalDescription: string;
  canonicalProductId?: string;
  productName: string;
  brand?: string;
  specification?: string; // e.g. "3-ply 10x8x6 inch", "500g vacuum sealed"
  quantity: number;
  unit: string; // "box", "kg", "pack", "roll", "jar", "litre", "piece"
  unitPriceMinor: number; // in paise
  lineTotalMinor: number; // in paise
  category: ProductCategory;
  confidence?: number; // 0.0 - 1.0
  reviewFlags?: string[];
}

export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
export type ReviewStatus = 'needs_review' | 'confirmed' | 'rejected';

export interface Receipt {
  id: string;
  businessId: string;
  merchantName: string;
  invoiceNumber: string;
  transactionDate: string; // ISO date YYYY-MM-DD
  currency: CurrencyCode;
  subtotalMinor: number;
  taxMinor: number;
  discountMinor: number;
  extraChargesMinor: number;
  totalMinor: number;
  paymentMethod?: string;
  status: 'confirmed' | 'pending_review';
  extractionStatus: ExtractionStatus;
  reviewStatus: ReviewStatus;
  imageUrl?: string;
  items: ReceiptLineItem[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
  isDemo?: boolean;
}

export type BenchmarkComparisonState =
  | 'meaningful_opportunity' // Recorded price significantly above median
  | 'already_competitive'    // Recorded price at or below median
  | 'insufficient_data';     // Sample size below threshold (< 5 independent businesses)

export interface CanonicalProduct {
  id: string;
  name: string;
  category: ProductCategory;
  specification: string;
  baseUnit: string;
}

export interface PriceBenchmark {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  specification: string;
  region: string;
  baseUnit: string;
  periodLabel: string; // e.g. "Last 90 days (Oct 2026)"
  medianUnitPriceMinor: number; // in paise
  sampleSize: number; // Total transactions
  independentBusinessCount: number; // Must be >= 5 to show collective benchmark
  confidence: 'High' | 'Moderate' | 'Low';
  methodology: string;
  syntheticDemoData: boolean;
}

export interface SavingsOpportunity {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  specification: string;
  unit: string;
  currentRecordedPriceMinor: number;
  benchmarkMedianPriceMinor: number;
  differencePerUnitMinor: number;
  typicalPurchaseVolume: number;
  estimatedPotentialSavingsMinor: number;
  independentBusinessesCount: number;
  benchmarkPeriod: string;
  confidence: 'High' | 'Moderate' | 'Low';
  state: BenchmarkComparisonState;
  explanation: string;
  suggestedAction: string;
  lastPurchasedDate: string;
  syntheticDemoData: boolean;
}

export interface SpendingSummary {
  currentMonthSpendingMinor: number;
  previousMonthSpendingMinor: number;
  monthOverMonthChangePercentage: number;
  benchmarkSpendingMinor: number | null; // null if insufficient benchmark data
  potentialDifferenceMinor: number | null;
  differencePercentage: number | null;
  hasEnoughBenchmarkData: boolean;
  benchmarkExplanation: string;
}

export interface MonthlySpendingPoint {
  monthKey: string; // e.g. "2026-05"
  monthLabel: string; // e.g. "May 2026"
  actualSpendingMinor: number;
  benchmarkSpendingMinor: number | null;
  transactionCount: number;
}

export interface PriorityInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'alert' | 'competitive' | 'info';
  actionLabel?: string;
  actionDestination?: string;
  isDemo?: boolean;
}

export interface AssistantChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  groundedMetrics?: {
    label: string;
    value: string;
    detail?: string;
  }[];
  referencedReceiptIds?: string[];
  suggestedFollowUps?: string[];
  isDemo?: boolean;
}
