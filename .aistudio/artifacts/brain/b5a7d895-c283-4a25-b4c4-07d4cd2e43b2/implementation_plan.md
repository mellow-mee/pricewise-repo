# English / Hinglish Bilingual Intelligence for Pricewise

A seamless top-right language toggle enabling Indian business owners and retail operators to switch between English and Professional Business Hinglish (Kharcha, Bachat, Dukaan Khata, Invoices, Thok Bhaav) across the entire platform, including live navigation, expense ledger, collective benchmark comparisons, and grounded AI assistant responses.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1 interactive clarification:
> - **Scope**: Comprehensive translation covering all UI labels, navigation, collective benchmarks, metrics, and AI assistant responses.
> - **Tone & Vocabulary**: Professional business Hinglish (e.g., *Kharcha*, *Bachat*, *Dukaan Khata*, *Billein*, *Thok Bhaav*, *Viparan*), maintaining natural clarity without colloquial slang or unreadable pure Sanskritized Hindi.
> - **Persistence**: Persisted in `localStorage` under `pricewise_lang` so user preference remains active across browser reloads and navigation.

---

### 1. Overview & Core Concept

- **What It Does**: Adds an English / Hinglish segmented switch in the top-right header. Toggling immediately switches all user-facing interfaces, ledger column headers, benchmark states, filter bars, summary cards, and assistant chat interactions into natural commercial Hinglish or English without requiring page reloads.
- **Target Audience**: Kirana store owners, regional retail managers, FMCG distributor operators, and cafe proprietors across India who operate day-to-day business accounting and purchasing negotiations in conversational business Hinglish.
- **Key Value**: Reduces cognitive friction and makes collective price benchmarks and purchasing insights instantly relatable, clear, and actionable in the familiar vocabulary of Indian commerce.

---

### 2. User Experience & Visual Design

- **Top Bar Contract Compliance**:
  - The header adheres to the strict 1-row, 3-zone contract:
    - **Zone 1 (Left)**: Brand wordmark (`Pricewise`) with clean icon.
    - **Zone 2 (Center)**: Primary horizontal navigation tabs (Home, Scan, Ledger, Save More, Ask) with single-line typography.
    - **Zone 3 (Right)**: Language Segmented Control (`English | Hinglish`) positioned cleanly alongside the business profile chip and demo reset action.
- **Segmented Control Aesthetic**:
  - Styled with high-contrast, zero-pill discipline: a subtle recessed background (`bg-[#F7F8F5] border border-[#E2E7E2] p-0.5 rounded-lg`) housing two crisp flat buttons (`px-2.5 py-1 text-xs font-medium rounded-md`). Active state uses elevated white background (`bg-[#FFFFFF] text-[#25382D] shadow-xs font-semibold`), while inactive state provides subtle muted contrast (`text-[#64756A] hover:text-[#25382D]`).
- **Bilingual Phrasing & Terminology**:
  - *Home*: Home / *Dukaan Home* (or *Dashboard*)
  - *Total Spend*: Total Spend / *Kul Kharcha*
  - *This Month*: This Month Spend / *Is Mahine Ka Kharcha*
  - *Identified Savings*: Potential Savings / *Sambhavit Bachat*
  - *Active Invoices*: Active Invoices / *Kul Billein*
  - *Ledger*: Expense Ledger / *Kharcha Khata*
  - *Save More*: Save More / *Bachat Benchmarks*
  - *Scan*: Scan Receipt / *Bill Scan Karein*
  - *Ask*: Purchasing Assistant / *Pricewise Sahayak*
  - *Competitive Price*: Market Competitive / *Bazaar ke Barabar*
  - *Price Difference*: Overpaying / *Zyada Lagat*
- **Tabular & Numerals**: Currency formatting remains standardized in Indian Rupees (`₹`, `tabular-nums`) across both languages with comma formatting (Lakhs/Crores standard).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: React Context Provider vs. URL Routing for Language**
  - *Chosen Approach*: React `LanguageContext` with `localStorage` persistence.
  - *Why*: Instantaneous zero-latency transition across all open tabs, modals, and charts without reloading or altering URL routes.
  - *Alternatives Considered*: Sub-path routing (`/en/...` and `/hi/...`), rejected because it introduces unnecessary history stack mutations for a simple language preference.
- **Decision 2: Translation Engine vs. Static Typed Dictionary**
  - *Chosen Approach*: High-performance typed dictionary lookup (`src/i18n/translations.ts`) combined with prompt conditioning for Gemini assistant responses.
  - *Why*: Ensures 100% predictable, authentic commercial vocabulary without translation latency or network dependencies, while allowing Gemini 3.8 Flash to generate contextual Hinglish for assistant queries.
