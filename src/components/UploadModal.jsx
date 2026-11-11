import React, { useState } from 'react';
import Papa from 'papaparse';
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  AlertCircle, 
  Download, 
  Layers, 
  RefreshCw 
} from 'lucide-react';

const REQUIRED_HEADERS = [
  'OrderID', 'OrderDate', 'ShipDate', 'CustomerID', 'CustomerName',
  'Segment', 'Country', 'Region', 'State', 'City',
  'Category', 'SubCategory', 'Sales', 'Quantity', 'Discount', 'Profit'
];

export default function UploadModal({ isOpen, onClose, onDataLoaded, currentCount }) {
  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadMode, setUploadMode] = useState('replace'); // 'replace' | 'merge'
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (f) => {
    setFile(f);
    setErrorMsg('');
    setIsProcessing(true);

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        setIsProcessing(false);
        const { data, meta } = results;

        if (!data || data.length === 0) {
          setErrorMsg('The uploaded CSV file is empty.');
          return;
        }

        const fields = meta.fields || [];
        const missing = REQUIRED_HEADERS.filter(h => !fields.includes(h));

        if (missing.length > 0) {
          setErrorMsg(`Missing required CSV column headers: ${missing.join(', ')}`);
          setParsedData([]);
          setPreviewRows([]);
          return;
        }

        // Clean & sanitize rows
        const cleaned = data.map((row, idx) => ({
          OrderID: String(row.OrderID || `ORD-${idx + 1}`),
          OrderDate: String(row.OrderDate || new Date().toISOString().split('T')[0]),
          ShipDate: String(row.ShipDate || new Date().toISOString().split('T')[0]),
          CustomerID: String(row.CustomerID || 'CUST-001'),
          CustomerName: String(row.CustomerName || 'Retail Customer'),
          Segment: String(row.Segment || 'Consumer'),
          Country: String(row.Country || 'United States'),
          Region: String(row.Region || 'West'),
          State: String(row.State || 'California'),
          City: String(row.City || 'Los Angeles'),
          Category: String(row.Category || 'Technology'),
          SubCategory: String(row.SubCategory || 'Phones'),
          Sales: Number(row.Sales) || 0,
          Quantity: Number(row.Quantity) || 1,
          Discount: Number(row.Discount) || 0,
          Profit: Number(row.Profit) || 0
        }));

        setParsedData(cleaned);
        setPreviewRows(cleaned.slice(0, 5));
      },
      error: (err) => {
        setIsProcessing(false);
        setErrorMsg(`Failed to parse CSV: ${err.message}`);
      }
    });
  };

  const handleApply = () => {
    if (parsedData.length > 0) {
      onDataLoaded(parsedData, uploadMode);
      onClose();
    }
  };

  const downloadSampleTemplate = () => {
    const sampleHeaders = REQUIRED_HEADERS.join(',');
    const sampleRow = "CA-2025-99901,2025-01-15,2025-01-19,CS-9999,Jane Doe,Consumer,United States,West,California,San Francisco,Technology,Phones,899.99,2,0.10,245.50";
    const csv = `${sampleHeaders}\n${sampleRow}\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'superstore_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              Upload Custom Superstore Dataset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Parse and ingest enterprise CSV sales data with client-side PapaParse
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40"
            onClick={() => document.getElementById('csv-file-input').click()}
          >
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 mx-auto text-blue-500 dark:text-blue-400 mb-2 animate-bounce" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Drag & Drop your CSV file here, or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports standard Superstore / Online Retail schemas (.csv)
            </p>
            {file && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold">
                <FileCheck className="w-4 h-4" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {/* Template helper */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Need the official column schema?</span>
            <button
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sample CSV Template
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  Parsed Successfully: {parsedData.length} Records
                </span>
                <span className="text-slate-400">Previewing first 5 rows</span>
              </div>
              
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="p-2">Order ID</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Customer</th>
                      <th className="p-2">SubCategory</th>
                      <th className="p-2 text-right">Sales</th>
                      <th className="p-2 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {previewRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2 font-mono">{r.OrderID}</td>
                        <td className="p-2">{r.OrderDate}</td>
                        <td className="p-2 font-medium">{r.CustomerName}</td>
                        <td className="p-2">{r.SubCategory}</td>
                        <td className="p-2 text-right font-mono">${r.Sales}</td>
                        <td className="p-2 text-right font-mono text-emerald-600">${r.Profit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Upload Mode Selector */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Data Integration Mode:
                </span>
                <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                  <button
                    type="button"
                    onClick={() => setUploadMode('replace')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      uploadMode === 'replace' 
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Replace Existing ({currentCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('merge')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      uploadMode === 'merge' 
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Merge with Existing
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={parsedData.length === 0}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm transition-colors"
          >
            Load {parsedData.length} Transactions into Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
