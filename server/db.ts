/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Business,
  PriceBenchmark,
  Receipt,
  SavingsOpportunity,
} from '../src/types/index.ts';
import { initialBenchmarks, initialBusiness, initialReceipts } from './initialData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface DatabaseSchema {
  business: Business;
  receipts: Receipt[];
  benchmarks: PriceBenchmark[];
}

function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    const initialData: DatabaseSchema = {
      business: initialBusiness,
      receipts: initialReceipts,
      benchmarks: initialBenchmarks,
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readStore(): DatabaseSchema {
  ensureStorage();
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading store.json, resetting to initial data:', err);
    const initialData: DatabaseSchema = {
      business: initialBusiness,
      receipts: initialReceipts,
      benchmarks: initialBenchmarks,
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function writeStore(data: DatabaseSchema): void {
  ensureStorage();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  getBusiness(): Business {
    const store = readStore();
    return store.business;
  },

  updateBusinessConsent(enabled: boolean): Business {
    const store = readStore();
    store.business.benchmarkParticipationEnabled = enabled;
    writeStore(store);
    return store.business;
  },

  getReceipts(): Receipt[] {
    const store = readStore();
    return store.receipts.sort((a, b) => {
      return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
    });
  },

  getReceipt(id: string): Receipt | undefined {
    const store = readStore();
    return store.receipts.find((r) => r.id === id);
  },

  createReceipt(receipt: Receipt): Receipt {
    const store = readStore();
    // Prevent duplicate ID
    const exists = store.receipts.some((r) => r.id === receipt.id);
    if (exists) {
      receipt.id = `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    }
    store.receipts.unshift(receipt);
    writeStore(store);
    return receipt;
  },

  updateReceipt(id: string, updates: Partial<Receipt>): Receipt | null {
    const store = readStore();
    const index = store.receipts.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const existing = store.receipts[index];
    const updated: Receipt = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Re-verify line item totals if items were updated
    if (updates.items) {
      const itemsSum = updates.items.reduce((acc, curr) => acc + (curr.lineTotalMinor || 0), 0);
      updated.subtotalMinor = itemsSum;
      updated.totalMinor =
        itemsSum + (updated.taxMinor || 0) + (updated.extraChargesMinor || 0) - (updated.discountMinor || 0);
    }

    store.receipts[index] = updated;
    writeStore(store);
    return updated;
  },

  deleteReceipt(id: string): boolean {
    const store = readStore();
    const originalLength = store.receipts.length;
    store.receipts = store.receipts.filter((r) => r.id !== id);
    if (store.receipts.length !== originalLength) {
      writeStore(store);
      return true;
    }
    return false;
  },

  getBenchmarks(): PriceBenchmark[] {
    const store = readStore();
    return store.benchmarks;
  },

  /**
   * Derive purchasing intelligence and savings opportunities by comparing
   * user's most recent purchase prices against regional benchmarks.
   */
  getSavingsOpportunities(): SavingsOpportunity[] {
    const store = readStore();
    const confirmedReceipts = store.receipts.filter((r) => r.status === 'confirmed');
    const benchmarks = store.benchmarks;

    const opportunities: SavingsOpportunity[] = [];

    // Map each benchmark to user's purchases
    for (const bmk of benchmarks) {
      // Find all line items matching this product
      const matchingItems: {
        unitPriceMinor: number;
        qty: number;
        date: string;
        spec: string;
      }[] = [];

      for (const rec of confirmedReceipts) {
        for (const item of rec.items) {
          if (
            (item.canonicalProductId && item.canonicalProductId === bmk.productId) ||
            item.productName.toLowerCase().includes(bmk.productName.toLowerCase().split(' ')[0])
          ) {
            matchingItems.push({
              unitPriceMinor: item.unitPriceMinor,
              qty: item.quantity,
              date: rec.transactionDate,
              spec: item.specification || bmk.specification,
            });
          }
        }
      }

      // Check if insufficient data threshold
      if (bmk.independentBusinessCount < 5) {
        const lastMatched = matchingItems[0];
        opportunities.push({
          id: `opp-${bmk.productId}`,
          businessId: store.business.id,
          productId: bmk.productId,
          productName: bmk.productName,
          category: bmk.category,
          specification: bmk.specification,
          unit: bmk.baseUnit,
          currentRecordedPriceMinor: lastMatched ? lastMatched.unitPriceMinor : 0,
          benchmarkMedianPriceMinor: 0,
          differencePerUnitMinor: 0,
          typicalPurchaseVolume: lastMatched ? lastMatched.qty : 0,
          estimatedPotentialSavingsMinor: 0,
          independentBusinessesCount: bmk.independentBusinessCount,
          benchmarkPeriod: bmk.periodLabel,
          confidence: 'Low',
          state: 'insufficient_data',
          explanation: `Only ${bmk.independentBusinessCount} independent businesses have reported purchases in this category. Pricewise requires >= 5 independent contributors before publishing collective medians.`,
          suggestedAction: 'Keep uploading your invoices to help bootstrap collective benchmarks for this category.',
          lastPurchasedDate: lastMatched ? lastMatched.date : 'N/A',
          syntheticDemoData: true,
        });
        continue;
      }

      // If user hasn't purchased this product, skip or show baseline
      if (matchingItems.length === 0) {
        continue;
      }

      // Get latest recorded purchase
      matchingItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = matchingItems[0];
      const differencePerUnit = latest.unitPriceMinor - bmk.medianUnitPriceMinor;
      const differencePercentage = Number(((differencePerUnit / bmk.medianUnitPriceMinor) * 100).toFixed(1));

      // Calculate typical volume from user's history
      const typicalVolume = latest.qty > 0 ? latest.qty : 100;
      const potentialSavings = Math.max(0, differencePerUnit * typicalVolume);

      if (differencePerUnit > 0 && differencePercentage >= 5) {
        // State 1: Meaningful Savings Opportunity
        opportunities.push({
          id: `opp-${bmk.productId}`,
          businessId: store.business.id,
          productId: bmk.productId,
          productName: bmk.productName,
          category: bmk.category,
          specification: bmk.specification,
          unit: bmk.baseUnit,
          currentRecordedPriceMinor: latest.unitPriceMinor,
          benchmarkMedianPriceMinor: bmk.medianUnitPriceMinor,
          differencePerUnitMinor: differencePerUnit,
          typicalPurchaseVolume: typicalVolume,
          estimatedPotentialSavingsMinor: potentialSavings,
          independentBusinessesCount: bmk.independentBusinessCount,
          benchmarkPeriod: bmk.periodLabel,
          confidence: bmk.confidence,
          state: 'meaningful_opportunity',
          explanation: `Your recorded unit price is ₹${(differencePerUnit / 100).toFixed(2)} above the regional median (${differencePercentage}% higher) across ${bmk.independentBusinessCount} independent businesses.`,
          suggestedAction: `Request price matching or compare alternate certified regional suppliers for ${bmk.productName}.`,
          lastPurchasedDate: latest.date,
          syntheticDemoData: true,
        });
      } else {
        // State 2: Already Purchasing Competitively
        opportunities.push({
          id: `opp-${bmk.productId}`,
          businessId: store.business.id,
          productId: bmk.productId,
          productName: bmk.productName,
          category: bmk.category,
          specification: bmk.specification,
          unit: bmk.baseUnit,
          currentRecordedPriceMinor: latest.unitPriceMinor,
          benchmarkMedianPriceMinor: bmk.medianUnitPriceMinor,
          differencePerUnitMinor: differencePerUnit,
          typicalPurchaseVolume: typicalVolume,
          estimatedPotentialSavingsMinor: 0,
          independentBusinessesCount: bmk.independentBusinessCount,
          benchmarkPeriod: bmk.periodLabel,
          confidence: bmk.confidence,
          state: 'already_competitive',
          explanation: `You're already purchasing competitively. Your recorded price is at or below the regional median across ${bmk.independentBusinessCount} independent businesses.`,
          suggestedAction: 'Maintain your current supplier terms and volumes.',
          lastPurchasedDate: latest.date,
          syntheticDemoData: true,
        });
      }
    }

    return opportunities;
  },

  resetToDemo(): void {
    const initialData: DatabaseSchema = {
      business: initialBusiness,
      receipts: initialReceipts,
      benchmarks: initialBenchmarks,
    };
    writeStore(initialData);
  },
};
