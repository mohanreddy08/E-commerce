import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Calendar, 
  BarChart3, 
  TrendingDown, 
  MapPin, 
  PieChart as PieIcon, 
  AlertTriangle,
  Info 
} from 'lucide-react';
import { 
  aggregateByMonth, 
  aggregateByQuarter, 
  aggregateSubCategories, 
  getDiscountProfitabilityPoints, 
  aggregateByRegion 
} from '../utils/analytics';

// Custom Tooltip for Seasonality Dual Chart
const SeasonalityTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const sales = payload.find(p => p.dataKey === 'sales')?.value || 0;
    const profit = payload.find(p => p.dataKey === 'profit')?.value || 0;
    const margin = sales > 0 ? ((profit / sales) * 100).toFixed(1) : 0;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
        <div className="flex justify-between gap-4 pt-1">
          <span className="text-blue-400">Revenue:</span>
          <span className="font-mono font-medium">${sales.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className={profit >= 0 ? "text-emerald-400" : "text-rose-400"}>Profit:</span>
          <span className={`font-mono font-medium ${profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            ${profit.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Margin:</span>
          <span className="font-mono text-slate-300">{margin}%</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Sub-Category Comparison
const SubCatTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1">
          {data.subCategory} <span className="text-[10px] text-slate-400 font-normal">({data.category})</span>
        </p>
        <div className="flex justify-between gap-4 pt-1">
          <span className="text-blue-400">Sales:</span>
          <span className="font-mono font-medium">${data.sales.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className={data.profit >= 0 ? "text-emerald-400" : "text-rose-400"}>Profit:</span>
          <span className={`font-mono font-medium ${data.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            ${data.profit.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Avg Discount:</span>
          <span className="font-mono text-amber-400">{data.avgDiscount}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Net Margin:</span>
          <span className="font-mono text-slate-300">{data.margin}%</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Scatter Plot
const ScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const pt = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1 max-w-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
          <span className="font-bold text-slate-200">{pt.orderId}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
            pt.isLoss ? 'bg-rose-900/60 text-rose-300' : 'bg-emerald-900/60 text-emerald-300'
          }`}>
            {pt.isLoss ? 'Loss' : 'Profitable'}
          </span>
        </div>
        <p className="text-slate-300 truncate">{pt.customerName}</p>
        <p className="text-slate-400 text-[11px]">{pt.subCategory} • {pt.category}</p>
        <div className="pt-1.5 space-y-0.5 border-t border-slate-800">
          <div className="flex justify-between gap-4">
            <span className="text-amber-400">Discount Applied:</span>
            <span className="font-mono font-semibold">{pt.discountPct}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Profit Margin:</span>
            <span className={`font-mono font-semibold ${pt.margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {pt.margin}%
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Order Value / Profit:</span>
            <span className="font-mono text-slate-300">${pt.sales} / ${pt.profit}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function Charts({ data, rfmResult }) {
  const [seasonalityMode, setSeasonalityMode] = useState('monthly'); // 'monthly' | 'quarterly'

  const seasonalityData = seasonalityMode === 'monthly' 
    ? aggregateByMonth(data) 
    : aggregateByQuarter(data);

  const subCategoryData = aggregateSubCategories(data);
  const scatterPoints = getDiscountProfitabilityPoints(data);
  const regionalData = aggregateByRegion(data);
  const rfmSegments = rfmResult?.segments || [];

  return (
    <div className="space-y-6">
      {/* Row 1: Seasonality + Sub-Category Profitability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Sales & Revenue Seasonality (Dual Chart) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Sales & Revenue Seasonality
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dual-axis comparison of gross sales revenue vs net profit margin
              </p>
            </div>

            {/* Toggle Monthly vs Quarterly */}
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs">
              <button
                type="button"
                onClick={() => setSeasonalityMode('monthly')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  seasonalityMode === 'monthly'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setSeasonalityMode('quarterly')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  seasonalityMode === 'quarterly'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Quarterly
              </button>
            </div>
          </div>

          <div className="h-72 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={seasonalityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickLine={false} 
                />
                <YAxis 
                  yAxisId="sales"
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="profit" 
                  orientation="right" 
                  tick={{ fontSize: 11, fill: '#10b981' }} 
                  tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<SeasonalityTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(value) => (
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {value === 'sales' ? 'Gross Revenue ($)' : 'Net Profit ($)'}
                    </span>
                  )} 
                />
                <Bar 
                  yAxisId="sales" 
                  dataKey="sales" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  opacity={0.85}
                  maxBarSize={40}
                />
                <Line 
                  yAxisId="profit" 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#fff' }} 
                  activeDot={{ r: 6 }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top & Bottom Performing Sub-Categories (Horizontal Bar Chart) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Sub-Category Performance
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sales volume vs profit margin. Red bars indicate loss-making categories.
              </p>
            </div>
          </div>

          <div className="h-72 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={subCategoryData.slice(0, 10)} 
                layout="vertical" 
                margin={{ top: 5, right: 20, left: 25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
                  tickLine={false} 
                />
                <YAxis 
                  dataKey="subCategory" 
                  type="category" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickLine={false} 
                  width={75}
                />
                <Tooltip content={<SubCatTooltip />} />
                <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                  {subCategoryData.slice(0, 10).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isLossMaking ? '#f43f5e' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-between text-[11px] pt-2 text-slate-500 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
              <span>Profitable Volume</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">Net Loss (Erosion)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Discount vs Profitability + Regional Distribution + RFM Donut */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

        {/* Chart 3: Discount vs. Profitability Correlation (Scatter Plot) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Discount vs. Margin Correlation
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Loss threshold at &gt;20% discount rate causing negative margins
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 text-[10px] font-bold">
              Loss Threshold: 20%
            </span>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis 
                  type="number" 
                  dataKey="discountPct" 
                  name="Discount Rate" 
                  unit="%" 
                  domain={[0, 80]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis 
                  type="number" 
                  dataKey="margin" 
                  name="Profit Margin" 
                  unit="%" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                />
                <Tooltip content={<ScatterTooltip />} />
                {/* 0% margin reference line */}
                <ReferenceLine y={0} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: 'Break-Even (0%)', fill: '#f43f5e', fontSize: 10, position: 'insideTopLeft' }} />
                {/* 20% discount danger zone line */}
                <ReferenceLine x={20} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: '20% Risk Line', fill: '#f59e0b', fontSize: 10, position: 'insideBottomRight' }} />
                <Scatter name="Transactions" data={scatterPoints} fill="#3b82f6">
                  {scatterPoints.map((entry, index) => (
                    <Cell 
                      key={`scatter-cell-${index}`} 
                      fill={entry.margin < 0 ? '#f43f5e' : '#10b981'} 
                      opacity={0.65}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              <strong>Empirical Finding:</strong> Transactions discounted beyond <strong>20%</strong> suffer severe profit breakdown, causing over <strong>88%</strong> of all net losses.
            </span>
          </div>
        </div>

        {/* Chart 4: Regional & Geographic Distribution */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Regional Distribution
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sales volume and margin yield across 4 main territories
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(val, name) => [`$${val.toLocaleString()}`, name === 'sales' ? 'Revenue' : 'Net Profit']} 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            {regionalData.map((reg) => (
              <div key={reg.region} className="p-1 rounded bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-medium">{reg.region}</span>
                <span className={`text-xs font-bold font-mono ${reg.margin >= 15 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                  {reg.margin}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 5: Customer Segmentation (RFM Donut Chart) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                RFM Segments
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customer base share by behavioral tier
            </p>
          </div>

          <div className="h-48 mt-2 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rfmSegments}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {rfmSegments.map((entry, index) => (
                    <Cell key={`donut-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name, props) => [
                    `${val} Customers (${props.payload.revenueShare}% Rev)`, 
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Micro Legend */}
          <div className="space-y-1 pt-1 text-xs border-t border-slate-100 dark:border-slate-800">
            {rfmSegments.slice(0, 4).map(seg => (
              <div key={seg.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                  <span className="text-slate-600 dark:text-slate-400 truncate text-[11px]">{seg.name}</span>
                </div>
                <span className="font-semibold font-mono text-[11px] text-slate-800 dark:text-slate-200">
                  {seg.count} ({seg.revenueShare}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
