
import React from 'react';
import { Report } from '../types';
import ReportCard from './ReportCard';
import LoadingSpinner from './LoadingSpinner';

interface ReportListProps {
  reports: Report[];
  isLoading: boolean;
  emptyMessage?: string;
}

const ReportList: React.FC<ReportListProps> = ({ reports, isLoading, emptyMessage = "No reports found." }) => {
  if (isLoading) {
    return <div className="flex justify-center py-10"><LoadingSpinner /></div>;
  }

  if (reports.length === 0) {
    return <p className="text-center text-gray-500 py-10">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
};

export default ReportList;