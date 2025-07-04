import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

// This hidden button will be clicked programmatically by Header/Hero links
// to open Modals which are managed here in App.tsx
const GlobalButtons: React.FC<{onLogin: () => void, onReport: () => void}> = ({onLogin, onReport}) => (
  <>
    <button id="global-login-button" onClick={onLogin} style={{display: 'none'}} />
    <button id="global-report-scam-button" onClick={onReport} style={{display: 'none'}} />
  </>
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

  const { isAdmin, isLoading: authIsLoading } = useAuth();
  
  const handleReportSubmitted = (newReport: Report) => {
    // Pages will refetch data as needed. A global state manager like
    // Zustand or Redux could make this more elegant in a larger app.
    console.log("New report submitted in App:", newReport);
  };


  if (authIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-600">Loading ScamGuard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onLoginClick={openLoginModal} onSignUpClick={openSignUpModal} />
      <GlobalButtons onLogin={openLoginModal} onReport={openReportModal} />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/reports/:id" element={<ReportDetailsPage />} />
          
          {/* Admin Protected Routes */}
          {isAdmin && (
            <>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} /> 
              <Route path="/admin/advertisement" element={<AdminAdvertisementPage />} />
            </>
          )}

          {/* Fallback Route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      
      <footer className="bg-slate-800 text-slate-300 py-6 text-center mt-auto">
        <div className="container mx-auto">
            <p>&copy; {new Date().getFullYear()} ScamGuard. All rights reserved.</p>
            <p className="text-sm mt-1">Protecting the community, one report at a time.</p>
        </div>
      </footer>

      {/* Modals are managed at the app level */}
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