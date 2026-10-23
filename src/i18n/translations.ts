/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'hi';

export interface Translations {
  // Navigation
  nav_home: string;
  nav_scan: string;
  nav_ledger: string;
  nav_save_more: string;
  nav_ask: string;
  reset_demo: string;
  resetting: string;
  demo_badge: string;
  live_badge: string;

  // Home View
  home_welcome_title: string;
  home_welcome_subtitle: string;
  home_kpi_total_spend: string;
  home_kpi_monthly_spend: string;
  home_kpi_savings_opps: string;
  home_kpi_active_invoices: string;
  home_spend_trend_title: string;
  home_spend_trend_subtitle: string;
  home_category_breakdown_title: string;
  home_top_suppliers_title: string;
  home_recent_invoices_title: string;
  home_view_all_ledger: string;
  home_upload_invoice_cta: string;
  home_savings_banner_title: string;
  home_savings_banner_desc: string;
  home_savings_banner_cta: string;
  home_vs_last_month: string;

  // Scan View
  scan_title: string;
  scan_subtitle: string;
  scan_drop_zone_title: string;
  scan_drop_zone_desc: string;
  scan_sample_invoices_label: string;
  scan_sample_packaging: string;
  scan_sample_inventory: string;
  scan_sample_facilities: string;
  scan_processing_title: string;
  scan_processing_step_1: string;
  scan_processing_step_2: string;
  scan_processing_step_3: string;
  scan_review_title: string;
  scan_review_subtitle: string;
  scan_field_merchant: string;
  scan_field_invoice_num: string;
  scan_field_date: string;
  scan_field_payment_method: string;
  scan_col_item: string;
  scan_col_category: string;
  scan_col_qty: string;
  scan_col_unit_price: string;
  scan_col_total: string;
  scan_subtotal: string;
  scan_tax_gst: string;
  scan_extra_charges: string;
  scan_discount: string;
  scan_final_total: string;
  scan_save_confirm_btn: string;
  scan_saving_btn: string;
  scan_discard_btn: string;

  // Ledger View
  ledger_title: string;
  ledger_subtitle: string;
  ledger_search_placeholder: string;
  ledger_filter_all_categories: string;
  ledger_filter_all_suppliers: string;
  ledger_col_date: string;
  ledger_col_invoice: string;
  ledger_col_merchant: string;
  ledger_col_category: string;
  ledger_col_items: string;
  ledger_col_total: string;
  ledger_col_status: string;
  ledger_col_actions: string;
  ledger_empty_title: string;
  ledger_empty_desc: string;
  ledger_view_details: string;
  ledger_delete_confirm: string;
  ledger_download_csv: string;
  ledger_status_confirmed: string;
  ledger_status_draft: string;
  ledger_items_count: string;

  // Save More (Benchmarks) View
  benchmarks_title: string;
  benchmarks_subtitle: string;
  benchmarks_consent_banner_title: string;
  benchmarks_consent_banner_desc: string;
  benchmarks_consent_opt_in: string;
  benchmarks_consent_opt_out: string;
  benchmarks_potential_savings_card: string;
  benchmarks_categories_analyzed: string;
  benchmarks_peer_businesses: string;
  benchmarks_state_opportunity: string;
  benchmarks_state_competitive: string;
  benchmarks_state_insufficient: string;
  benchmarks_your_price: string;
  benchmarks_market_median: string;
  benchmarks_diff_per_unit: string;
  benchmarks_typical_volume: string;
  benchmarks_est_savings: string;
  benchmarks_peers_count: string;
  benchmarks_suggested_action: string;
  benchmarks_request_quote: string;

  // Ask View
  ask_title: string;
  ask_subtitle: string;
  ask_greeting_prefix: string;
  ask_greeting_body: string;
  ask_placeholder: string;
  ask_send_btn: string;
  ask_thinking: string;
  ask_starters_title: string;
  ask_starter_1: string;
  ask_starter_2: string;
  ask_starter_3: string;
  ask_starter_4: string;
  ask_metrics_spend: string;
  ask_metrics_savings: string;
  ask_metrics_top_cat: string;
  ask_follow_ups_title: string;

