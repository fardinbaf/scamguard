import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Report } from '../types';
import { updateUserProfile } from '../services/authService';
import { getReportsByUserId } from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import { CameraIcon, UserCircleIcon } from '../components/Icons';
import ReportList from '../components/ReportList';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { currentUser, refreshUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(currentUser?.avatarUrl || null);
  
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingReports, setIsFetchingReports] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
    setFullName(currentUser?.fullName || '');
    setPhoneNumber(currentUser?.phoneNumber || '');
    setPreviewImage(currentUser?.avatarUrl || null);
  }, [isAuthenticated, navigate, currentUser]);

  const fetchUserReports = useCallback(async () => {
    if (!currentUser) return;
    setIsFetchingReports(true);
    try {
      const userReports = await getReportsByUserId(currentUser.id);
      setReports(userReports);
    } catch (err) {
      console.error("Failed to fetch user reports:", err);
    } finally {
      setIsFetchingReports(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserReports();
  }, [fetchUserReports]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('User not found.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateUserProfile(
        currentUser.id,
        { fullName, phoneNumber },
        avatarFile
      );
      await refreshUser(); // This will update the user in AuthContext
      setSuccessMessage('Profile updated successfully!');
      setAvatarFile(null); // Clear file input after upload
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };
  
  if (!currentUser) {
    return (
        <div className="flex justify-center items-center h-screen">
             <div className="text-center">
                <p className="text-xl text-gray-600">Loading profile...</p>
                <LoadingSpinner />
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Profile Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-200" />
                  ) : (
                    <UserCircleIcon className="w-32 h-32 text-gray-300" />
                  )}
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                    <CameraIcon className="w-5 h-5" />
                    <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                <p className="text-lg font-medium text-gray-700">{currentUser.identifier}</p>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
              {successMessage && <p className="text-green-600 text-sm bg-green-100 p-3 rounded-md">{successMessage}</p>}

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g., +1 555-555-5555" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {isLoading ? <LoadingSpinner /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Activity History */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Submitted Reports</h2>
            <div className="border-t border-gray-200 pt-4">
              <ReportList reports={reports} isLoading={isFetchingReports} emptyMessage="You have not submitted any reports yet." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
