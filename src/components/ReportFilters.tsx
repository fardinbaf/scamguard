
import React from 'react';
import { ReportCategory, ReportStatus, TargetType, ReportFilters as ReportFiltersType } from '../types';
import { TARGET_TYPES_OPTIONS, REPORT_CATEGORY_OPTIONS, REPORT_STATUS_OPTIONS } from '../constants';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFilterChange: <K extends keyof ReportFiltersType>(filterName: K, value: ReportFiltersType[K]) => void;
  onResetFilters: () => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, onFilterChange, onResetFilters }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">Keyword</label>
          <input
            type="text"
            id="keyword"
            placeholder="Search title or description..."
            value={filters.keyword || ''}
            onChange={(e) => onFilterChange('keyword', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="targetType" className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
          <select
            id="targetType"
            value={filters.targetType || "All Types"}
            onChange={(e) => onFilterChange('targetType', e.target.value as TargetType | "All Types")}
            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="All Types">All Types</option>
            {TARGET_TYPES_OPTIONS.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="category"
            value={filters.category || "All Categories"}
            onChange={(e) => onFilterChange('category', e.target.value as ReportCategory | "All Categories")}
            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="All Categories">All Categories</option>
            {REPORT_CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="status"
            value={filters.status || "All Statuses"}
            onChange={(e) => onFilterChange('status', e.target.value as ReportStatus | "All Statuses")}
            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="All Statuses">All Statuses</option>
            {REPORT_STATUS_OPTIONS.map(stat => <option key={stat} value={stat}>{stat}</option>)}
          </select>
        </div>
         <div className="lg:col-span-4 flex justify-end mt-2 md:mt-0">
          <button 
            onClick={onResetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;