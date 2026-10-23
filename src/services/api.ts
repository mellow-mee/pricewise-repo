/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AssistantChatMessage,
  Business,
  PriceBenchmark,
  Receipt,
  SavingsOpportunity,
} from '../types/index.ts';

export async function getActiveBusiness(): Promise<Business> {
  const res = await fetch('/api/business/active');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch business');
  return json.data;
}

export async function updateBusinessConsent(enabled: boolean): Promise<Business> {
  const res = await fetch('/api/business/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update consent');
  return json.data;
}

export async function getReceipts(): Promise<Receipt[]> {
  const res = await fetch('/api/receipts');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch receipts');
  return json.data;
}

export async function getReceipt(id: string): Promise<Receipt> {
  const res = await fetch(`/api/receipts/${id}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch receipt');
  return json.data;
}

export async function createReceipt(draft: Receipt): Promise<Receipt> {
  const res = await fetch('/api/receipts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to create receipt');
  return json.data;
}

export async function updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt> {
  const res = await fetch(`/api/receipts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update receipt');
  return json.data;
}

export async function deleteReceipt(id: string): Promise<void> {
  const res = await fetch(`/api/receipts/${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete receipt');
}

export async function extractReceiptImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<any> {
  const res = await fetch('/api/scan/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to extract receipt');
  return json.data;
}

export async function getBenchmarks(): Promise<PriceBenchmark[]> {
  const res = await fetch('/api/benchmarks');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch benchmarks');
  return json.data;
}

export async function getSavingsOpportunities(): Promise<SavingsOpportunity[]> {
  const res = await fetch('/api/opportunities');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch opportunities');
  return json.data;
}

export const getOpportunities = getSavingsOpportunities;

export async function askAssistant(message: string, language: 'en' | 'hi' = 'en'): Promise<AssistantChatMessage> {
  const res = await fetch('/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Assistant failed to answer');
  return json.data;
}

export async function resetDemoDatabase(): Promise<void> {
  const res = await fetch('/api/db/reset', { method: 'POST' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to reset demo DB');
}
