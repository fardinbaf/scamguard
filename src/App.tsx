import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useModal } from './hooks/useModal';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ReportDetailsPage from './pages/ReportDetailsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import AdminAdvertisementPage from './pages/AdminAdvertisementPage';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import ReportFormModal from './components/ReportFormModal';
import { Report } from './types';
import LoadingSpinner from './components/LoadingSpinner';


// This hidden button will be clicked programmatically by Header link
// to open ReportFormModal which is managed here in App.tsx
const GlobalReportScamButton: React.FC<{onClick: () => void}> = ({onClick}) => (
  <button id="global-report-scam-button" onClick={onClick} style={{display: 'none'}}>
    Report Scam
  </button>
);


const AppContent: React.FC = () => {
  const { 
    isOpen: isLoginModalOpen, 
    openModal: openLoginModal, 
    closeModal: closeLoginModal 
  } = useModal();
  const { 
    isOpen: isSignUpModalOpen, 
    openModal: openSignUpModal, 
    closeModal: closeSignUpModal 
  } = useModal();
  const { 
    isOpen: isReportModalOpen, 
    openModal: openReportModal, 
    closeModal: closeReportModal 
  } = useModal();

  const { isAuthenticated, isAdmin, isLoading: authIsLoading } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash === '#report' && isAuthenticated) {
      openReportModal();
    }
  }, [location, isAuthenticated, openReportModal]);
  
  const handleReportSubmitted = (newReport: Report) => {
    // In a real app with global state management (like Redux/Zustand),
    // you might dispatch an action here. For now, pages refetch data.
    console.log("New report submitted in App:", newReport);
  };


  if (authIsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div></div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header onLoginClick={openLoginModal} onSignUpClick={openSignUpModal} />
      <GlobalReportScamButton onClick={openReportModal} />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/reports/:id" element={<ReportDetailsPage />} />
          {isAdmin && (
            <>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} /> 
              <Route path="/admin/advertisement" element={<AdminAdvertisementPage />} />
            </>
          )}
          <Route path="*" element={<HomePage />} /> {/* Fallback to HomePage */}
        </Routes>
      </main>
      
      <footer className="bg-slate-800 text-slate-300 py-8 text-center">
        <p>&copy; {new Date().getFullYear()} ScamGuard. All rights reserved.</p>
        <p className="text-sm">Protecting the community, one report at a time.</p>
      </footer>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal}
        onSwitchToSignUp={() => { closeLoginModal(); openSignUpModal(); }}
      />
      <SignUpModal 
        isOpen={isSignUpModalOpen} 
        onClose={closeSignUpModal}
        onSwitchToLogin={() => { closeSignUpModal(); openLoginModal(); }}
      />
      
      <ReportFormModal 
          isOpen={isReportModalOpen} 
          onClose={closeReportModal}
          onReportSubmitted={handleReportSubmitted}
      />
      
    </div>
  );
}


const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