  // Common & Categories
  cat_packaging: string;
  cat_inventory: string;
  cat_cleaning: string;
  cat_supplies: string;
  cat_utilities: string;
  cat_equipment: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    nav_home: 'Home',
    nav_scan: 'Scan',
    nav_ledger: 'Ledger',
    nav_save_more: 'Save More',
    nav_ask: 'Ask',
    reset_demo: 'Reset Demo',
    resetting: 'Resetting...',
    demo_badge: 'Demo (INR)',
    live_badge: 'Live',

    // Home View
    home_welcome_title: 'Purchasing Intelligence Overview',
    home_welcome_subtitle: 'Verified ledger records, cost trends, and regional purchasing benchmarks for',
    home_kpi_total_spend: 'Total Recorded Spend',
    home_kpi_monthly_spend: 'This Month Spend (Oct 2026)',
    home_kpi_savings_opps: 'Identified Savings Opps',
    home_kpi_active_invoices: 'Active Ledger Invoices',
    home_spend_trend_title: 'Monthly Expenditure Trend',
    home_spend_trend_subtitle: 'Consolidated invoice spend over the last 6 months',
    home_category_breakdown_title: 'Spend by Category',
    home_top_suppliers_title: 'Top Suppliers by Value',
    home_recent_invoices_title: 'Recent Verified Invoices',
    home_view_all_ledger: 'View Full Ledger',
    home_upload_invoice_cta: 'Scan New Invoice',
    home_savings_banner_title: 'Cost Improvement Opportunities Identified',
    home_savings_banner_desc: 'Your recorded prices on key packaging items are above the regional median across verified peer businesses.',
    home_savings_banner_cta: 'Review Benchmarks',
    home_vs_last_month: 'vs previous month',

    // Scan View
    scan_title: 'Upload & Extract Invoices',
    scan_subtitle: 'Scan receipt photos or PDF invoices to extract itemized lines, taxes, and unit prices automatically.',
    scan_drop_zone_title: 'Drag & drop invoice here, or browse file',
    scan_drop_zone_desc: 'Supports high-res PNG, JPG, or invoice camera captures up to 25MB',
    scan_sample_invoices_label: 'Or test instantly with verified sample invoices:',
    scan_sample_packaging: 'Packaging & Cartons Bill (₹12,075)',
    scan_sample_inventory: 'Organic Spices & Tea Bill (₹32,450)',
    scan_sample_facilities: 'Cleaning & Supplies Bill (₹4,890)',
    scan_processing_title: 'Extracting Invoice Intelligence...',
    scan_processing_step_1: 'Optimizing image clarity and running OCR model...',
    scan_processing_step_2: 'Extracting merchant details, date, GSTIN, and line items...',
    scan_processing_step_3: 'Verifying unit prices and calculating mathematical ledger totals...',
    scan_review_title: 'Review & Confirm Invoice',
    scan_review_subtitle: 'Verify the extracted vendor details, line items, and unit prices before posting to your ledger.',
    scan_field_merchant: 'Merchant / Vendor Name',
    scan_field_invoice_num: 'Invoice Number',
    scan_field_date: 'Transaction Date',
    scan_field_payment_method: 'Payment Method',
    scan_col_item: 'Line Item & Description',
    scan_col_category: 'Category',
    scan_col_qty: 'Qty',
    scan_col_unit_price: 'Unit Price',
    scan_col_total: 'Total',
    scan_subtotal: 'Items Subtotal',
    scan_tax_gst: 'Taxes (GST)',
    scan_extra_charges: 'Delivery / Extra Charges',
    scan_discount: 'Applied Discount',
    scan_final_total: 'Invoice Grand Total',
    scan_save_confirm_btn: 'Confirm & Post to Ledger',
    scan_saving_btn: 'Posting to Ledger...',
    scan_discard_btn: 'Discard & Scan Another',

