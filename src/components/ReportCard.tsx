
import React from 'react';
import { Link } from 'react-router-dom';
import { Report } from '../types';
import StatusBadge from './StatusBadge';

interface ReportCardProps {
  report: Report;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.round((now - timestamp) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30);
    const years = Math.round(days / 365);

    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} mon${months > 1 ? 's' : ''} ago`;
    return `${years} yr${years > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">{report.title}</h3>
          <StatusBadge status={report.status} />
        </div>
        <div className="mb-3">
          <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-full mr-2">
            {report.targetType}
          </span>
          <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
            {report.category}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{report.description}</p>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <p className="text-xs text-gray-500">{timeAgo(report.createdAt)}</p>
        <Link
          to={`/reports/${report.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
};

export default ReportCard;