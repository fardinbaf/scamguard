import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdvertisementConfig } from '../types';
import { getAdvertisementConfig, saveAdvertisementConfig } from '../services/advertisementService';
import LoadingSpinner from '../components/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || '';

const AdminAdvertisementPage: React.FC = () => {
  const [adConfig, setAdConfig] = useState<AdvertisementConfig>({ isEnabled: false });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);

  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchConfig = useCallback(async () => {
    try {
      const config = await getAdvertisementConfig();
      setAdConfig(config);
      if (config.imageUrl) {
        setPreviewImage(`${API_URL}/${config.imageUrl}`);
      }
    } catch (err) {
      console.error("Failed to fetch ad config", err);
      setError("Could not load advertisement configuration.");
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate('/');
    } else {
      fetchConfig();
    }
  }, [isAdmin, navigate, authLoading, fetchConfig]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAdConfig(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        setError("Image size should not exceed 2MB.");
        return;
      }
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  
  const handleRemoveImage = () => {
    setAdConfig(prev => ({ ...prev, imageUrl: undefined }));
    setPreviewImage(undefined);
    setImageFile(null);
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setSuccessMessage("Image removed. Save changes to make it permanent.");
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      if (adConfig.isEnabled && (!previewImage)) {
          setError("An image is required if the advertisement is enabled.");
          setIsLoading(false);
          return;
      }
       if (adConfig.isEnabled && !adConfig.targetUrl?.trim()) {
        setError("A target URL is required if the advertisement is enabled.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('isEnabled', String(adConfig.isEnabled));
      formData.append('targetUrl', adConfig.targetUrl || '');
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (previewImage === undefined) {
        // This signifies that the user removed the image.
        formData.append('removeImage', 'true');
      }

      const updatedConfig = await saveAdvertisementConfig(formData);
      setAdConfig(updatedConfig);
      if (updatedConfig.imageUrl) {
        setPreviewImage(`${API_URL}/${updatedConfig.imageUrl}`);
      } else {
        setPreviewImage(undefined);
      }
      setSuccessMessage('Advertisement configuration saved successfully!');
      if(imageFile) setImageFile(null); // Clear file after successful upload
    } catch (err: any) {
      console.error("Failed to save ad config:", err);
      setError(err.message || 'Failed to save configuration.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Manage Advertisement</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6 max-w-2xl mx-auto">
        {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm bg-green-100 p-3 rounded-md">{successMessage}</p>}

        <div>
          <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">
            Advertisement Image (Max 2MB)
          </label>
          <input type="file" id="imageUpload" name="image" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {previewImage && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Image Preview:</h4>
              <img src={previewImage} alt="Advertisement Preview" className="max-w-xs max-h-48 border rounded shadow" />
              <button type="button" onClick={handleRemoveImage} className="mt-2 text-xs text-red-600 hover:text-red-800">Remove Image</button>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700">
            Target URL (e.g., https://example.com)
          </label>
          <input type="url" id="targetUrl" name="targetUrl" value={adConfig.targetUrl || ''} onChange={handleInputChange} placeholder="https://..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>

        <div className="flex items-center">
          <input id="isEnabled" name="isEnabled" type="checkbox" checked={adConfig.isEnabled} onChange={handleInputChange} className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <label htmlFor="isEnabled" className="ml-2 block text-sm font-medium text-gray-900">Enable Advertisement</label>
        </div>

        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
          {isLoading ? <LoadingSpinner /> : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
};

export default AdminAdvertisementPage;