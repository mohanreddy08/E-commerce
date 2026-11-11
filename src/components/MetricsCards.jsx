import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  ShoppingBag, 
  Clock, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';

export default function MetricsCards({ metrics }) {
  const {
    totalRevenue = 0,
    totalProfit = 0,
    profitMargin = 0,
    totalOrders = 0,
    totalUnits = 0,
    avgOrderValue = 0,
    avgFulfillmentDays = 0,
    revenueChangeMoM = 0,
    profitChangeMoM = 0,
    orderChangeMoM = 0
  } = metrics || {};

  const isProfitPositive = totalProfit >= 0;
  const isRevenueMoMPositive = revenueChangeMoM >= 0;
  const isProfitMoMPositive = profitChangeMoM >= 0;
  const isOrderMoMPositive = orderChangeMoM >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Total Revenue */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Revenue
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          ${totalRevenue.toLocaleString()}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={`inline-flex items-center font-semibold ${
            isRevenueMoMPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isRevenueMoMPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {Math.abs(revenueChangeMoM)}%
          </span>
          <span className="text-slate-400 dark:text-slate-500">MoM growth</span>
        </div>
      </div>

      {/* 2. Total Profit */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Profit
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isProfitPositive 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
          }`}>
            {isProfitPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-2">
          ${Math.abs(totalProfit).toLocaleString()}
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            isProfitPositive 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' 
              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
          }`}>
            {isProfitPositive ? 'Net Gain' : 'Net Loss'}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={`inline-flex items-center font-semibold ${
            isProfitMoMPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isProfitMoMPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {Math.abs(profitChangeMoM)}%
          </span>
          <span className="text-slate-400 dark:text-slate-500">vs prev mo</span>
        </div>
      </div>

      {/* 3. Overall Profit Margin */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Profit Margin
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className={`text-2xl font-bold tracking-tight ${
          profitMargin >= 15 ? 'text-emerald-600 dark:text-emerald-400' : 
          profitMargin >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
        }`}>
          {profitMargin}%
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Target: 15%
          </span>
          <span>
            {profitMargin >= 15 ? '• Healthy' : profitMargin >= 0 ? '• Moderate' : '• Deficit'}
          </span>
        </div>
      </div>

      {/* 4. Orders & Units Sold */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Orders / Units
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {totalOrders.toLocaleString()}
          <span className="text-xs font-medium text-slate-400 ml-1.5">
            ({totalUnits.toLocaleString()} units)
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={`inline-flex items-center font-semibold ${
            isOrderMoMPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isOrderMoMPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {Math.abs(orderChangeMoM)}%
          </span>
          <span className="text-slate-400 dark:text-slate-500">vol trend</span>
        </div>
      </div>

      {/* 5. Average Order Value (AOV) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Avg Order Value
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          ${avgOrderValue.toLocaleString()}
        </div>
        <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <span>Spend / Basket</span>
        </div>
      </div>

      {/* 6. Fulfillment Latency */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Fulfillment Latency
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {avgFulfillmentDays} <span className="text-sm font-medium text-slate-400">Days</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <span>Order to dispatch avg</span>
        </div>
      </div>
    </div>
  );
}
