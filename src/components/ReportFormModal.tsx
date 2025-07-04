import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAuth } from '../hooks/useAuth';
import { Report, ReportCategory, TargetType } from '../types';
import { addReport as saveReport } from '../services/reportService';
import { TARGET_TYPES_OPTIONS, REPORT_CATEGORY_OPTIONS } from '../constants';
import LoadingSpinner from './LoadingSpinner';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: (newReport: Report) => void;
}

const ReportFormModal: React.FC<ReportFormModalProps> = ({ isOpen, onClose, onReportSubmitted }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<TargetType>(TargetType.WEBSITE);
  const [category, setCategory] = useState<ReportCategory>(ReportCategory.SCAM);
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [contactInfo, setContactInfo] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setTargetType(TargetType.WEBSITE);
    setCategory(ReportCategory.SCAM);
    setDescription('');
    setSelectedFiles([]);
    setContactInfo('');
    setError('');
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      if (Array.from(event.target.files).length > 5) {
        setError("You can upload a maximum of 5 files.");
        event.target.value = ''; // Clear the input
        return;
      }
      setSelectedFiles(Array.from(event.target.files));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to submit a report.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError('Title and Description are required.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('targetType', targetType);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('contactInfo', contactInfo);

    selectedFiles.forEach(file => {
      formData.append('evidence', file);
    });

    try {
      const newReport = await saveReport(formData);
      onReportSubmitted(newReport);
      onClose(); 
    } catch (err: any) {
      console.error("Failed to submit report:", err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose();}} title="Report a Scam/Spam">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
        
        <div>
          <label htmlFor="report-title" className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" id="report-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>

        <div>
          <label htmlFor="report-targetType" className="block text-sm font-medium text-gray-700">Target Type</label>
          <select id="report-targetType" value={targetType} onChange={(e) => setTargetType(e.target.value as TargetType)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            {TARGET_TYPES_OPTIONS.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="report-category" className="block text-sm font-medium text-gray-700">Category</label>
          <select id="report-category" value={category} onChange={(e) => setCategory(e.target.value as ReportCategory)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            {REPORT_CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="report-description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="report-description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
        </div>

        <div>
          <label htmlFor="report-evidence-files" className="block text-sm font-medium text-gray-700">Evidence Attachments (Max 5 files)</label>
          <input 
            type="file" 
            id="report-evidence-files" 
            multiple 
            onChange={handleFileChange} 
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFiles.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              Selected: {selectedFiles.map(f => f.name).join(', ')}
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="report-contact" className="block text-sm font-medium text-gray-700">Relevant Contact Info (e.g., phone, email, website)</label>
          <input type="text" id="report-contact" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner /> : 'Submit Report'}
        </button>
      </form>
    </Modal>
  );
};

export default ReportFormModal;