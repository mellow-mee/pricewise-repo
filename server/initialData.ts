/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Business, PriceBenchmark, Receipt } from '../src/types/index.ts';

export const initialBusiness: Business = {
  id: 'biz_green_basket',
  name: 'Green Basket Stores',
  industry: 'Organic Grocery & Retail',
  region: 'Mumbai Suburban / Western Maharashtra',
  currency: 'INR',
  createdAt: '2026-04-01T08:00:00Z',
  benchmarkParticipationEnabled: true,
  ownerName: 'Rahul Sharma',
  isDemo: true,
};

export const initialBenchmarks: PriceBenchmark[] = [
  {
    id: 'bmk-box-3ply',
    productId: 'prod-box-3ply',
    productName: 'Packaging Boxes (3-Ply Kraft 10x8x6)',
    category: 'Packaging',
    specification: '10x8x6 inch 3-ply brown corrugated kraft box',
    region: 'Western Maharashtra',
    baseUnit: 'box',
    periodLabel: 'Last 90 days (Aug - Oct 2026)',
    medianUnitPriceMinor: 950, // ₹9.50
    sampleSize: 420,
    independentBusinessCount: 8,
    confidence: 'High',
    methodology: 'Trimmed median across 8 independent regional retail businesses with minimum order >= 250 units.',
    syntheticDemoData: true,
  },
  {
    id: 'bmk-kraft-bags',
    productId: 'prod-kraft-bags',
    productName: 'Kraft Paper Carry Bags (Medium)',
    category: 'Packaging',
    specification: '12x10 inch 120 GSM twisted handle kraft paper bag',
    region: 'Western Maharashtra',
    baseUnit: 'bag',
    periodLabel: 'Last 90 days (Aug - Oct 2026)',
    medianUnitPriceMinor: 580, // ₹5.80
    sampleSize: 860,
    independentBusinessCount: 14,
    confidence: 'High',
    methodology: 'Median purchase price across 14 independent retailers in Mumbai & Pune.',
    syntheticDemoData: true,
  },
  {
    id: 'bmk-disinfectant-5l',
    productId: 'prod-disinfectant-5l',
    productName: 'Eco Surface Disinfectant (5L Can)',
    category: 'Cleaning & Hygiene',
    specification: '5 Litre concentrated herbal floor & surface cleaner',
    region: 'Western Maharashtra',
    baseUnit: 'can',
    periodLabel: 'Last 90 days (Aug - Oct 2026)',
    medianUnitPriceMinor: 72000, // ₹720.00
    sampleSize: 180,
    independentBusinessCount: 11,
    confidence: 'High',
    methodology: 'Median unit price across 11 food & grocery outlets.',
    syntheticDemoData: true,
  },
  {
    id: 'bmk-paper-tape',
    productId: 'prod-paper-tape',
    productName: 'Biodegradable Paper Tape (50mm x 50m)',
    category: 'Packaging',
    specification: 'Water-activated reinforced kraft packaging tape 50mm',
    region: 'Western Maharashtra',
    baseUnit: 'roll',
    periodLabel: 'Last 90 days (Aug - Oct 2026)',
    medianUnitPriceMinor: 12500, // ₹125.00
    sampleSize: 210,
    independentBusinessCount: 7,
    confidence: 'Moderate',
    methodology: 'Median price from 7 participating retail members.',
    syntheticDemoData: true,
  },
  {
    id: 'bmk-assam-tea',
    productId: 'prod-assam-tea',
    productName: 'Assam CTC Black Tea (1kg Bulk)',
    category: 'Inventory & Food',
    specification: 'Grade BP organic certified loose leaf bulk pack 1kg',
    region: 'Western Maharashtra',
    baseUnit: 'kg',
    periodLabel: 'Last 90 days (Aug - Oct 2026)',
    medianUnitPriceMinor: 34500, // ₹345.00
    sampleSize: 560,
    independentBusinessCount: 16,
    confidence: 'High',
    methodology: 'Wholesale median across 16 grocery & cafe businesses.',
    syntheticDemoData: true,
  },
  {
    id: 'bmk-glass-jars',
    productId: 'prod-glass-jars',
    productName: 'Glass Storage Jars (500ml Airtight)',
    category: 'Store Supplies',
    specification: '500ml food-grade soda lime glass jar with metal clamp',
    region: 'Western Maharashtra',
    baseUnit: 'jar',
    periodLabel: 'Last 90 days (Aug - Oct 2026)',
    medianUnitPriceMinor: 6000, // ₹60.00
    sampleSize: 310,
    independentBusinessCount: 9,
    confidence: 'Moderate',
    methodology: 'Median price across 9 retail stores.',
    syntheticDemoData: true,
  },
  {
    id: 'bmk-jute-pouches',
    productId: 'prod-jute-pouches',
    productName: 'Specialty Cold-Press Jute Display Pouches',
    category: 'Packaging',
    specification: 'Handmade natural golden jute pouch with drawstring',
    region: 'Western Maharashtra',
    baseUnit: 'piece',
    periodLabel: 'Current Period',
    medianUnitPriceMinor: 0,
    sampleSize: 12,
    independentBusinessCount: 2, // Below 5 -> Insufficient data!
    confidence: 'Low',
    methodology: 'Insufficient contributing businesses (threshold >= 5).',
    syntheticDemoData: true,
  },
  {
    id: 'bmk-wood-racks',
    productId: 'prod-wood-racks',
    productName: 'Modular Pine Display Shelf Units',
    category: 'Equipment',
    specification: '3-tier natural pine timber retail shelf unit',
    region: 'Western Maharashtra',
    baseUnit: 'unit',
    periodLabel: 'Current Period',
    medianUnitPriceMinor: 0,
    sampleSize: 3,
    independentBusinessCount: 1, // Below 5 -> Insufficient data!
    confidence: 'Low',
    methodology: 'Insufficient contributing businesses (threshold >= 5).',
    syntheticDemoData: true,
  },
];

