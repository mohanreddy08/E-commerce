import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { computeProfitMargin, computeFulfillmentDays, exportToCSV } from '../utils/analytics';

export default function DataTable({ data }) {
  const [search, setSearch] = useState('');
  const [profitFilter, setProfitFilter] = useState('all'); // 'all' | 'profitable' | 'losses'
  const [sortField, setSortField] = useState('OrderDate');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter & Search logic
  const filteredRows = useMemo(() => {
    return data.filter(row => {
      // Profit status filter
      const profit = Number(row.Profit) || 0;
      if (profitFilter === 'profitable' && profit < 0) return false;
      if (profitFilter === 'losses' && profit >= 0) return false;

      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches = 
          (row.OrderID && row.OrderID.toLowerCase().includes(q)) ||
          (row.CustomerName && row.CustomerName.toLowerCase().includes(q)) ||
          (row.SubCategory && row.SubCategory.toLowerCase().includes(q)) ||
          (row.City && row.City.toLowerCase().includes(q)) ||
          (row.State && row.State.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [data, search, profitFilter]);

  // Sorting
  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'Sales' || sortField === 'Profit' || sortField === 'Discount' || sortField === 'Quantity') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (sortField === 'OrderDate' || sortField === 'ShipDate') {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
      } else if (sortField === 'margin') {
        aVal = computeProfitMargin(a.Profit, a.Sales);
        bVal = computeProfitMargin(b.Profit, b.Sales);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredRows, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / itemsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRows.slice(start, start + itemsPerPage);
  }, [sortedRows, currentPage, itemsPerPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 inline ml-1" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline ml-1" />
      : <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline ml-1" />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Table Action Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search Order ID, Customer, Item..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Profit status toggle */}
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              onClick={() => { setProfitFilter('all'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                profitFilter === 'all' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({data.length})
            </button>
            <button
              onClick={() => { setProfitFilter('profitable'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                profitFilter === 'profitable' 
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Profitable
            </button>
            <button
              onClick={() => { setProfitFilter('losses'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                profitFilter === 'losses' 
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Losses Only
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-between md:justify-end">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-700 dark:text-slate-200">{filteredRows.length}</strong> matching transactions
          </span>
          <button
            onClick={() => exportToCSV(sortedRows, 'superstore_ledger.csv')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
            <tr>
              <th scope="col" className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('OrderID')}>
                Order ID {renderSortIcon('OrderID')}
              </th>
              <th scope="col" className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('OrderDate')}>
                Date {renderSortIcon('OrderDate')}
              </th>
              <th scope="col" className="py-3 px-4">
                Customer & Segment
              </th>
              <th scope="col" className="py-3 px-4">
                Geo & Region
              </th>
              <th scope="col" className="py-3 px-4">
                Category & Item
              </th>
              <th scope="col" className="py-3 px-4 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('Sales')}>
                Sales ($) {renderSortIcon('Sales')}
              </th>
              <th scope="col" className="py-3 px-4 text-center cursor-pointer hover:text-slate-900" onClick={() => handleSort('Discount')}>
                Discount {renderSortIcon('Discount')}
              </th>
              <th scope="col" className="py-3 px-4 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('Profit')}>
                Profit ($) {renderSortIcon('Profit')}
              </th>
              <th scope="col" className="py-3 px-4 text-center cursor-pointer hover:text-slate-900" onClick={() => handleSort('margin')}>
                Margin {renderSortIcon('margin')}
              </th>
              <th scope="col" className="py-3 px-4 text-center">
                Latency
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-8 text-center text-slate-400">
                  No transactions match the selected filter criteria.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => {
                const profit = Number(row.Profit) || 0;
                const sales = Number(row.Sales) || 0;
                const discount = Number(row.Discount) || 0;
                const margin = computeProfitMargin(profit, sales);
                const latency = computeFulfillmentDays(row.OrderDate, row.ShipDate);

                return (
                  <tr 
                    key={row.OrderID} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {row.OrderID}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {row.OrderDate}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {row.CustomerName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {row.Segment}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-800 dark:text-slate-200">
                        {row.City}, {row.State}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {row.Region} Region
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {row.SubCategory}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {row.Category} • Qty: {row.Quantity}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      ${sales.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        discount >= 0.4 
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                          : discount > 0 
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' 
                            : 'text-slate-400'
                      }`}>
                        {(discount * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-semibold whitespace-nowrap ${
                      profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      ${profit.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        margin >= 20 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : margin >= 0 
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {margin >= 0 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {margin}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {latency}d
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - 4 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded text-xs font-semibold ${
                    currentPage === pageNum 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
