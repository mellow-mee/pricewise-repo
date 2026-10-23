/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatINR,
  paiseToRupees,
  rupeesToPaise,
  reconcileReceipt,
  calculateSpendingSummary,
} from './finance.ts';
import { Receipt, SavingsOpportunity } from '../types/index.ts';

test('formatINR formats currency according to Indian conventions', () => {
  assert.equal(formatINR(8460000), '₹84,600');
  assert.equal(formatINR(1250), '₹12.50');
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(-540000), '-₹5,400');
  assert.equal(formatINR(1200), '₹12');
  assert.equal(formatINR(1200, { showDecimals: true }), '₹12.00');
});

test('paise and rupees conversions are safe and reversible', () => {
  assert.equal(rupeesToPaise(12.5), 1250);
  assert.equal(rupeesToPaise(84600), 8460000);
  assert.equal(paiseToRupees(1250), 12.5);
  assert.equal(paiseToRupees(8460000), 84600);
});

test('reconcileReceipt flags discrepancy between items and subtotal', () => {
  const matching = reconcileReceipt([1000, 2500, 1500], 5000, 500, 0, 0);
  assert.equal(matching.itemsSumMinor, 5000);
  assert.equal(matching.expectedTotalMinor, 5500);
  assert.equal(matching.subtotalMatchesItems, true);
  assert.equal(matching.discrepancyMinor, 0);

  const mismatched = reconcileReceipt([1000, 2000], 5000, 500, 0, 0);
  assert.equal(mismatched.itemsSumMinor, 3000);
  assert.equal(mismatched.subtotalMatchesItems, false);
  assert.equal(mismatched.discrepancyMinor, 2000);
});

test('calculateSpendingSummary handles transactions and potential differences', () => {
  const mockReceipts: Receipt[] = [
    {
      id: 'rec-1',
      businessId: 'biz-1',
      merchantName: 'Supplier A',
      invoiceNumber: 'INV-001',
      transactionDate: '2026-10-12',
      currency: 'INR',
      subtotalMinor: 5000000,
      taxMinor: 400000,
      discountMinor: 0,
      extraChargesMinor: 0,
      totalMinor: 5400000, // ₹54,000
      status: 'confirmed',
      extractionStatus: 'completed',
      reviewStatus: 'confirmed',
      items: [],
      createdAt: '2026-10-12T10:00:00Z',
      updatedAt: '2026-10-12T10:00:00Z',
    },
    {
      id: 'rec-2',
      businessId: 'biz-1',
      merchantName: 'Supplier B',
      invoiceNumber: 'INV-002',
      transactionDate: '2026-10-18',
      currency: 'INR',
      subtotalMinor: 3000000,
      taxMinor: 60000,
      discountMinor: 0,
      extraChargesMinor: 0,
      totalMinor: 3060000, // ₹30,600 -> Total month: ₹84,600
      status: 'confirmed',
      extractionStatus: 'completed',
      reviewStatus: 'confirmed',
      items: [],
      createdAt: '2026-10-18T10:00:00Z',
      updatedAt: '2026-10-18T10:00:00Z',
    },
  ];

  const mockOpportunities: SavingsOpportunity[] = [
    {
      id: 'opp-1',
      businessId: 'biz-1',
      productId: 'prod-box-3ply',
      productName: 'Packaging Boxes (3-Ply Kraft)',
      category: 'Packaging',
      specification: '10x8x6 inch 3-ply brown kraft',
      unit: 'box',
      currentRecordedPriceMinor: 1200, // ₹12.00
      benchmarkMedianPriceMinor: 950,  // ₹9.50
      differencePerUnitMinor: 250,    // ₹2.50
      typicalPurchaseVolume: 500,
      estimatedPotentialSavingsMinor: 125000, // ₹1,250
      independentBusinessesCount: 8,
      benchmarkPeriod: 'Last 90 days',
      confidence: 'High',
      state: 'meaningful_opportunity',
      explanation: 'Based on 8 independent local businesses',
      suggestedAction: 'Compare bulk packaging suppliers',
      lastPurchasedDate: '2026-10-12',
      syntheticDemoData: true,
    },
  ];

  const summary = calculateSpendingSummary(mockReceipts, mockOpportunities);
  assert.equal(summary.currentMonthSpendingMinor, 8460000); // ₹84,600
  assert.equal(summary.hasEnoughBenchmarkData, true);
  assert.equal(summary.potentialDifferenceMinor, 125000); // ₹1,250
  assert.equal(summary.benchmarkSpendingMinor, 8460000 - 125000);
});
