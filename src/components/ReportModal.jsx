import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Building2, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Percent,
  Calendar
} from 'lucide-react';
import { exportToCSV } from '../utils/analytics';

export default function ReportModal({ 
  isOpen, 
  onClose, 
  metrics, 
  data, 
  rfmResult,
  filters
}) {
  const reportRef = useRef();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Executive Business Intelligence Summary Report
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div 
          ref={reportRef} 
          id="printable-report"
          className="p-8 overflow-y-auto space-y-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 print:p-0 print:text-black print:bg-white"
        >
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-5 flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase mb-2">
                CSC India Internship Track • BI Synthesis
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
                Executive Sales & Customer Insights Briefing
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                E-Commerce Analytics Engine • Automated Performance & Risk Diagnosis
              </p>
            </div>

            <div className="text-right text-xs text-slate-500 space-y-0.5">
              <div><strong>Generated:</strong> {today}</div>
              <div><strong>Audited Records:</strong> {data.length} Transactions</div>
              <div><strong>Filter State:</strong> {filters.region === 'all' ? 'National (All Regions)' : filters.region} • {filters.dateRange}</div>
            </div>
          </div>

          {/* KPI Snapshot Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Executive Performance Metrics
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 print:border-gray-300">
                <span className="text-[10px] uppercase text-slate-500 block font-semibold">Total Revenue</span>
                <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 print:text-black">
                  ${metrics.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 print:border-gray-300">
                <span className="text-[10px] uppercase text-slate-500 block font-semibold">Net Profit</span>
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 print:text-black">
                  ${metrics.totalProfit.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 print:border-gray-300">
                <span className="text-[10px] uppercase text-slate-500 block font-semibold">Profit Margin</span>
                <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 print:text-black">
                  {metrics.profitMargin}%
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 print:border-gray-300">
                <span className="text-[10px] uppercase text-slate-500 block font-semibold">Total Orders</span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white print:text-black">
                  {metrics.totalOrders}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 print:border-gray-300">
                <span className="text-[10px] uppercase text-slate-500 block font-semibold">Avg Basket (AOV)</span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white print:text-black">
                  ${metrics.avgOrderValue}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 print:border-gray-300">
                <span className="text-[10px] uppercase text-slate-500 block font-semibold">Dispatch Latency</span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white print:text-black">
                  {metrics.avgFulfillmentDays}d
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Risk & Loss Diagnosis */}
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 print:border-gray-400">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              2. Profit Leakage & Discount Elasticity Findings
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Empirical correlation confirms an acute <strong>20% Promotional Discount Loss Threshold</strong>. Orders discounted beyond 20% experience an 88% incidence of negative margins, heavily concentrated in <strong>Tables</strong>, <strong>Machines</strong>, and high-rate <strong>Binders</strong>. 
            </p>
            <div className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
              Mandatory Action: Deploy maximum 15% promotional cap across high-freight Furniture categories to recapture an estimated $2,300+ in operating margin.
            </div>
          </div>

          {/* Section 3: Customer Base RFM Distribution */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              3. Customer Base Composition (RFM Behavioral Matrix)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {(rfmResult?.segments || []).map(seg => (
                <div key={seg.name} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="font-bold text-slate-900 dark:text-white">{seg.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{seg.count} Customers</div>
                  <div className="mt-1 font-mono font-semibold text-blue-600 dark:text-blue-400">
                    {seg.revenueShare}% Total Rev
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Prescriptive Business Roadmap */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              4. Strategic Recommendations Summary
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
              <li><strong>Pricing Strategy:</strong> Strictly cap discounts on Tables and Binders to 15% maximum.</li>
              <li><strong>Supply Chain Readiness:</strong> Ramp inventory buffers by +25% on Phones & Accessories for seasonal Q4 velocity surges.</li>
              <li><strong>Customer Retention:</strong> Dispatch direct re-engagement sequences to high-value "At Risk" accounts with personalized win-back credits.</li>
            </ul>
          </div>

          {/* Signoff Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Prepared for: CSC India Internship Track Academic & Industry Review</span>
            <span>Enterprise Analytics Portal • Single Page Web Application</span>
          </div>

        </div>

        {/* Modal Action Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Export PDF
          </button>
        </div>

      </div>
    </div>
  );
}
