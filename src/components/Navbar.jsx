import React from 'react';
import { 
  BarChart2, 
  Sun, 
  Moon, 
  Upload, 
  FileText, 
  Download, 
  RotateCcw,
  Sparkles,
  Building2 
} from 'lucide-react';
import { exportToCSV } from '../utils/analytics';

export default function Navbar({ 
  darkMode, 
  setDarkMode, 
  onOpenUpload, 
  onOpenReport, 
  onResetFilters,
  currentData,
  totalRecords
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & System Title with Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Design and Implementation of an E-Commerce Sales and Customer Insights Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Building2 className="w-3 h-3 mr-1" />
                  Enterprise Analytics Portal - CSC India Internship Track
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-400">
                  • {totalRecords} Transactions Loaded
                </span>
              </div>
            </div>
          </div>

          {/* Action Tools & Theme Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Upload Custom CSV */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Upload custom Superstore CSV"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Upload CSV</span>
            </button>

            {/* Export Summary Report */}
            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/80 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 transition-colors"
              title="Generate Printable PDF Business Report"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">Export Report (PDF)</span>
            </button>

            {/* Quick CSV Export */}
            <button
              onClick={() => exportToCSV(currentData, 'filtered_ecommerce_sales.csv')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Export filtered data to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">CSV</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