// Helper to build mathematically consistent receipt
function createReceipt(
  id: string,
  merchantName: string,
  invoiceNumber: string,
  date: string,
  items: {
    desc: string;
    productName: string;
    canonicalId?: string;
    spec: string;
    qty: number;
    unit: string;
    unitPricePaise: number;
    category: any;
  }[],
  taxPaise: number = 0,
  extraChargesPaise: number = 0,
  discountPaise: number = 0
): Receipt {
  const lineItems = items.map((item, idx) => {
    const lineTotalMinor = Math.round(item.qty * item.unitPricePaise);
    return {
      id: `${id}-item-${idx + 1}`,
      receiptId: id,
      originalDescription: item.desc,
      productName: item.productName,
      canonicalProductId: item.canonicalId,
      specification: item.spec,
      quantity: item.qty,
      unit: item.unit,
      unitPriceMinor: item.unitPricePaise,
      lineTotalMinor,
      category: item.category,
      confidence: 0.98,
      reviewFlags: [],
    };
  });

  const subtotalMinor = lineItems.reduce((acc, curr) => acc + curr.lineTotalMinor, 0);
  const totalMinor = subtotalMinor + taxPaise + extraChargesPaise - discountPaise;

  return {
    id,
    businessId: initialBusiness.id,
    merchantName,
    invoiceNumber,
    transactionDate: date,
    currency: 'INR',
    subtotalMinor,
    taxMinor: taxPaise,
    discountMinor: discountPaise,
    extraChargesMinor: extraChargesPaise,
    totalMinor,
    paymentMethod: 'UPI / Commercial Bank Transfer',
    status: 'confirmed',
    extractionStatus: 'completed',
    reviewStatus: 'confirmed',
    items: lineItems,
    createdAt: `${date}T10:15:00Z`,
    updatedAt: `${date}T10:15:00Z`,
    isDemo: true,
  };
}

