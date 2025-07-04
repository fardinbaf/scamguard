import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReportFiltersComponent from '../components/ReportFilters';
import ReportList from '../components/ReportList';
import { Report, ReportFilters, ReportStatus } from '../types';
import { getReports } from '../services/reportService';
import { useAuth } from '../hooks/useAuth';

const SearchPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();

  const initialFilters = useMemo((): ReportFilters => ({
    keyword: '',
    targetType: "All Types",
    category: "All Categories",
    status: isAdmin ? "All Statuses" : ReportStatus.APPROVED,
  }), [isAdmin]);

  const [filters, setFilters] = useState<ReportFilters>(initialFilters);

  const fetchFilteredReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedReports = await getReports(filters);
      setReports(fetchedReports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFilteredReports();
  }, [fetchFilteredReports]);

  // If user logs in/out, reset filters to default for their role
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleFilterChange =  <K extends keyof ReportFilters>(filterName: K, value: ReportFilters[K]) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };
  
  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Search Reports</h1>
      <ReportFiltersComponent 
        filters={filters} 
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        isAdmin={isAdmin}
      />
      <ReportList 
        reports={reports} 
        isLoading={isLoading} 
        emptyMessage="No reports match your criteria."
      />
    </div>
  );
};

export default SearchPage;
