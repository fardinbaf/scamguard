import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Report, ReportStatus, ReportFilters } from '../types';
import { getReports, updateReportStatus, deleteReport as serviceDeleteReport } from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import ReportFiltersComponent from '../components/ReportFilters';
import { REPORT_STATUS_OPTIONS } from '../constants';
import { TrashIcon } from '../components/Icons';

const AdminDashboardPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({
    keyword: '',
    targetType: "All Types",
    category: "All Categories",
    status: "All Statuses",
  });

  const fetchAllReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedReports = await getReports(filters);
      setReports(fetchedReports);
    } catch (error) {
      console.error("Failed to fetch reports for admin:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
    if (authLoading) return; 
    if (!isAdmin) {
      navigate('/'); 
    } else {
      fetchAllReports();
    }
  }, [isAdmin, navigate, authLoading, fetchAllReports]);


  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    try {
      const updatedReport = await updateReportStatus(reportId, newStatus);
      if (updatedReport) {
        fetchAllReports(); // Refetch to ensure list is accurate according to filters
      }
    } catch (error) {
      console.error("Failed to update report status:", error);
      alert("Error updating status.");
    }
  };

  const handleDeleteReport = async (reportId: string, reportTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the report "${reportTitle}"?`)) {
      try {
        await serviceDeleteReport(reportId);
        fetchAllReports(); // Refetch to update the list
        alert(`Report "${reportTitle}" deleted successfully.`);
      } catch (error) {
        console.error("Error deleting report:", error);
        alert("An error occurred while deleting the report.");
      }
    }
  };
  
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
      status: "All Statuses",
    });
  };

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Admin Dashboard - Manage Reports</h1>
      
      <ReportFiltersComponent 
        filters={filters} 
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {reports.length === 0 && !isLoading ? (
        <p className="text-center text-gray-500 py-10">No reports match your criteria.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported On</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/reports/${report.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                      {report.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value as ReportStatus)}
                      className="text-xs p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      aria-label={`Change status for ${report.title}`}
                    >
                      {REPORT_STATUS_OPTIONS.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteReport(report.id, report.title)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title={`Delete report: ${report.title}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
