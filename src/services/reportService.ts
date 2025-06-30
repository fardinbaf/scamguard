import { Report, ReportFilters, Comment, ReportStatus } from '../types';

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
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return null;
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  return data;
};

export const getReports = async (filters?: ReportFilters): Promise<Report[]> => {
  const params = new URLSearchParams();
  params.append('action', 'getReports');
  if (filters) {
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.targetType && filters.targetType !== 'All Types') params.append('targetType', filters.targetType);
    if (filters.category && filters.category !== 'All Categories') params.append('category', filters.category);
    if (filters.status && filters.status !== 'All Statuses') params.append('status', filters.status);
  }
  const response = await fetch(`${API_URL}/reports.php?${params.toString()}`, {
      headers: getAuthHeader()
  });
  return handleResponse(response);
};

export const getReportById = async (id: string): Promise<Report | undefined> => {
  const response = await fetch(`${API_URL}/reports.php?action=getReportById&id=${id}`, {
      headers: getAuthHeader()
  });
  return handleResponse(response);
};

export const addReport = async (formData: FormData): Promise<Report> => {
  // The form data from the component already has the fields. We just add the action.
  formData.append('action', 'addReport');
  
  const response = await fetch(`${API_URL}/reports.php`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });
  return handleResponse(response);
};

export const updateReportStatus = async (id: string, status: ReportStatus): Promise<Report | null> => {
  const formData = new FormData();
  formData.append('action', 'updateStatus');
  formData.append('reportId', id);
  formData.append('status', status);

  const response = await fetch(`${API_URL}/reports.php`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });
  return handleResponse(response);
};

export const deleteReport = async (id: string): Promise<boolean> => {
  const formData = new FormData();
  formData.append('action', 'deleteReport');
  formData.append('reportId', id);

  const response = await fetch(`${API_URL}/reports.php`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });
  return response.ok;
};

// --- Comment Functions ---

export const getCommentsByReportId = async (reportId: string): Promise<Comment[]> => {
  const response = await fetch(`${API_URL}/reports.php?action=getComments&reportId=${reportId}`);
  return handleResponse(response);
};

export const addComment = async (
  reportId: string, 
  text: string, 
  isAnonymous: boolean
): Promise<Comment> => {
  const formData = new FormData();
  formData.append('action', 'addComment');
  formData.append('reportId', reportId);
  formData.append('text', text);
  formData.append('isAnonymous', String(isAnonymous));

  const response = await fetch(`${API_URL}/reports.php`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });
  return handleResponse(response);
};
