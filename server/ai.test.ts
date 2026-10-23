/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import { extractReceiptFromImage } from './ai.ts';

dotenv.config();

test('extractReceiptFromImage processes receipt image and extracts structured invoice data', async () => {
  // Test with standard image data payload
  const sampleBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const result = await extractReceiptFromImage(sampleBase64, 'image/png');

  assert.ok(result, 'Expected result to be returned');
  assert.equal(typeof result.merchantName, 'string', 'merchantName should be string');
  assert.equal(typeof result.totalMinor, 'number', 'totalMinor should be number');
  assert.equal(Array.isArray(result.items), true, 'items should be an array');
  assert.equal(result.currency, 'INR', 'currency should be INR');
  assert.ok(result.items.length > 0, 'items should contain at least one extracted item');
});

test('extractReceiptFromImage handles data URI prefix correctly', async () => {
  const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const result = await extractReceiptFromImage(dataUri);

  assert.ok(result, 'Expected extraction to succeed with data URI');
  assert.equal(result.currency, 'INR');
  assert.equal(typeof result.totalMinor, 'number');
});
