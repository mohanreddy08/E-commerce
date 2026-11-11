import React, { useState } from 'react';
import { 
  Lightbulb, 
  Tag, 
  Package, 
  UserCheck, 
  CheckCircle, 
  ArrowRight, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  Mail,
  PhoneCall
} from 'lucide-react';
import { generateBusinessRecommendations } from '../utils/analytics';

export default function BusinessRecommendations({ data, rfmResult }) {
  const recommendations = generateBusinessRecommendations(data, rfmResult);
  const { pricingPolicy, highVelocity, atRiskCustomers, totalAtRiskRevenue } = recommendations;

  const [appliedPolicies, setAppliedPolicies] = useState({
    pricingCap: false,
    inventoryBuffer: false
  });

  const [contactedCustomers, setContactedCustomers] = useState({});

  const togglePolicy = (key) => {
    setAppliedPolicies(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const markCustomerContacted = (id) => {
    setContactedCustomers(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-xl p-5 text-white shadow-md border border-blue-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            Prescriptive BI Decision Engine
          </div>
          <h3 className="text-lg font-bold">
            Executive Action Plan & Automated Strategic Interventions
          </h3>
          <p className="text-xs text-blue-200/80 mt-1 max-w-2xl">
            Derived in real-time from active slicers, transaction elasticity models, and RFM behavioral clusters.
          </p>
        </div>
      </div>

      {/* 3 Pillar Strategic Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pillar 1: Pricing Policy Optimization */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 uppercase tracking-wide">
                Immediate Action
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              1. Enforce Strict Promotional Discount Cap
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Prevent negative-margin erosions caused by uncontrolled promotional discounts.
            </p>

            <div className="mt-4 p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500">Target Category:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{pricingPolicy.targetCategory}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500">Current Deficit:</span>
                <span className="font-mono font-bold text-rose-600">-${pricingPolicy.currentLoss.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500">Proposed Cap:</span>
                <span className="font-mono font-bold text-emerald-600">Max {pricingPolicy.recommendedCap}%</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 pt-1 border-t border-rose-200/50 dark:border-rose-900/50">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Projected Margin Recovery:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +${pricingPolicy.estimatedRecovery.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {pricingPolicy.ruleSummary}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => togglePolicy('pricingCap')}
              className={`w-full py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                appliedPolicies.pricingCap
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500'
              }`}
            >
              {appliedPolicies.pricingCap ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Policy Deployed to ERP Pricing Engine
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Approve 15% Maximum Discount Guardrail
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pillar 2: High Velocity Inventory Forecast */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 uppercase tracking-wide">
                Supply Chain
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              2. Inventory Pre-Stocking & Velocity Forecast
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Top 3 velocity leaders requiring procurement ramp-up to prevent stockouts.
            </p>

            <div className="mt-4 space-y-2.5">
              {highVelocity.map((item, idx) => (
                <div key={item.name} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                    <span>#{idx + 1} {item.name}</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                      {item.unitsSold} units sold
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>${item.sales.toLocaleString()} Gross Volume</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {item.recommendedStockBuffer}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Target a maximum 3-day lead time with supplier contracts for <strong>Phones</strong> and <strong>Accessories</strong> to avoid holiday stockout leakage.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => togglePolicy('inventoryBuffer')}
              className={`w-full py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                appliedPolicies.inventoryBuffer
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500'
              }`}
            >
              {appliedPolicies.inventoryBuffer ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Procurement Buffer Requisitions Sent
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Dispatch Reorder Signals to Fulfillment Centers
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pillar 3: Customer Retention Engine */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 uppercase tracking-wide">
                Churn Prevention
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              3. Retention Engine: High-Value "At Risk"
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Re-engage high lifetime value buyers currently exhibiting dormancy decay.
            </p>

            <div className="mt-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs">
              <span className="text-amber-800 dark:text-amber-300 font-medium">
                At-Risk Customer Revenue at Stake:
              </span>
              <span className="font-mono font-bold text-amber-900 dark:text-amber-200">
                ${totalAtRiskRevenue.toLocaleString()}
              </span>
            </div>

            <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
              {atRiskCustomers.map(cust => (
                <div key={cust.customerId} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[130px]">
                      {cust.customerName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ${cust.monetary.toLocaleString()} spend • {cust.daysDormant}d dormant
                    </div>
                  </div>
                  <button
                    onClick={() => markCustomerContacted(cust.customerId)}
                    className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                      contactedCustomers[cust.customerId]
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {contactedCustomers[cust.customerId] ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Queued
                      </>
                    ) : (
                      <>
                        <Mail className="w-3 h-3" />
                        Win-Back
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span className="block text-[11px] font-medium text-slate-400">
              * Trigger win-back workflows through automated CRM connectors.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