    // Ledger View
    ledger_title: 'Expense Ledger',
    ledger_subtitle: 'Itemized repository of all confirmed business purchasing invoices, line items, and supplier receipts.',
    ledger_search_placeholder: 'Search invoices, merchants, or line items...',
    ledger_filter_all_categories: 'All Categories',
    ledger_filter_all_suppliers: 'All Suppliers',
    ledger_col_date: 'Date',
    ledger_col_invoice: 'Invoice #',
    ledger_col_merchant: 'Merchant / Supplier',
    ledger_col_category: 'Category',
    ledger_col_items: 'Items',
    ledger_col_total: 'Total Amount',
    ledger_col_status: 'Status',
    ledger_col_actions: 'Actions',
    ledger_empty_title: 'No invoices found matching your filters',
    ledger_empty_desc: 'Try adjusting your search query, selecting another category, or scanning a new invoice.',
    ledger_view_details: 'View Details',
    ledger_delete_confirm: 'Delete this transaction record from the ledger?',
    ledger_download_csv: 'Export CSV',
    ledger_status_confirmed: 'Confirmed',
    ledger_status_draft: 'Pending Draft',
    ledger_items_count: 'items',

    // Save More (Benchmarks) View
    benchmarks_title: 'Collective Price Benchmarks',
    benchmarks_subtitle: 'Independent price comparisons across regional retail peers to protect your purchasing margins.',
    benchmarks_consent_banner_title: 'Collective Purchasing Network Active',
    benchmarks_consent_banner_desc: 'You are sharing anonymized unit prices to unlock regional median benchmarks across independent businesses.',
    benchmarks_consent_opt_in: 'Opt into Collective Network',
    benchmarks_consent_opt_out: 'Pause Contribution',
    benchmarks_potential_savings_card: 'Identified Cost Improvement',
    benchmarks_categories_analyzed: 'Analyzed Products',
    benchmarks_peer_businesses: 'Regional Peer Businesses',
    benchmarks_state_opportunity: 'Savings Opportunity',
    benchmarks_state_competitive: 'Already Competitive',
    benchmarks_state_insufficient: 'Insufficient Peer Data',
    benchmarks_your_price: 'Your Last Recorded Price',
    benchmarks_market_median: 'Regional Median Price',
    benchmarks_diff_per_unit: 'Price Difference / Unit',
    benchmarks_typical_volume: 'Typical Order Volume',
    benchmarks_est_savings: 'Estimated Potential Savings',
    benchmarks_peers_count: 'Independent Businesses Reporting',
    benchmarks_suggested_action: 'Recommended Action',
    benchmarks_request_quote: 'Prepare Price Match Note',

    // Ask View
    ask_title: 'Purchasing Intelligence Assistant',
    ask_subtitle: 'Grounded business financial assistant backed by your verified invoices and regional peer medians.',
    ask_greeting_prefix: 'Hello',
    ask_greeting_body: 'I am your Pricewise Purchasing Assistant. I have verified access to your full invoice ledger and peer benchmarks. Ask me anything regarding suppliers, categories, or price competitiveness.',
    ask_placeholder: 'Ask about your spend, supplier prices, or packaging savings...',
    ask_send_btn: 'Send',
    ask_thinking: 'Pricewise is analyzing your ledger...',
    ask_starters_title: 'Suggested Business Inquiries',
    ask_starter_1: 'How much did I spend this month?',
    ask_starter_2: 'Which suppliers received the most money?',
    ask_starter_3: 'Am I paying a competitive price for packaging?',
    ask_starter_4: 'Where can I realistically reduce purchasing costs?',
    ask_metrics_spend: 'Current Month Spend',
    ask_metrics_savings: 'Identified Savings',
    ask_metrics_top_cat: 'Top Category',
    ask_follow_ups_title: 'Recommended Follow-up Questions',

