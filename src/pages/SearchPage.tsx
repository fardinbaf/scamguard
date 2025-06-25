
import React, { useState, useEffect, useCallback } from 'react';
import ReportFiltersComponent from '../components/ReportFilters';
import ReportList from '../components/ReportList';
import { Report, ReportFilters, ReportStatus } from '../types';
import { getReports } from '../services/reportService';
import { useAuth } from '../hooks/useAuth'; // Import useAuth

const SearchPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth(); // Get isAdmin status

  const [filters, setFilters] = useState<ReportFilters>({
    keyword: '',
    targetType: "All Types",
    category: "All Categories",
    // For non-admins, default to "APPROVED" to prevent showing empty list initially if "All Statuses" were to include PENDING/REJECTED from their view.
    // For admins, "All Statuses" is fine as they can see everything.
    status: isAdmin ? "All Statuses" : ReportStatus.APPROVED, 
  });

  const fetchFilteredReports = useCallback(async () => {
    setIsLoading(true);
    try {
      // getReports service handles visibility rules based on isAdmin.
      const fetchedReports = await getReports(filters);
      setReports(fetchedReports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]); // No need to add isAdmin to dependency array as filters already consider it for initial state

  useEffect(() => {
    fetchFilteredReports();
  }, [fetchFilteredReports]);

  const handleFilterChange =  <K extends keyof ReportFilters>(filterName: K, value: ReportFilters[K]) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };
  
  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      targetType: "All Types",
      category: "All Categories",
      status: isAdmin ? "All Statuses" : ReportStatus.APPROVED, // Reset to appropriate default
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Search Reports</h1>
      <ReportFiltersComponent 
        filters={filters} 
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />
      <ReportList 
        reports={reports} 
        isLoading={isLoading} 
        emptyMessage={
          filters.status === ReportStatus.PENDING && !isAdmin ? "Pending reports are only visible to administrators." :
          filters.status === ReportStatus.REJECTED && !isAdmin ? "Rejected reports are only visible to administrators." :
          "No reports match your criteria."
        } 
      />
    </div>
  );
};

export default SearchPage;