export const initialReceipts: Receipt[] = [
  // OCTOBER 2026 (Current month - Target ~ ₹84,600)
  createReceipt(
    'rec-2026-10-01',
    'PackTech Solutions Pvt Ltd',
    'PTS-26-8812',
    '2026-10-14',
    [
      {
        desc: '3-Ply Brown Corrugated Kraft Boxes 10x8x6 inch',
        productName: 'Packaging Boxes (3-Ply Kraft 10x8x6)',
        canonicalId: 'prod-box-3ply',
        spec: '10x8x6 inch 3-ply brown corrugated kraft box',
        qty: 500,
        unit: 'box',
        unitPricePaise: 1200, // ₹12.00 (Benchmark is ₹9.50)
        category: 'Packaging',
      },
      {
        desc: 'Reinforced Kraft Paper Packing Tape 50mm x 50m',
        productName: 'Biodegradable Paper Tape (50mm x 50m)',
        canonicalId: 'prod-paper-tape',
        spec: 'Water-activated reinforced kraft packaging tape 50mm',
        qty: 20,
        unit: 'roll',
        unitPricePaise: 14500, // ₹145.00 (Benchmark is ₹125.00)
        category: 'Packaging',
      },
    ],
    44500, // ₹445 5% GST
    0,
    0
  ), // Total: 6,000 + 2,900 + 445 = ₹9,345 (934500 paise)

  createReceipt(
    'rec-2026-10-02',
    'Nilgiri Organic Plantations',
    'NOP-INV-4410',
    '2026-10-18',
    [
      {
        desc: 'Premium Assam CTC Black Tea Grade BP 1kg',
        productName: 'Assam CTC Black Tea (1kg Bulk)',
        canonicalId: 'prod-assam-tea',
        spec: 'Grade BP organic certified loose leaf bulk pack 1kg',
        qty: 80,
        unit: 'kg',
        unitPricePaise: 34000, // ₹340.00 (Benchmark is ₹345 -> Competitive!)
        category: 'Inventory & Food',
      },
      {
        desc: 'Organic Green Cardamom Whole 250g Pouch',
        productName: 'Organic Whole Cardamom (250g)',
        spec: '8mm bold green cardamom pouch',
        qty: 20,
        unit: 'pack',
        unitPricePaise: 65000, // ₹650.00
        category: 'Inventory & Food',
      },
    ],
    201000, // 5% GST
    0,
    0
  ), // Subtotal: 27,200 + 13,000 = 40,200 + 2,010 = ₹42,210 (4221000 paise)

  createReceipt(
    'rec-2026-10-03',
    'Deshmukh Kraft Mills',
    'DKM-7709',
    '2026-10-08',
    [
      {
        desc: 'Kraft Paper Carry Bags Medium 12x10 Twisted Handle',
        productName: 'Kraft Paper Carry Bags (Medium)',
        canonicalId: 'prod-kraft-bags',
        spec: '12x10 inch 120 GSM twisted handle kraft paper bag',
        qty: 1000,
        unit: 'bag',
        unitPricePaise: 720, // ₹7.20 (Benchmark is ₹5.80)
        category: 'Packaging',
      },
    ],
    36000, // 5% GST
    0,
    0
  ), // Subtotal: 7,200 + 360 = ₹7,560 (756000 paise)

  createReceipt(
    'rec-2026-10-04',
    'Apex Clean & Hygiene Corp',
    'ACH-2026-092',
    '2026-10-05',
    [
      {
        desc: 'Eco Herbal Surface Cleaner & Disinfectant Canister 5L',
        productName: 'Eco Surface Disinfectant (5L Can)',
        canonicalId: 'prod-disinfectant-5l',
        spec: '5 Litre concentrated herbal floor & surface cleaner',
        qty: 6,
        unit: 'can',
        unitPricePaise: 85000, // ₹850.00 (Benchmark is ₹720.00)
        category: 'Cleaning & Hygiene',
      },
      {
        desc: 'Commercial Microfiber Cleaning Towels (Pack of 12)',
        productName: 'Microfiber Cleaning Towels (Pack 12)',
        spec: '400 GSM yellow & blue microfiber towels',
        qty: 4,
        unit: 'pack',
        unitPricePaise: 48000, // ₹480.00
        category: 'Cleaning & Hygiene',
      },
    ],
    35100, // 5% GST
    0,
    0
  ), // Subtotal: 5,100 + 1,920 = 7,020 + 351 = ₹7,371 (737100 paise)

  createReceipt(
    'rec-2026-10-05',
    'Siddhi Glass & Containers',
    'SGC-9014',
    '2026-10-11',
    [
      {
        desc: 'Airtight Glass Jars with Clamp 500ml',
        productName: 'Glass Storage Jars (500ml Airtight)',
        canonicalId: 'prod-glass-jars',
        spec: '500ml food-grade soda lime glass jar with metal clamp',
        qty: 120,
        unit: 'jar',
        unitPricePaise: 5800, // ₹58.00 (Benchmark is ₹60.00 -> Competitive!)
        category: 'Store Supplies',
      },
    ],
    34800, // 5% GST
    0,
    0
  ), // Subtotal: 6,960 + 348 = ₹7,308 (730800 paise)

  createReceipt(
    'rec-2026-10-06',
    'Adani Electricity Mumbai Ltd',
    'ELEC-OCT-2026',
    '2026-10-03',
    [
      {
        desc: 'Commercial Retail Power Consumption Units - Bandra Store',
        productName: 'Commercial Electricity Charges',
        spec: 'Commercial LT-II Tariff Bandra West Store',
        qty: 1,
        unit: 'bill',
        unitPricePaise: 1080600, // ₹10,806.00
        category: 'Utilities & Facilities',
      },
    ],
    0,
    0,
    0
  ), // Total: ₹10,806 (1080600 paise)
  // Total October = 9345 + 42210 + 7560 + 7371 + 7308 + 10806 = ₹84,600! Exactly matching prompt example!

  // SEPTEMBER 2026 (Total ~ ₹79,400)
  createReceipt(
    'rec-2026-09-01',
    'Nilgiri Organic Plantations',
    'NOP-INV-4290',
    '2026-09-14',
    [
      {
        desc: 'Premium Assam CTC Black Tea Grade BP 1kg',
        productName: 'Assam CTC Black Tea (1kg Bulk)',
        canonicalId: 'prod-assam-tea',
        spec: 'Grade BP organic certified loose leaf bulk pack 1kg',
        qty: 75,
        unit: 'kg',
        unitPricePaise: 34000,
        category: 'Inventory & Food',
      },
      {
        desc: 'Organic Ceylon Cinnamon Quills 500g',
        productName: 'Ceylon Cinnamon Quills (500g)',
        spec: 'Organic certified true cinnamon stick quills',
        qty: 15,
        unit: 'pack',
        unitPricePaise: 52000,
        category: 'Inventory & Food',
      },
    ],
    166500,
    0,
    0
  ),

  createReceipt(
    'rec-2026-09-02',
    'Deshmukh Kraft Mills',
    'DKM-7431',
    '2026-09-19',
    [
      {
        desc: 'Kraft Paper Carry Bags Medium 12x10 Twisted Handle',
        productName: 'Kraft Paper Carry Bags (Medium)',
        canonicalId: 'prod-kraft-bags',
        spec: '12x10 inch 120 GSM twisted handle kraft paper bag',
        qty: 1200,
        unit: 'bag',
        unitPricePaise: 720,
        category: 'Packaging',
      },
    ],
    43200,
    0,
    0
  ),

  createReceipt(
    'rec-2026-09-03',
    'PackTech Solutions Pvt Ltd',
    'PTS-26-8401',
    '2026-09-08',
    [
      {
        desc: '3-Ply Brown Corrugated Kraft Boxes 10x8x6 inch',
        productName: 'Packaging Boxes (3-Ply Kraft 10x8x6)',
        canonicalId: 'prod-box-3ply',
        spec: '10x8x6 inch 3-ply brown corrugated kraft box',
        qty: 450,
        unit: 'box',
        unitPricePaise: 1200,
        category: 'Packaging',
      },
    ],
    27000,
    0,
    0
  ),

  createReceipt(
    'rec-2026-09-04',
    'Apex Clean & Hygiene Corp',
    'ACH-2026-079',
    '2026-09-04',
    [
      {
        desc: 'Eco Herbal Surface Cleaner & Disinfectant Canister 5L',
        productName: 'Eco Surface Disinfectant (5L Can)',
        canonicalId: 'prod-disinfectant-5l',
        spec: '5 Litre concentrated herbal floor & surface cleaner',
        qty: 5,
        unit: 'can',
        unitPricePaise: 85000,
        category: 'Cleaning & Hygiene',
      },
    ],
    21250,
    0,
    0
  ),

  createReceipt(
    'rec-2026-09-05',
    'Adani Electricity Mumbai Ltd',
    'ELEC-SEP-2026',
    '2026-09-02',
    [
      {
        desc: 'Commercial Retail Power Consumption Units - Bandra Store',
        productName: 'Commercial Electricity Charges',
        spec: 'Commercial LT-II Tariff Bandra West Store',
        qty: 1,
        unit: 'bill',
        unitPricePaise: 1120000,
        category: 'Utilities & Facilities',
      },
    ],
    0,
    0,
    0
  ),

  createReceipt(
    'rec-2026-09-06',
    'Bespoke Craft Guild',
    'BCG-INV-1102',
    '2026-09-22',
    [
      {
        desc: 'Specialty Cold-Press Jute Display Pouches with Drawstring',
        productName: 'Specialty Cold-Press Jute Display Pouches',
        canonicalId: 'prod-jute-pouches',
        spec: 'Handmade natural golden jute pouch with drawstring',
        qty: 150,
        unit: 'piece',
        unitPricePaise: 4500, // ₹45.00
        category: 'Packaging',
      },
    ],
    33750,
    0,
    0
  ),

  // AUGUST 2026 (~ ₹76,800)
  createReceipt(
    'rec-2026-08-01',
    'Nilgiri Organic Plantations',
    'NOP-INV-4102',
    '2026-08-11',
    [
      {
        desc: 'Premium Assam CTC Black Tea Grade BP 1kg',
        productName: 'Assam CTC Black Tea (1kg Bulk)',
        canonicalId: 'prod-assam-tea',
        spec: 'Grade BP organic certified loose leaf bulk pack 1kg',
        qty: 85,
        unit: 'kg',
        unitPricePaise: 34000,
        category: 'Inventory & Food',
      },
    ],
    144500,
    0,
    0
  ),
  createReceipt(
    'rec-2026-08-02',
    'Deshmukh Kraft Mills',
    'DKM-7190',
    '2026-08-17',
    [
      {
        desc: 'Kraft Paper Carry Bags Medium 12x10 Twisted Handle',
        productName: 'Kraft Paper Carry Bags (Medium)',
        canonicalId: 'prod-kraft-bags',
        spec: '12x10 inch 120 GSM twisted handle kraft paper bag',
        qty: 1500,
        unit: 'bag',
        unitPricePaise: 720,
        category: 'Packaging',
      },
    ],
    54000,
    0,
    0
  ),
  createReceipt(
    'rec-2026-08-03',
    'Adani Electricity Mumbai Ltd',
    'ELEC-AUG-2026',
    '2026-08-03',
    [
      {
        desc: 'Commercial Retail Power Consumption Units - Bandra Store',
        productName: 'Commercial Electricity Charges',
        spec: 'Commercial LT-II Tariff Bandra West Store',
        qty: 1,
        unit: 'bill',
        unitPricePaise: 1150000,
        category: 'Utilities & Facilities',
      },
    ],
    0,
    0,
    0
  ),
  createReceipt(
    'rec-2026-08-04',
    'PackTech Solutions Pvt Ltd',
    'PTS-26-8109',
    '2026-08-25',
    [
      {
        desc: '3-Ply Brown Corrugated Kraft Boxes 10x8x6 inch',
        productName: 'Packaging Boxes (3-Ply Kraft 10x8x6)',
        canonicalId: 'prod-box-3ply',
        spec: '10x8x6 inch 3-ply brown corrugated kraft box',
        qty: 600,
        unit: 'box',
        unitPricePaise: 1200,
        category: 'Packaging',
      },
      {
        desc: 'Reinforced Kraft Paper Packing Tape 50mm x 50m',
        productName: 'Biodegradable Paper Tape (50mm x 50m)',
        canonicalId: 'prod-paper-tape',
        spec: 'Water-activated reinforced kraft packaging tape 50mm',
        qty: 25,
        unit: 'roll',
        unitPricePaise: 14500,
        category: 'Packaging',
      },
    ],
    54125,
    0,
    0
  ),

  // JULY 2026 (~ ₹72,200)
  createReceipt(
    'rec-2026-07-01',
    'Nilgiri Organic Plantations',
    'NOP-INV-3980',
    '2026-07-15',
    [
      {
        desc: 'Premium Assam CTC Black Tea Grade BP 1kg',
        productName: 'Assam CTC Black Tea (1kg Bulk)',
        canonicalId: 'prod-assam-tea',
        spec: 'Grade BP organic certified loose leaf bulk pack 1kg',
        qty: 80,
        unit: 'kg',
        unitPricePaise: 34000,
        category: 'Inventory & Food',
      },
    ],
    136000,
    0,
    0
  ),
  createReceipt(
    'rec-2026-07-02',
    'Adani Electricity Mumbai Ltd',
    'ELEC-JUL-2026',
    '2026-07-04',
    [
      {
        desc: 'Commercial Retail Power Consumption Units - Bandra Store',
        productName: 'Commercial Electricity Charges',
        spec: 'Commercial LT-II Tariff Bandra West Store',
        qty: 1,
        unit: 'bill',
        unitPricePaise: 1090000,
        category: 'Utilities & Facilities',
      },
    ],
    0,
    0,
    0
  ),
  createReceipt(
    'rec-2026-07-03',
    'PackTech Solutions Pvt Ltd',
    'PTS-26-7811',
    '2026-07-20',
    [
      {
        desc: '3-Ply Brown Corrugated Kraft Boxes 10x8x6 inch',
        productName: 'Packaging Boxes (3-Ply Kraft 10x8x6)',
        canonicalId: 'prod-box-3ply',
        spec: '10x8x6 inch 3-ply brown corrugated kraft box',
        qty: 500,
        unit: 'box',
        unitPricePaise: 1200,
        category: 'Packaging',
      },
    ],
    30000,
    0,
    0
  ),
  createReceipt(
    'rec-2026-07-04',
    'Deshmukh Kraft Mills',
    'DKM-6901',
    '2026-07-28',
    [
      {
        desc: 'Kraft Paper Carry Bags Medium 12x10 Twisted Handle',
        productName: 'Kraft Paper Carry Bags (Medium)',
        canonicalId: 'prod-kraft-bags',
        spec: '12x10 inch 120 GSM twisted handle kraft paper bag',
        qty: 1100,
        unit: 'bag',
        unitPricePaise: 720,
        category: 'Packaging',
      },
    ],
    39600,
    0,
    0
  ),
  createReceipt(
    'rec-2026-07-05',
    'Siddhi Glass & Containers',
    'SGC-8712',
    '2026-07-10',
    [
      {
        desc: 'Airtight Glass Jars with Clamp 500ml',
        productName: 'Glass Storage Jars (500ml Airtight)',
        canonicalId: 'prod-glass-jars',
        spec: '500ml food-grade soda lime glass jar with metal clamp',
        qty: 150,
        unit: 'jar',
        unitPricePaise: 5800,
        category: 'Store Supplies',
      },
    ],
    43500,
    0,
    0
  ),

  // JUNE 2026 (~ ₹69,500)
  createReceipt(
    'rec-2026-06-01',
    'Nilgiri Organic Plantations',
    'NOP-INV-3790',
    '2026-06-12',
    [
      {
        desc: 'Premium Assam CTC Black Tea Grade BP 1kg',
        productName: 'Assam CTC Black Tea (1kg Bulk)',
        canonicalId: 'prod-assam-tea',
        spec: 'Grade BP organic certified loose leaf bulk pack 1kg',
        qty: 70,
        unit: 'kg',
        unitPricePaise: 34000,
        category: 'Inventory & Food',
      },
    ],
    119000,
    0,
    0
  ),
  createReceipt(
    'rec-2026-06-02',
    'Adani Electricity Mumbai Ltd',
    'ELEC-JUN-2026',
    '2026-06-03',
    [
      {
        desc: 'Commercial Retail Power Consumption Units - Bandra Store',
        productName: 'Commercial Electricity Charges',
        spec: 'Commercial LT-II Tariff Bandra West Store',
        qty: 1,
        unit: 'bill',
        unitPricePaise: 1180000,
        category: 'Utilities & Facilities',
      },
    ],
    0,
    0,
    0
  ),
  createReceipt(
    'rec-2026-06-03',
    'PackTech Solutions Pvt Ltd',
    'PTS-26-7490',
    '2026-06-18',
    [
      {
        desc: '3-Ply Brown Corrugated Kraft Boxes 10x8x6 inch',
        productName: 'Packaging Boxes (3-Ply Kraft 10x8x6)',
        canonicalId: 'prod-box-3ply',
        spec: '10x8x6 inch 3-ply brown corrugated kraft box',
        qty: 400,
        unit: 'box',
        unitPricePaise: 1200,
        category: 'Packaging',
      },
    ],
    24000,
    0,
    0
  ),
  createReceipt(
    'rec-2026-06-04',
    'Apex Clean & Hygiene Corp',
    'ACH-2026-045',
    '2026-06-08',
    [
      {
        desc: 'Eco Herbal Surface Cleaner & Disinfectant Canister 5L',
        productName: 'Eco Surface Disinfectant (5L Can)',
        canonicalId: 'prod-disinfectant-5l',
        spec: '5 Litre concentrated herbal floor & surface cleaner',
        qty: 6,
        unit: 'can',
        unitPricePaise: 85000,
        category: 'Cleaning & Hygiene',
      },
    ],
    25500,
    0,
    0
  ),

  // MAY 2026 (~ ₹66,800)
  createReceipt(
    'rec-2026-05-01',
    'Nilgiri Organic Plantations',
    'NOP-INV-3610',
    '2026-05-14',
    [
      {
        desc: 'Premium Assam CTC Black Tea Grade BP 1kg',
        productName: 'Assam CTC Black Tea (1kg Bulk)',
        canonicalId: 'prod-assam-tea',
        spec: 'Grade BP organic certified loose leaf bulk pack 1kg',
        qty: 70,
        unit: 'kg',
        unitPricePaise: 34000,
        category: 'Inventory & Food',
      },
    ],
    119000,
    0,
    0
  ),
  createReceipt(
    'rec-2026-05-02',
    'Adani Electricity Mumbai Ltd',
    'ELEC-MAY-2026',
    '2026-05-02',
    [
      {
        desc: 'Commercial Retail Power Consumption Units - Bandra Store',
        productName: 'Commercial Electricity Charges',
        spec: 'Commercial LT-II Tariff Bandra West Store',
        qty: 1,
        unit: 'bill',
        unitPricePaise: 1050000,
        category: 'Utilities & Facilities',
      },
    ],
    0,
    0,
    0
  ),
  createReceipt(
    'rec-2026-05-03',
    'Deshmukh Kraft Mills',
    'DKM-6499',
    '2026-05-20',
    [
      {
        desc: 'Kraft Paper Carry Bags Medium 12x10 Twisted Handle',
        productName: 'Kraft Paper Carry Bags (Medium)',
        canonicalId: 'prod-kraft-bags',
        spec: '12x10 inch 120 GSM twisted handle kraft paper bag',
        qty: 1000,
        unit: 'bag',
        unitPricePaise: 720,
        category: 'Packaging',
      },
    ],
    36000,
    0,
    0
  ),
  createReceipt(
    'rec-2026-05-04',
    'PackTech Solutions Pvt Ltd',
    'PTS-26-7120',
    '2026-05-26',
    [
      {
        desc: '3-Ply Brown Corrugated Kraft Boxes 10x8x6 inch',
        productName: 'Packaging Boxes (3-Ply Kraft 10x8x6)',
        canonicalId: 'prod-box-3ply',
        spec: '10x8x6 inch 3-ply brown corrugated kraft box',
        qty: 400,
        unit: 'box',
        unitPricePaise: 1200,
        category: 'Packaging',
      },
    ],
    24000,
    0,
    0
  ),
];