    // Common & Categories
    cat_packaging: 'Packaging',
    cat_inventory: 'Inventory & Food',
    cat_cleaning: 'Cleaning & Hygiene',
    cat_supplies: 'Store Supplies',
    cat_utilities: 'Utilities & Facilities',
    cat_equipment: 'Equipment',
  },
  hi: {
    // Navigation (Hinglish: Kharcha, Bachat, Dukaan Khata, Invoices)
    nav_home: 'Dukaan Home',
    nav_scan: 'Bill Scan',
    nav_ledger: 'Kharcha Khata',
    nav_save_more: 'Bachat Benchmarks',
    nav_ask: 'Pricewise Sahayak',
    reset_demo: 'Demo Reset Karein',
    resetting: 'Reset ho raha hai...',
    demo_badge: 'Demo Khata (₹)',
    live_badge: 'Live Khata',

    // Home View
    home_welcome_title: 'Vyaparik Kharcha aur Bachat Dashboard',
    home_welcome_subtitle: 'Aapki dukaan ka verified khata, kharche ke trends aur regional thok bhaav benchmarks:',
    home_kpi_total_spend: 'Kul Darj Kharcha (Total Spend)',
    home_kpi_monthly_spend: 'Is Mahine Ka Kharcha (Oct 2026)',
    home_kpi_savings_opps: 'Sambhavit Bachat (Savings Opps)',
    home_kpi_active_invoices: 'Kul Verified Billein',
    home_spend_trend_title: 'Mahinewaar Kharche Ka Trend',
    home_spend_trend_subtitle: 'Pichhle 6 mahino ke verified bill payments ka pura hisaab-kitab',
    home_category_breakdown_title: 'Category ke Anusaar Kharcha',
    home_top_suppliers_title: 'Sabse Badi Supply Companies (Vendors)',
    home_recent_invoices_title: 'Haal hi ke Verified Bills',
    home_view_all_ledger: 'Pura Khata Dekhein',
    home_upload_invoice_cta: 'Naya Bill Scan Karein',
    home_savings_banner_title: 'Kharche mein Bachat ka Mauka Mila Hai',
    home_savings_banner_desc: 'Packaging aur carry bags ke unit price mein aap regional bazaar ke median bhaav se zyada chuka rahe hain.',
    home_savings_banner_cta: 'Bachat Bhaav Dekhein',
    home_vs_last_month: 'pichhle mahine ke mukable',

    // Scan View
    scan_title: 'Bill & Invoice Scan Karein',
    scan_subtitle: 'Apne supplier ke bill ki photo ya PDF upload karein — saari items, unit price aur GST automatic nikal jayega.',
    scan_drop_zone_title: 'Bill yahan drag karein ya browse karke select karein',
    scan_drop_zone_desc: 'High-res photo, phone camera capture ya PDF (25MB tak) support karta hai',
    scan_sample_invoices_label: 'Ya turant test karne ke liye sample bill select karein:',
    scan_sample_packaging: 'Packaging Boxes & Tape Bill (₹12,075)',
    scan_sample_inventory: 'Chai & Organic Masala Bill (₹32,450)',
    scan_sample_facilities: 'Cleaning & Floor Supplies Bill (₹4,890)',
    scan_processing_title: 'Bill ka Data Extract ho raha hai...',
    scan_processing_step_1: 'Image clarity check aur high-precision OCR shuru...',
    scan_processing_step_2: 'Supplier naam, bill number, GST aur line items identify ho rahe hain...',
    scan_processing_step_3: 'Unit price aur kul jod ka hisaab calculate ho raha hai...',
    scan_review_title: 'Bill Check aur Confirm Karein',
    scan_review_subtitle: 'Khate mein add karne se pehle vendor details, saman ki quantity aur rate verify kar lein.',
    scan_field_merchant: 'Supplier / Dukaan ka Naam',
    scan_field_invoice_num: 'Invoice / Bill Number',
    scan_field_date: 'Bill ki Taareekh',
    scan_field_payment_method: 'Payment ka Tareeka',
    scan_col_item: 'Saman ka Naam & Specification',
    scan_col_category: 'Category',
    scan_col_qty: 'Quantity',
    scan_col_unit_price: 'Unit Rate (₹)',
    scan_col_total: 'Kul Rakam (₹)',
    scan_subtotal: 'Items ka Subtotal',
    scan_tax_gst: 'Tax / GST Rakam',
    scan_extra_charges: 'Delivery / Extra Charges',
    scan_discount: 'Diya gaya Discount',
    scan_final_total: 'Bill ka Grand Total',
    scan_save_confirm_btn: 'Confirm karke Khata mein Jodein',
    scan_saving_btn: 'Khate mein save ho raha hai...',
    scan_discard_btn: 'Hata dein aur Doosra Scan Karein',

    // Ledger View
    ledger_title: 'Dukaan Kharcha Khata',
    ledger_subtitle: 'Aapki dukaan ke saare confirmed bills, item-wise rate aur vendor payments ka digital khata.',
    ledger_search_placeholder: 'Bill number, supplier ya item ka naam search karein...',
    ledger_filter_all_categories: 'Sabhi Categories',
    ledger_filter_all_suppliers: 'Sabhi Suppliers',
    ledger_col_date: 'Taareekh',
    ledger_col_invoice: 'Bill #',
    ledger_col_merchant: 'Supplier / Vendor',
    ledger_col_category: 'Category',
    ledger_col_items: 'Saman Count',
    ledger_col_total: 'Kul Kharcha (₹)',
    ledger_col_status: 'Status',
    ledger_col_actions: 'Actions',
    ledger_empty_title: 'Koi bill match nahi hua',
    ledger_empty_desc: 'Search query badal kar dekhein ya filter hatakar naye bills check karein.',
    ledger_view_details: 'Pura Bill Dekhein',
    ledger_delete_confirm: 'Kya aap is bill ko khate se delete karna chahte hain?',
    ledger_download_csv: 'CSV Download Karein',
    ledger_status_confirmed: 'Verified Bill',
    ledger_status_draft: 'Draft Bill',
    ledger_items_count: 'items',

    // Save More (Benchmarks) View
    benchmarks_title: 'Collective Thok Bhaav & Bachat',
    benchmarks_subtitle: 'Aas-paas ke verified retail dukaandaron ke mukable aapke rates ka comparison.',
    benchmarks_consent_banner_title: 'Collective Purchasing Network Chalu Hai',
    benchmarks_consent_banner_desc: 'Aap anonymized rates share karke regional median thok bhaav aur bachat intelligence dekh rahe hain.',
    benchmarks_consent_opt_in: 'Network mein Shamil Hon',
    benchmarks_consent_opt_out: 'Data Sharing Rokein',
    benchmarks_potential_savings_card: 'Sambhavit Bachat ka Anumaan',
    benchmarks_categories_analyzed: 'Analyzed Products',
    benchmarks_peer_businesses: 'Regional Dukaan Net',
    benchmarks_state_opportunity: 'Bachat ka Mauka',
    benchmarks_state_competitive: 'Bazaar ke Barabar Rate',
    benchmarks_state_insufficient: 'Peer Data Kam Hai',
    benchmarks_your_price: 'Aapka Kharida Hua Rate',
    benchmarks_market_median: 'Regional Median Thok Bhaav',
    benchmarks_diff_per_unit: 'Per Unit Rate mein Farak',
    benchmarks_typical_volume: 'Aapka Order Volume',
    benchmarks_est_savings: 'Sambhavit Kul Bachat',
    benchmarks_peers_count: 'Dukaandaron ka Data',
    benchmarks_suggested_action: 'Sujhav aur Action Plan',
    benchmarks_request_quote: 'Price Match Note Banayein',

    // Ask View
    ask_title: 'Pricewise Vyapar Sahayak',
    ask_subtitle: 'Aapke verified bills aur bazaar ke rates par aadharit grounded financial assistant.',
    ask_greeting_prefix: 'Namaste',
    ask_greeting_body: 'Main aapka Pricewise Vyapar Sahayak hoon. Mere paas aapke pichhle 6 mahine ke saare bills aur regional thok bhaav ka data hai. Kharche, suppliers ya bachat ke bare mein kuch bhi poochhein.',
    ask_placeholder: 'Kharche, supplier rates ya packaging bachat ke baare mein poochhein...',
    ask_send_btn: 'Poochhein',
    ask_thinking: 'Sahayak aapke khate ka hisaab calculate kar raha hai...',
    ask_starters_title: 'Aksar Poochhe Jaane Wale Sawal',
    ask_starter_1: 'Is mahine mera kul kharcha kitna raha?',
    ask_starter_2: 'Sabse zyada payment kis supplier ko gayi hai?',
    ask_starter_3: 'Kya packaging boxes ka rate bazaar ke barabar hai?',
    ask_starter_4: 'Kharche mein turant bachat kahan ho sakti hai?',
    ask_metrics_spend: 'Is Mahine Ka Kharcha',
    ask_metrics_savings: 'Sambhavit Bachat',
    ask_metrics_top_cat: 'Top Category',
    ask_follow_ups_title: 'Aage ke Sujhav Sawal',

    // Common & Categories
    cat_packaging: 'Packaging Saman',
    cat_inventory: 'Inventory & Khana Peena',
    cat_cleaning: 'Safai & Hygiene',
    cat_supplies: 'Dukaan Supplies',
    cat_utilities: 'Bijli & Dukaan Facilities',
    cat_equipment: 'Machinery & Equipment',
  },
};
