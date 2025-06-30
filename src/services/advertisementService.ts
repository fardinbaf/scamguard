import { AdvertisementConfig } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

// Helper to get authorization token from cookie
const getAuthHeader = () => {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  return data;
};

export const getAdvertisementConfig = async (): Promise<AdvertisementConfig> => {
  const response = await fetch(`${API_URL}/advertisement.php?action=getConfig`);
  return handleResponse(response);
};

export const saveAdvertisementConfig = async (formData: FormData): Promise<AdvertisementConfig> => {
  formData.append('action', 'saveConfig');
  const response = await fetch(`${API_URL}/advertisement.php`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });
  return handleResponse(response);
};
