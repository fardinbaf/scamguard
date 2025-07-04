import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import ReportList from '../components/ReportList';
import { Report, ReportStatus, AdvertisementConfig } from '../types';
import { getReports } from '../services/reportService';
import { getAdvertisementConfig } from '../services/advertisementService';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [adConfig, setAdConfig] = useState<AdvertisementConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAd, setIsLoadingAd] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const fetchRecentReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const reports = await getReports({ status: ReportStatus.APPROVED }); 
      setRecentReports(reports.slice(0, 6)); 
    } catch (error) {
      console.error("Failed to fetch recent reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAdConfiguration = useCallback(async () => {
    setIsLoadingAd(true);
    try {
      const config = await getAdvertisementConfig();
      setAdConfig(config);
    } catch (error) {
      console.error("Failed to fetch advertisement configuration:", error);
    } finally {
      setIsLoadingAd(false);
    }
  }, []);


  useEffect(() => {
    fetchRecentReports();
    fetchAdConfiguration();
  }, [fetchRecentReports, fetchAdConfiguration]);

  const handleReportScamClick = () => {
    if (isAuthenticated) {
       const reportButton = document.getElementById('global-report-scam-button');
       if(reportButton) reportButton.click(); 
    } else {
      const loginButton = document.getElementById('global-login-button');
      if (loginButton) loginButton.click();
      else alert("Please log in to report a scam.");
    }
  };

  const handleSearchReportsClick = () => {
    navigate('/search');
  };
  
  return (
    <div>
      <HeroSection 
        onReportScamClick={handleReportScamClick} 
        onSearchReportsClick={handleSearchReportsClick} 
      />

      {/* Advertisement Section */}
      {!isLoadingAd && adConfig?.is_enabled && adConfig?.publicURL && (
        <section className="container mx-auto px-4 py-8">
          <a 
            href={adConfig.target_url || '#'} 
            target="_blank" 
            rel="noopener noreferrer sponsored"
            className="block w-full md:w-3/4 lg:w-1/2 mx-auto rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            aria-label="Advertisement"
          >
            <img src={adConfig.publicURL} alt="Advertisement" className="w-full h-auto object-contain" />
          </a>
        </section>
      )}

      <main className="container mx-auto px-4 py-8">
        <section>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Recently Approved Reports</h2>
          <ReportList 
            reports={recentReports} 
            isLoading={isLoading} 
            emptyMessage={isAdmin ? "No recent reports have been approved. Check the admin dashboard for all reports." : "No publicly approved reports are available at this time."}
          />
        </section>
      </main>
    </div>
  );
};

export default HomePage;