- **Decision 3: Backend AI Assistant Language Awareness**
  - *Chosen Approach*: Pass `language: 'en' | 'hi'` in the `/api/assistant/chat` request body. The Gemini system prompt instructs the assistant to answer directly in professional business Hinglish when `hi` is active.
  - *Why*: Provides end-to-end consistency so asking questions in Hinglish mode yields fluent, natural Hinglish advice citing exact numbers.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Top Navigation Bar                       │
│  [ Brand Logo ]  ──  [ Navigation Tabs ]  ──  [ EN | हिं ]  │
└──────────────────────────────┬──────────────────────────────┘
                               │ LanguageContext
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   App-Wide Translation                      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   HomeView   │  │  LedgerView  │  │   SaveMoreView    │  │
│  │ (Kul Kharcha)│  │ (Dukaan Bill)│  │ (Bachat Medians)  │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌─────────────────────────────────────┐  │
│  │   ScanView   │  │              AskView                │  │
│  │ (Bill Upload)│  │   POST /api/assistant/chat          │  │
│  └──────────────┘  │   { message, language: 'hi' }       │  │
│                    └──────────────────┬──────────────────┘  │
└───────────────────────────────────────┼─────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────┐
│             Express Backend (/api/assistant/chat)           │
│                                                             │
│   Gemini 3.8 Flash Prompt:                                  │
│   "Respond in professional business Hinglish (Kharcha,      │
│   Bachat, Thok Bhaav, Invoices) using verified INR data"    │
└─────────────────────────────────────────────────────────────┘
```

- **State Management**:
  - `LanguageContext`: Provides `{ language: 'en' | 'hi', setLanguage, t }` to the entire component tree.
  - Initial state reads `localStorage.getItem('pricewise_lang') || 'en'`.
- **Component Modifications**:
  - `Navbar.tsx`: Embeds the segmented `English | Hinglish` switch in the right actions container.
  - `BottomNav.tsx`: Displays localized labels for mobile navigation tabs.
  - `HomeView.tsx`, `LedgerView.tsx`, `SaveMoreView.tsx`, `ScanView.tsx`, `AskView.tsx`: Integrate the `useLanguage()` hook to dynamically render localized titles, buttons, helper text, and table headers.
  - `MonthlySpreadsheet.tsx` & `YearlyExpenditureGraph.tsx`: Fully localized table headers, controls, tooltips, and category cards.
  - `server/ai.ts`: Extends `answerPurchasingQuestion(prompt, language)` to support Hinglish persona prompting and deterministic Hinglish fallbacks.

---

### 5. Implementation Status: Complete ✅

- **Bilingual Dictionary (`src/i18n/translations.ts`)**: Built with comprehensive coverage for navigation, metrics, ledger columns, filters, status indicators, and category translations.
- **Persistent State (`src/context/LanguageContext.tsx`)**: Reactive `LanguageProvider` with `localStorage` persistence under key `pricewise_lang`.
- **Top-Right Header Segmented Toggle (`src/components/Navbar.tsx`)**: High-contrast, clean segmented switch (`English | Hinglish`) integrated into the right action zone adhering to zero-pill discipline.
- **Mobile Navigation (`src/components/BottomNav.tsx`)**: Fully localized tabs (`Dukaan Home`, `Kharcha Khata`, `Bill Scan`, `Bachat Benchmarks`, `Pricewise Sahayak`).
- **All App Views Localized**:
  - `HomeView`: Greetings, time-of-day phrases, main spend cards, market benchmarks, priority alerts, recent transactions.
  - `LedgerView`: Filters, search placeholders, supplier and category selectors, desktop/mobile receipt tables, status badges.
  - `ScanView`: Step 1 (drag-drop, mobile camera, quick test bills), Step 2 (item extraction table, review badges, reconciliation note, add-to-stock button), Step 3 (stock update confirmation and ledger navigation).
  - `SaveMoreView`: Collective benchmark metrics, privacy consent toggle, peer evidence, difference per unit, and methodology modal.
  - `AskView`: Chat starters, greeting banner, query input placeholder, and server integration passing active language to the AI assistant.
  - `MonthlySpreadsheet` & `YearlyExpenditureGraph`: Date pickers, monthly summary strips, table headers, total rows, and hover tooltips.
- **Backend AI Engine (`server/ai.ts` & `server.ts`)**: Accepts `language` parameter; generates natural, grounded business Hinglish responses citing exact rupee figures and store records.
- **Verification**: `compile_applet` passed and `lint_applet` completed with 0 errors. Dev server running on port 3000.
