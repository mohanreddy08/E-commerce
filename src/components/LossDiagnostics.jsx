import React from 'react';
import { 
  AlertOctagon, 
  TrendingDown, 
  Flame, 
  MapPin, 
  Percent, 
  HelpCircle, 
  ShieldAlert,
  ArrowDownRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { computeLossDiagnostics } from '../utils/analytics';

export default function LossDiagnostics({ data }) {
  const lossData = computeLossDiagnostics(data);
  const {
    totalLossAbs,
    lossCount,
    avgLossPerOrder,
    lossRatePct,
    subCategoryLossList,
    discountBracketLoss,
    regionLossList,
    worstCategory,
    worstRegion,
    lossOrders
  } = lossData;

  return (
    <div className="space-y-6">
      {/* Top Loss KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Net Losses */}
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-semibold uppercase">
            <span>Cumulative Loss Amount</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-700 dark:text-rose-300">
            -${totalLossAbs.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-rose-600/80 dark:text-rose-400/80">
            From {lossCount} negative-margin transactions
          </p>
        </div>

        {/* KPI 2: Unprofitable Orders Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Loss Order Frequency</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {lossRatePct}% <span className="text-xs text-slate-400 font-normal">of orders</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Avg loss: -${Math.abs(avgLossPerOrder)} per bad order
          </p>
        </div>

        {/* KPI 3: Heaviest Bleeding Category */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Primary Bleeding Category</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white truncate">
            {worstCategory}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Accounting for ${(subCategoryLossList[0]?.lossAmount || 0).toLocaleString()} in red ink
          </p>
        </div>

        {/* KPI 4: Highest Loss Territory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Highest Loss Territory</span>
            <MapPin className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {worstRegion} Region
          </div>
          <p className="mt-1 text-xs text-slate-500">
            ${(regionLossList[0]?.lossAmount || 0).toLocaleString()} concentrated deficit
          </p>
        </div>
      </div>

      {/* Root Cause Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Root Cause 1: Loss by Discount Bracket */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Percent className="w-4 h-4 text-rose-500" />
              Root Cause #1: Loss Severity by Discount Bracket
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cumulative financial loss grouped by promotional discount bracket
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={discountBracketLoss} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(val) => [`-$${val.toLocaleString()}`, 'Total Deficit']} 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="lossAmount" radius={[4, 4, 0, 0]}>
                  {discountBracketLoss.map((entry, index) => {
                    const isHigh = entry.bracket.includes('40%') || entry.bracket.includes('60');
                    return <Cell key={`loss-b-${index}`} fill={isHigh ? '#e11d48' : '#f97316'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">Diagnostic Takeaway:</strong> Discounts above <strong>40%</strong> trigger steep negative margins because wholesale cost exceeds net customer remittance.
          </div>
        </div>

        {/* Root Cause 2: Loss by Sub-Category */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              Root Cause #2: Top Deficit Generating Sub-Categories
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sub-categories with highest aggregate losses
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={subCategoryLossList.slice(0, 6)} 
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`} 
                  tickLine={false} 
                />
                <YAxis 
                  dataKey="subCategory" 
                  type="category" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickLine={false} 
                  width={75}
                />
                <Tooltip 
                  formatter={(val, name, props) => [
                    `-$${val.toLocaleString()} (${props.payload.count} orders, Avg Disc: ${props.payload.avgDiscountPct}%)`, 
                    'Loss Amount'
                  ]} 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="lossAmount" fill="#e11d48" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">Diagnostic Takeaway:</strong> Tables and Machines suffer from high bulk freight overheads that are completely uncovered when promo discounts exceed 20%.
          </div>
        </div>

      </div>

      {/* Loss Transaction Ledger with Root Cause Column */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Deficit Transaction Audit Trail
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked from greatest individual loss to least
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            {lossOrders.length} Deficit Orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-rose-50/50 dark:bg-rose-950/20 uppercase text-[11px] font-semibold text-rose-900 dark:text-rose-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Order ID</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Item & Category</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4 text-center">Discount</th>
                <th className="py-2.5 px-4 text-right">Net Sales</th>
                <th className="py-2.5 px-4 text-right">Net Deficit</th>
                <th className="py-2.5 px-4 text-center">Margin</th>
                <th className="py-2.5 px-4">Root Cause Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lossOrders.slice(0, 15).map(o => (
                <tr key={o.orderId} className="hover:bg-rose-50/30 dark:hover:bg-rose-950/10">
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                    {o.orderId}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                    {o.orderDate}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                    {o.customerName}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{o.subCategory}</span>
                    <span className="text-[10px] text-slate-400 block">{o.category}</span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                    {o.city}, {o.state} ({o.region})
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {o.discountPct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono">
                    ${o.sales}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    -${Math.abs(o.profit)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="font-mono text-xs font-semibold text-rose-600">
                      {o.margin}%
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                      <ArrowDownRight className="w-3 h-3 text-amber-600" />
                      {o.rootCause}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
