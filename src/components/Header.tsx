import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../constants';
import { ShieldIcon, LoginIcon, UserPlusIcon, LogoutIcon, AdminIcon, UserGroupIcon, MegaphoneIcon } from './Icons';

interface HeaderProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignUpClick }) => {
  const { isAuthenticated, isAdmin, logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-blue-600">
          <ShieldIcon className="w-8 h-8 text-blue-600" />
          <span>{APP_NAME}</span>
        </Link>
        <nav className="flex items-center space-x-2 md:space-x-4">
          <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/search" className="text-gray-600 hover:text-blue-600 transition-colors">Search Reports</Link>
          {isAuthenticated && (
             <button
                onClick={(e) => {
                  e.preventDefault(); 
                  const reportButton = document.getElementById('global-report-scam-button');
                  if(reportButton) reportButton.click(); 
                }}
                className="text-gray-600 hover:text-blue-600 transition-colors">
                Report Scam
              </button>
          )}
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <>
                  <Link to="/admin" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors" title="Admin Dashboard">
                    <AdminIcon className="w-5 h-5 mr-1" />
                    <span className="hidden sm:inline">Reports</span>
                  </Link>
                  <Link to="/admin/users" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors" title="User Management">
                    <UserGroupIcon className="w-5 h-5 mr-1" />
                    <span className="hidden sm:inline">Users</span>
                  </Link>
                  <Link to="/admin/advertisement" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors" title="Manage Advertisement">
                    <MegaphoneIcon className="w-5 h-5 mr-1" />
                    <span className="hidden sm:inline">Ad</span>
                  </Link>
                </>
              )}
              <span className="text-gray-700 hidden sm:inline">Hi, {currentUser?.identifier.split('@')[0]}</span>
              <button
                onClick={handleLogout}
                className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <LogoutIcon className="w-5 h-5 mr-1" /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <LoginIcon className="w-5 h-5 mr-1" /> Login
              </button>
              <button
                onClick={onSignUpClick}
                className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
               <UserPlusIcon className="w-5 h-5 mr-1" /> Sign Up
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;