import React, { useState, useMemo, useEffect } from 'react';
import { 
  SUPERSTORE_DATASET 
} from './mockData.js';
import { 
  applyGlobalFilters, 
  computeExecutiveKPIs, 
  computeRFMSegmentation 
} from './utils/analytics';

import Navbar from './components/Navbar';
import GlobalFilters from './components/GlobalFilters';
import MetricsCards from './components/MetricsCards';
import Charts from './components/Charts';
import DataTable from './components/DataTable';
import LossDiagnostics from './components/LossDiagnostics';
import BusinessRecommendations from './components/BusinessRecommendations';
import RFMAnalysis from './components/RFMAnalysis';
import UploadModal from './components/UploadModal';
import ReportModal from './components/ReportModal';

import { 
  Table, 
  AlertOctagon, 
  Lightbulb, 
  Users, 
  Layers 
} from 'lucide-react';

export default function Dashboard() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Dataset State
  const [dataset, setDataset] = useState(SUPERSTORE_DATASET);

  // Global Slicers State
  const initialFilters = {
    dateRange: 'all', // 'all', 'last-30', 'last-180', '2024', '2025'
    region: 'all',    // 'all', 'West', 'East', 'Central', 'South'
    category: 'all',  // 'all', 'Technology', 'Furniture', 'Office Supplies'
    segment: 'all',   // 'all', 'Consumer', 'Corporate', 'Home Office'
    search: ''
  };
  const [filters, setFilters] = useState(initialFilters);

  // Active Tab State: 'ledger' | 'loss' | 'recommendations' | 'rfm'
  const [activeTab, setActiveTab] = useState('ledger');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Active Filter Count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange !== 'all') count++;
    if (filters.region !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.segment !== 'all') count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // Pipeline Computations: Dynamic Filtering
  const filteredData = useMemo(() => {
    return applyGlobalFilters(dataset, filters);
  }, [dataset, filters]);

  // Executive KPI Computation
  const executiveMetrics = useMemo(() => {
    return computeExecutiveKPIs(filteredData, dataset);
  }, [filteredData, dataset]);

  // RFM Analysis Computation
  const rfmResult = useMemo(() => {
    return computeRFMSegmentation(filteredData);
  }, [filteredData]);

  // Handle User CSV Upload
  const handleDataLoaded = (newRows, mode) => {
    if (mode === 'merge') {
      setDataset(prev => [...prev, ...newRows]);
    } else {
      setDataset(newRows);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onResetFilters={handleResetFilters}
        currentData={filteredData}
        totalRecords={dataset.length}
      />

      {/* Main Content Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Global Slicers & Filters Bar */}
        <GlobalFilters
          filters={filters}
          setFilters={setFilters}
          onReset={handleResetFilters}
          activeFilterCount={activeFilterCount}
        />

        {/* Section B: Executive KPI Cards */}
        <MetricsCards metrics={executiveMetrics} />

        {/* Section C: Interactive Visualizations Grid */}
        <Charts data={filteredData} rfmResult={rfmResult} />

        {/* Section D: Tabbed Sub-Modules */}
        <div className="space-y-4">
          
          {/* Tabs Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {/* Tab 1: Transaction Ledger */}
              <button
                onClick={() => setActiveTab('ledger')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'ledger'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Table className="w-4 h-4" />
                Detailed Transaction Ledger
              </button>

              {/* Tab 2: Loss Diagnostic Center */}
              <button
                onClick={() => setActiveTab('loss')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'loss'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <AlertOctagon className="w-4 h-4" />
                Loss Diagnostic Center
              </button>

              {/* Tab 3: Actionable Business Recommendations */}
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'recommendations'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Actionable Recommendations
              </button>

              {/* Tab 4: Customer RFM Segmentation */}
              <button
                onClick={() => setActiveTab('rfm')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'rfm'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                RFM Customer Segmentation
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Filtered Population: <strong className="text-slate-800 dark:text-slate-200">{filteredData.length}</strong> / {dataset.length}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="transition-all duration-200">
            {activeTab === 'ledger' && (
              <DataTable data={filteredData} />
            )}

            {activeTab === 'loss' && (
              <LossDiagnostics data={filteredData} />
            )}

            {activeTab === 'recommendations' && (
              <BusinessRecommendations 
                data={filteredData} 
                rfmResult={rfmResult} 
              />
            )}

            {activeTab === 'rfm' && (
              <RFMAnalysis rfmResult={rfmResult} />
            )}
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Enterprise Analytics Portal • CSC India Internship Track Single-Page Application</span>
          <span className="font-mono text-[11px] text-slate-400">Production Build v1.0.0 • Pure Client-Side BI Engine</span>
        </div>
      </footer>

      {/* Upload Custom CSV Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
        currentCount={dataset.length}
      />

      {/* Executive Summary PDF / Printable Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        metrics={executiveMetrics}
        data={filteredData}
        rfmResult={rfmResult}
        filters={filters}
      />
    </div>
  );
}
