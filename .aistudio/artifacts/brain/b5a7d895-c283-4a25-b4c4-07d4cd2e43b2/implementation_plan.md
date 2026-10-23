# Modern Ledger Dashboard UI Refinement

An incremental, non-destructive UI refinement aligning the Pricewise homepage with the **Modern Ledger** design system. This establishes a clear product hierarchy: autonomous purchase ledger and spending overview first, potential savings opportunities second, operational invoice processing statuses third, and recent transaction history fourth.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1 interactive clarification:
> - **Header Action**: Keep the prominent Scan Bill button on the mobile footer / navigation rather than adding a redundant header button.
> - **Needs Review Interaction**: Clicking the "Needs Review" card will direct users to the Purchase Ledger (`/ledger`) filtered directly to pending review records.
> - **Content Hierarchy**: Streamline the homepage to focus exclusively on the 4 primary cards and Recent Purchases, eliminating redundant insights cards to provide an uncluttered, high-readability overview for business owners.
> - **Bilingual Preservation**: Maintain complete English and Professional Business Hinglish translations across all new and updated labels, statuses, and metric cards.

---

### 1. Overview & Core Concept

- **What It Does**: Refines `src/views/HomeView.tsx` into a modern, approachable ledger dashboard for shopkeepers and business owners. It organizes financial data into an unambiguous visual sequence:
  1. **Dashboard Header**: "Business overview" — "Your purchases, records and savings opportunities."
  2. **Card 1 (Full Width Hero)**: Deep forest-green (`#216747`) "Total purchases this month" with large currency figure (`₹`, `tabular-nums`), purchase counts, and direct ledger link.
  3. **Card 2 (Full Width Prominent)**: Pale-green (`#EAF4ED`) "Possible savings" directly beneath Card 1, clearly framed as an estimated comparison opportunity.
  4. **Cards 3 & 4 (Side-by-Side Operational)**: "Bills recorded" (crisp white with green badge) and "Needs review" (soft amber `#FFF3D8` with `#754A0A` text, clickable to review queue).
  5. **Section (Full Width)**: "Recent Purchases" ledger preview table with supplier, date, item summary, status, right-aligned amount, and "View all" ledger link.
- **Target Persona**: Kirana store owners, regional retail managers, and small business operators who need reliable purchase records without technical complexity or artificial accounting jargon.
- **Key Value**: Immediately grounds the business owner in their actual month-to-date spending and record health before presenting savings comparisons.

---

### 2. User Experience & Visual Design

- **Color Palette Allocation (Modern Ledger System)**:
  - `Primary Forest Green` (`#216747`): Hero card background, primary actions, confirmed status badges, active links.
  - `Pale Green` (`#EAF4ED`): Possible Savings card background, successful ledger metric highlights.
  - `Canvas Background` (`#F5F7F6`): Clean page field.
  - `Card Background` (`#FFFFFF`): Operational cards and recent purchase ledger table.
  - `Primary Text` (`#202B27`): Deep, high-contrast text for headers and currency figures.
  - `Secondary Text` (`#65736C`): Calm descriptive text, units, and timestamps.
  - `Attention Background & Text` (`#FFF3D8`, `#754A0A`): "Needs review" warning card and pending review status pills.
- **Typography & Scale**:
  - Main Page Heading: 26–28px font-bold (`text-2xl sm:text-3xl`).
  - Hero Spending Figure: 32–36px font-bold with `font-mono tabular-nums`.
  - Savings Figure: 30–34px font-bold with `font-mono tabular-nums`.
  - Secondary KPI Values: 26–30px font-bold.
  - Table & Transaction Rows: 14–16px clean legible type.
