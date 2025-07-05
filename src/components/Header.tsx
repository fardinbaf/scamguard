import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../constants';
import { ShieldIcon, LoginIcon, UserPlusIcon, LogoutIcon, AdminIcon, UserGroupIcon, MegaphoneIcon, MenuIcon, CloseIcon } from './Icons';

interface HeaderProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignUpClick }) => {
  const { isAuthenticated, isAdmin, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };
  
  const handleMobileButtonClick = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  }

  const handleReportScamClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    const reportButton = document.getElementById('global-report-scam-button');
    if(reportButton) reportButton.click(); 
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" onClick={handleNavLinkClick} className="flex-shrink-0 flex items-center space-x-2 text-2xl font-bold text-blue-600">
          <ShieldIcon className="w-8 h-8 text-blue-600" />
          <span>{APP_NAME}</span>
        </Link>
        
        {/* --- Desktop Navigation --- */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium">Home</Link>
          <Link to="/search" className="text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium">Search Reports</Link>
          {isAuthenticated && (
             <button
                onClick={(e) => {
                  e.preventDefault(); 
                  const reportButton = document.getElementById('global-report-scam-button');
                  if(reportButton) reportButton.click(); 
                }}
                className="text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                Report Scam
              </button>
          )}
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <>
                  <Link to="/admin" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium" title="Admin Dashboard">
                    <AdminIcon className="w-5 h-5 mr-1" />
                    <span>Reports</span>
                  </Link>
                  <Link to="/admin/users" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium" title="User Management">
                    <UserGroupIcon className="w-5 h-5 mr-1" />
                    <span>Users</span>
                  </Link>
                  <Link to="/admin/advertisement" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium" title="Manage Advertisement">
                    <MegaphoneIcon className="w-5 h-5 mr-1" />
                    <span>Ad</span>
                  </Link>
                </>
              )}
              <span className="text-gray-700 hidden lg:inline px-3 py-2 text-sm">Hi, {currentUser?.identifier.split('@')[0]}</span>
              <button
                onClick={handleLogout}
                className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <LogoutIcon className="w-5 h-5 md:mr-1" /> <span className="hidden xl:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <LoginIcon className="w-5 h-5 md:mr-1" /> <span className="hidden xl:inline">Login</span>
              </button>
              <button
                onClick={onSignUpClick}
                className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
               <UserPlusIcon className="w-5 h-5 md:mr-1" /> <span className="hidden xl:inline">Sign Up</span>
              </button>
            </>
          )}
        </nav>

        {/* --- Mobile Menu Button --- */}
        <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close main menu" : "Open main menu"}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? ( <CloseIcon className="block h-6 w-6" /> ) : ( <MenuIcon className="block h-6 w-6" /> )}
            </button>
        </div>
      </div>

      {/* --- Mobile Menu --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
             <nav className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
                <Link to="/" onClick={handleNavLinkClick} className="block text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors px-3 py-2 rounded-md text-base font-medium">Home</Link>
                <Link to="/search" onClick={handleNavLinkClick} className="block text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors px-3 py-2 rounded-md text-base font-medium">Search Reports</Link>
                {isAuthenticated && (
                  <button onClick={handleReportScamClick} className="w-full text-left text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors px-3 py-2 rounded-md text-base font-medium">
                    Report Scam
                  </button>
                )}

                <div className="pt-2 pb-1 border-t border-gray-200">
                  {isAuthenticated ? (
                      <>
                        {currentUser && <span className="block px-3 py-2 text-base font-medium text-gray-700">Hi, {currentUser?.identifier.split('@')[0]}</span>}
                        {isAdmin && (
                            <>
                              <Link to="/admin" onClick={handleNavLinkClick} className="flex items-center text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors px-3 py-2 rounded-md text-base font-medium" title="Admin Dashboard">
                                <AdminIcon className="w-5 h-5 mr-2" /> <span>Manage Reports</span>
                              </Link>
                              <Link to="/admin/users" onClick={handleNavLinkClick} className="flex items-center text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors px-3 py-2 rounded-md text-base font-medium" title="User Management">
                                <UserGroupIcon className="w-5 h-5 mr-2" /> <span>Manage Users</span>
                              </Link>
                              <Link to="/admin/advertisement" onClick={handleNavLinkClick} className="flex items-center text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors px-3 py-2 rounded-md text-base font-medium" title="Manage Advertisement">
                                <MegaphoneIcon className="w-5 h-5 mr-2" /> <span>Manage Ad</span>
                              </Link>
                            </>
                        )}
                        <button onClick={handleLogout} className="w-full text-left flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium transition-colors">
                          <LogoutIcon className="w-5 h-5 mr-2" /> Logout
                        </button>
                      </>
                  ) : (
                      <>
                        <button onClick={() => handleMobileButtonClick(onLoginClick)} className="w-full text-left flex items-center text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors">
                          <LoginIcon className="w-5 h-5 mr-2" /> Login
                        </button>
                        <button onClick={() => handleMobileButtonClick(onSignUpClick)} className="w-full text-left flex items-center text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors">
                         <UserPlusIcon className="w-5 h-5 mr-2" /> Sign Up
                        </button>
                      </>
                  )}
                </div>
             </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
