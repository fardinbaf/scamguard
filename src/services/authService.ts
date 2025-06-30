import { User } from '../types';

export interface UserCredentials {
  identifier: string; // Email or phone
  password?: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

const handleResponse = async (response: Response) => {
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return null;
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  return data;
};

// Helper to get authorization token from cookie
const getAuthHeader = () => {
    // This is a simplified cookie parser.
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}


export const signupUser = async (credentials: UserCredentials): Promise<User | null> => {
  const formData = new FormData();
  formData.append('action', 'signup');
  formData.append('identifier', credentials.identifier);
  formData.append('password', credentials.password || '');

  const response = await fetch(`${API_URL}/auth.php`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
};

export const verifyUser = async (identifier: string, verificationCode: string): Promise<User | null> => {
  const formData = new FormData();
  formData.append('action', 'verify');
  formData.append('identifier', identifier);
  formData.append('verificationCode', verificationCode);
  
  const response = await fetch(`${API_URL}/auth.php`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
};

export const loginUser = async (credentials: UserCredentials): Promise<User | null> => {
  const formData = new FormData();
  formData.append('action', 'login');
  formData.append('identifier', credentials.identifier);
  formData.append('password', credentials.password || '');

  const response = await fetch(`${API_URL}/auth.php`, {
    method: 'POST',
    body: formData,
  });
  // The PHP script sets the cookie, so we just handle the response
  return handleResponse(response);
};

export const logoutUser = async (): Promise<void> => {
  const formData = new FormData();
  formData.append('action', 'logout');

  await fetch(`${API_URL}/auth.php`, { 
      method: 'POST',
      body: formData
  });
};

export const getCurrentUser = async (): Promise<User | null> => {
  const response = await fetch(`${API_URL}/auth.php?action=me`, {
      headers: getAuthHeader()
  });
  return handleResponse(response);
};

export const requestPasswordReset = async (identifier: string): Promise<void> => {
    const formData = new FormData();
    formData.append('action', 'requestPasswordReset');
    formData.append('identifier', identifier);
    
    const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        body: formData,
    });
    await handleResponse(response);
};

// --- User Management Functions (for Admins) ---
export const getAllUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/users.php?action=getAllUsers`, {
      headers: getAuthHeader()
  });
  return handleResponse(response);
};

export const updateUserRole = async (userId: string, isAdmin: boolean): Promise<User | null> => {
    const formData = new FormData();
    formData.append('action', 'updateRole');
    formData.append('userId', userId);
    formData.append('isAdmin', String(isAdmin));

    const response = await fetch(`${API_URL}/users.php`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
    });
    return handleResponse(response);
};

export const updateUserBanStatus = async (userId: string, isBanned: boolean): Promise<User | null> => {
    const formData = new FormData();
    formData.append('action', 'updateBanStatus');
    formData.append('userId', userId);
    formData.append('isBanned', String(isBanned));

    const response = await fetch(`${API_URL}/users.php`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
    });
    return handleResponse(response);
};

export const deleteUser = async (userId: string): Promise<boolean> => {
    const formData = new FormData();
    formData.append('action', 'deleteUser');
    formData.append('userId', userId);
    
    const response = await fetch(`${API_URL}/users.php`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
    });
    return response.ok;
};
