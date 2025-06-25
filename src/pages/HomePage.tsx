
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import ReportList from '../components/ReportList';
import { Report, ReportStatus, AdvertisementConfig } from '../types'; // Added AdvertisementConfig
import { getReports } from '../services/reportService';
import { getAdvertisementConfig } from '../services/advertisementService'; // Added
import { useModal } from '../hooks/useModal';
import ReportFormModal from '../components/ReportFormModal';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [adConfig, setAdConfig] = useState<AdvertisementConfig | null>(null); // Added
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAd, setIsLoadingAd] = useState(true); // Added for ad loading
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { 
    isOpen: isReportModalOpen, 
    openModal: openReportModal, 
    closeModal: closeReportModal 
  } = useModal();


  const fetchRecentReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const reports = await getReports(); 
      setRecentReports(reports.slice(0, 6)); 
    } catch (error) {
      console.error("Failed to fetch recent reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAdConfiguration = useCallback(async () => { // Added
    setIsLoadingAd(true);
    try {
      const config = getAdvertisementConfig(); // This is synchronous for localStorage
      setAdConfig(config);
    } catch (error) {
      console.error("Failed to fetch advertisement configuration:", error);
    } finally {
      setIsLoadingAd(false);
    }
  }, []);


  useEffect(() => {
    fetchRecentReports();
    fetchAdConfiguration(); // Added
  }, [fetchRecentReports, fetchAdConfiguration]); // Added fetchAdConfiguration

  const handleReportScamClick = () => {
    if (isAuthenticated) {
      openReportModal();
    } else {
      alert("Please log in to report a scam.");
      const loginButton = document.querySelector('header button > svg[data-icon="login"]'); // This selector might be too specific
      // A more robust way would be to call openLoginModal if it's available from a shared context or prop.
      // For now, this is a quick attempt.
      if (loginButton) (loginButton.closest('button') as HTMLElement)?.click();
    }
  };

  const handleSearchReportsClick = () => {
    navigate('/search');
  };
  
  const handleReportSubmitted = (newReport: Report) => {
    fetchRecentReports();
  };


  return (
    <div>
      <HeroSection 
        onReportScamClick={handleReportScamClick} 
        onSearchReportsClick={handleSearchReportsClick} 
      />

      {/* Advertisement Section */}
      {!isLoadingAd && adConfig?.isEnabled && adConfig?.imageUrl && (
        <section className="container mx-auto px-4 py-8">
          <a 
            href={adConfig.targetUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer sponsored"
            className="block w-full md:w-3/4 lg:w-1/2 mx-auto rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            aria-label="Advertisement"
          >
            <img src={adConfig.imageUrl} alt="Advertisement" className="w-full h-auto object-contain" />
          </a>
        </section>
      )}

      <main className="container mx-auto px-4 py-8">
        <section>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Recent Reports</h2>
          <ReportList 
            reports={recentReports} 
            isLoading={isLoading} 
            emptyMessage={isAdmin ? "No recent reports. Check the admin dashboard for all reports." : "No publicly approved reports available recently."}
          />
        </section>
      </main>
      {isAuthenticated && (
        <ReportFormModal 
          isOpen={isReportModalOpen} 
          onClose={closeReportModal}
          onReportSubmitted={handleReportSubmitted}
        />
      )}
    </div>
  );
};

export default HomePage;