- **Responsive Layout Composition**:
  - **Desktop (1024px+)**:
    - Card 1: Full-width deep forest-green hero card (`rounded-2xl p-6 sm:p-7`).
    - Card 2: Full-width pale-green card (`rounded-2xl p-5 sm:p-6`) directly below Card 1.
    - Cards 3 & 4: 2-column grid (`grid-cols-2 gap-4 sm:gap-5`) for Bills Recorded and Needs Review.
    - Section: Full-width white card (`rounded-2xl p-6`) for Recent Purchases with right-aligned totals.
  - **Mobile (<768px)**:
    - Vertical single-column stack maintaining exact priority order.
    - Minimum 44px tap targets for buttons and row links.
    - Zero horizontal overflow.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Proximity of Card 1 and Card 2**
  - *Chosen Approach*: Place Possible Savings immediately beneath Total Purchases This Month.
  - *Why*: Satisfies the explicit requirement that savings is the key secondary differentiator, while preserving spending as the primary anchor.
  - *Alternatives Considered*: Placing savings in a right-hand sidebar or split grid, rejected because it dilutes the primary ledger hierarchy.
- **Decision 2: Framing Estimated Savings vs Realized Savings**
  - *Chosen Approach*: Explicit label "Possible savings" and supporting copy "Estimated opportunity from price comparisons" without fabricated claims.
  - *Why*: Respects business trust; business owners must know this is a potential opportunity based on regional wholesale benchmarks, not money already captured.
- **Decision 3: Needs Review Routing & Filtering**
  - *Chosen Approach*: Make the Needs Review card an interactive button navigating to `/ledger?status=pending_review`, with `LedgerView` honoring the status filter.
  - *Why*: Directly connects the status indicator to the existing reconciliation workflow so store owners can resolve highlighted items with 1 click.
- **Decision 4: Bilingual Parity**
  - *Chosen Approach*: Map all new headers, supporting labels, and button actions through `translations.ts` and `useLanguage()`.
  - *Why*: Seamlessly maintains the user-approved English and Professional Business Hinglish switch across all cards.

---

### 4. Technical Architecture & Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Top Navigation Bar                       │
│  [ Brand Logo ]  ──  [ Navigation Tabs ]  ──  [ EN | हिं ]  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      HomeView Dashboard                     │
│                                                             │
│  [ Page Header: "Business overview" & Subtitle ]            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Card 1: Total Purchases This Month (Deep Forest Green)│  │
│  │ Main Figure: ₹X,XX,XXX · Invoices Count · Ledger Link │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Card 2: Possible Savings (Pale Green #EAF4ED)         │  │
│  │ Main Figure: ₹XX,XXX · Benchmark Context · Save More  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────┬───────────────────────────┐  │
│  │ Card 3: Bills Recorded    │ Card 4: Needs Review      │  │
│  │ Count: X bills saved      │ Count: Y check details    │  │
│  │ White Card / Green Icon   │ Soft Amber #FFF3D8 Card   │  │
│  └───────────────────────────┴───────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Section: Recent Purchases (Full Width White Card)     │  │
│  │ Item · Supplier · Date · Status · Amount · View All   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

- **Data Flow & Calculation Mapping**:
  - `summary.currentMonthSpendingMinor`: Actual month-to-date spending derived from `calculateSpendingSummary(receipts, opportunities)`.
  - `summary.potentialDifferenceMinor`: Potential savings opportunity from verified benchmark medians.
  - `recordedCount`: `receipts.filter(r => r.status === 'confirmed').length` (or total recorded receipts).
  - `needsReviewCount`: `receipts.filter(r => r.status === 'pending_review' || r.reviewStatus === 'needs_review').length`.
  - `recentReceipts`: Latest 5 invoices from real application state.
- **Files Modified In-Place**:
  - `src/views/HomeView.tsx`: Refactored to implement the 4-card sequence, refined color tokens, and Recent Purchases section.
  - `src/views/LedgerView.tsx`: Enhanced to support direct URL status filtering (`?status=pending_review`) from Card 4.
  - `src/i18n/translations.ts`: Added bilingual keys for "Business overview", "Bills recorded", "Needs review", "Check details", and supporting text.
