
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdvertisementConfig } from '../types';
import { getAdvertisementConfig, saveAdvertisementConfig } from '../services/advertisementService';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminAdvertisementPage: React.FC = () => {
  const [adConfig, setAdConfig] = useState<AdvertisementConfig>(getAdvertisementConfig());
  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | undefined>(adConfig.imageUrl);

  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setAdConfig(prev => ({ ...prev, [name]: checked }));
    } else {
      setAdConfig(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMessage(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB for base64
        setError("Image size should not exceed 2MB.");
        setPreviewImage(adConfig.imageUrl); // Revert to old or no preview
        e.target.value = ''; // Clear the input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdConfig(prev => ({ ...prev, imageUrl: reader.result as string }));
        setPreviewImage(reader.result as string);
      };
      reader.onerror = () => {
        setError("Failed to read image file.");
        setPreviewImage(adConfig.imageUrl);
      }
      reader.readAsDataURL(file);
    } else {
      // If no file selected, or selection cleared
      setAdConfig(prev => ({ ...prev, imageUrl: undefined }));
      setPreviewImage(undefined);
    }
  };
  
  const handleRemoveImage = () => {
    setAdConfig(prev => ({ ...prev, imageUrl: undefined }));
    setPreviewImage(undefined);
    const fileInput = document.getElementById('imageUrl') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setSuccessMessage("Image removed. Save changes to make it permanent.");
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      if (adConfig.isEnabled && (!adConfig.imageUrl || !adConfig.targetUrl?.trim())) {
        setError("If the advertisement is enabled, both an image and a target URL are required.");
        setIsLoading(false);
        return;
      }
      saveAdvertisementConfig(adConfig);
      setSuccessMessage('Advertisement configuration saved successfully!');
    } catch (err) {
      console.error("Failed to save ad config:", err);
      setError('Failed to save configuration.');
    } finally {
      setIsLoading(false);
       setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }
   if (!isAdmin) {
    return <div className="text-center p-8">Access Denied.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Manage Advertisement</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
        {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm bg-green-100 p-3 rounded-md">{successMessage}</p>}

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Advertisement Image (Max 2MB, e.g., PNG, JPG)
          </label>
          <input
            type="file"
            id="imageUrl"
            name="imageUrl"
            accept="image/png, image/jpeg, image/gif, image/webp"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {previewImage && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Image Preview:</h4>
              <img src={previewImage} alt="Advertisement Preview" className="max-w-xs max-h-48 border rounded shadow" />
              <button 
                type="button" 
                onClick={handleRemoveImage}
                className="mt-2 text-xs text-red-600 hover:text-red-800"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700">
            Target URL (e.g., https://example.com/offer)
          </label>
          <input
            type="url"
            id="targetUrl"
            name="targetUrl"
            value={adConfig.targetUrl || ''}
            onChange={handleInputChange}
            placeholder="https://..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex items-center">
          <input
            id="isEnabled"
            name="isEnabled"
            type="checkbox"
            checked={adConfig.isEnabled}
            onChange={handleInputChange}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isEnabled" className="ml-2 block text-sm font-medium text-gray-900">
            Enable Advertisement on Homepage
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner /> : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
};

export default AdminAdvertisementPage;