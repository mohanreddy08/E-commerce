# Enterprise Analytics Portal - CSC India Internship Track
## Design and Implementation of an E-Commerce Sales and Customer Insights Dashboard

A production-grade, self-contained, responsive single-page web application (SPA) built with React, Vite, Tailwind CSS, Lucide Icons, and Recharts.

---

### Key Capabilities & Highlights

1. **Executive KPI Engine (with Prior-Period MoM Benchmarks)**:
   - **Total Revenue**: Dynamic gross sales with Month-over-Month (MoM) growth indicator.
   - **Total Profit**: Net operational gain/loss badge.
   - **Profit Margin (%)**: Evaluated safely against a 15% corporate benchmark.
   - **Total Orders & Units Sold**: Volume tracking with MoM trends.
   - **Average Order Value (AOV)**: Basket size yield per customer checkout.
   - **Average Fulfillment Latency**: Days elapsed between order timestamp and carrier dispatch.

2. **Interactive Visualizations**:
   - **Sales & Revenue Seasonality**: Dual-axis composed chart (monthly & quarterly aggregation modes) contrasting sales bars with net profit trajectory curves.
   - **Top & Bottom Performing Sub-Categories**: Horizontal ranking chart with dynamic red bars highlighting loss-eroding categories (e.g., Tables, Binders with steep discounts).
   - **Discount vs. Profitability Correlation**: Scatter plot with empirical loss threshold boundary (20% discount risk threshold and 0% margin break-even line).
   - **Regional & Geographic Distribution**: Multi-territory revenue and margin yield across West, East, Central, and South regions.
   - **Customer Segmentation Donut**: Share of customer base across RFM behavioral clusters.

3. **Tabbed Sub-Modules**:
   - **Tab 1: Detailed Transaction Ledger**: Sortable, searchable, and paginated table with margin status badges, latency metrics, and CSV export.
   - **Tab 2: Loss Diagnostic Center**: Concentrates solely on negative-margin transactions, analyzing root causes (e.g., promotional discount overdose >40%, high freight overhead on bulky furniture).
   - **Tab 3: Actionable Business Recommendations**:
     * *Pricing Policy*: Discovers loss-making categories and calculates estimated profit recovery when capping promotional discounts at 15%.
     * *Inventory Forecast*: Identifies high-velocity items for pre-stocking buffers.
     * *Retention Engine*: Auto-extracts high-value "At Risk" customers with action suggestions.
   - **Tab 4: RFM Customer Segmentation Matrix**: Full customer roster scored across Recency (1-5), Frequency (1-5), and Monetary (1-5).

4. **Self-Contained Data Engine & Ingestion**:
   - 300+ realistic Superstore transaction records pre-loaded across 2024 and 2025.
   - **Upload Custom CSV**: Ingest external CSV files matching the Superstore schema using PapaParse with schema validation and preview.
   - **Exportable Business Reports**: Instant CSV download and high-resolution printable PDF report view.

---

### Getting Started

#### Install Dependencies
```bash
npm install
```

#### Run Development Server
```bash
npm run dev
```

#### Build for Production
```bash
npm run build
```

#### Preview Production Build
```bash
npm run preview
```
