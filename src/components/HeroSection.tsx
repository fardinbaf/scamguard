import React from 'react';
import { ShieldIcon as LargeShieldIcon, ReportIcon, SearchIcon } from './Icons';
import { useAuth } from '../hooks/useAuth';

interface HeroSectionProps {
  onReportScamClick: () => void;
  onSearchReportsClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onReportScamClick, onSearchReportsClick }) => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-20 px-4">
      <div className="container mx-auto text-center">
        <LargeShieldIcon className="w-24 h-24 mx-auto mb-6 text-blue-400" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Protect Yourself and Others
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Report scams and spam to help protect the community from fraudulent activities.
          Search our database to stay informed and avoid potential threats.
        </p>
        <div className="space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            id="global-report-scam-button-hero"
            onClick={onReportScamClick}
            disabled={!isAuthenticated}
            title={!isAuthenticated ? "Please login to report a scam" : "Report a new scam"}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ReportIcon className="w-5 h-5 mr-2" /> Report a Scam
          </button>
          <button
            onClick={onSearchReportsClick}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-blue-400 text-base font-medium rounded-md shadow-sm text-blue-300 bg-transparent hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 transition-colors"
          >
            <SearchIcon className="w-5 h-5 mr-2" /> Search Reports
          </button>
        </div>
        {!isAuthenticated && (
          <p className="mt-4 text-sm text-slate-400">
            You need to be logged in to report a scam.
          </p>
        )}
      </div>
    </section>
  );
};

export default HeroSection;