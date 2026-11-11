import React, { useState } from 'react';
import { 
  Users, 
  Crown, 
  HeartHandshake, 
  Sparkles, 
  AlertTriangle, 
  UserMinus, 
  Download, 
  Search, 
  Filter,
  DollarSign,
  Calendar,
  Layers
} from 'lucide-react';
import { exportToCSV } from '../utils/analytics';

export default function RFMAnalysis({ rfmResult }) {
  const { customers = [], segments = [] } = rfmResult || {};
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => {
    if (selectedSegment !== 'all' && c.rfmSegment !== selectedSegment) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSegmentIcon = (name) => {
    switch (name) {
      case 'Champions':
        return <Crown className="w-5 h-5 text-emerald-500" />;
      case 'Loyal Customers':
        return <HeartHandshake className="w-5 h-5 text-blue-500" />;
      case 'Potential Loyalists':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'At Risk':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <UserMinus className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Segment Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {segments.map((seg) => {
          const isSelected = selectedSegment === seg.name;
          return (
            <div
              key={seg.name}
              onClick={() => setSelectedSegment(isSelected ? 'all' : seg.name)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/40 dark:bg-blue-950/30' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ backgroundColor: `${seg.color}20`, color: seg.color }}>
                  {seg.badge}
                </span>
                {getSegmentIcon(seg.name)}
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {seg.name}
              </h4>

              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {seg.count}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {seg.revenueShare}% Rev
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
                <span>Avg Spend:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  ${seg.avgSpend.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Segment Description & Rules Matrix */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="font-bold text-slate-900 dark:text-white block">
            RFM Scoring Methodology:
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            <strong>Recency (R):</strong> Days since last order (1=Oldest, 5=Within 30d). 
            <strong> Frequency (F):</strong> Total unique transactions (1-5 scale). 
            <strong> Monetary (M):</strong> Cumulative revenue contribution ($0-$5k+).
          </p>
        </div>

        <button
          onClick={() => exportToCSV(customers, 'rfm_customer_segments.csv')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shrink-0 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export RFM Roster
        </button>
      </div>

      {/* Customer RFM Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Customer Name, ID, City..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedSegment !== 'all' && (
              <button
                onClick={() => setSelectedSegment('all')}
                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Clear Segment Filter
              </button>
            )}
          </div>

          <span className="text-xs text-slate-500">
            Showing <strong>{filteredCustomers.length}</strong> customers in roster
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Segment Type</th>
                <th className="py-3 px-4">Geo / Location</th>
                <th className="py-3 px-4 text-center">RFM Score</th>
                <th className="py-3 px-4 text-center">Assigned Cluster</th>
                <th className="py-3 px-4 text-center">Last Order</th>
                <th className="py-3 px-4 text-center">Frequency</th>
                <th className="py-3 px-4 text-right">Monetary Spend</th>
                <th className="py-3 px-4 text-right">Net Profit Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No customers match the current segment / search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.slice(0, 25).map(c => (
                  <tr key={c.customerId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {c.customerName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {c.customerId}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {c.segmentType}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {c.city}, {c.state} ({c.region})
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {c.rfmScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span 
                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ backgroundColor: `${c.color}20`, color: c.color }}
                      >
                        {c.rfmSegment}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500 whitespace-nowrap text-[11px]">
                      {c.lastOrderDate} ({c.recencyDays}d ago)
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium whitespace-nowrap">
                      {c.frequency} orders
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      ${c.monetary.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-semibold whitespace-nowrap ${
                      c.totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      ${c.totalProfit.toLocaleString()} ({c.margin}%)
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
