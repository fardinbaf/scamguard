import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { useAuth } from '../hooks/useAuth';
import { Report, ReportCategory, TargetType, EvidenceFile } from '../types';
import { addReport as saveReport } from '../services/reportService';
import { TARGET_TYPES_OPTIONS, REPORT_CATEGORY_OPTIONS } from '../constants'; // RECAPTCHA_SITE_KEY removed
import LoadingSpinner from './LoadingSpinner';
// import ReCAPTCHA from 'react-google-recaptcha'; // Removed

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: (newReport: Report) => void;
}

const MAX_DATA_URL_SIZE_BYTES = 500 * 1024; // 500KB for storing base64

const ReportFormModal: React.FC<ReportFormModalProps> = ({ isOpen, onClose, onReportSubmitted }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<TargetType>(TargetType.WEBSITE);
  const [category, setCategory] = useState<ReportCategory>(ReportCategory.SCAM);
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [contactInfo, setContactInfo] = useState('');
  // const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null); // Removed
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const recaptchaRef = useRef<ReCAPTCHA>(null); // Removed

  const resetForm = () => {
    setTitle('');
    setTargetType(TargetType.WEBSITE);
    setCategory(ReportCategory.SCAM);
    setDescription('');
    setSelectedFiles([]);
    setContactInfo('');
    // setRecaptchaToken(null); // Removed
    // recaptchaRef.current?.reset(); // Removed
    setError('');
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
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
    // if (!recaptchaToken) { // Removed
    //   setError('Please complete the reCAPTCHA verification.'); // Removed
    //   return; // Removed
    // } // Removed
    setError('');
    setIsLoading(true);

    const evidenceFilesPromises = selectedFiles.map(file => {
      return new Promise<EvidenceFile>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = (file.type.startsWith('image/') && file.size < MAX_DATA_URL_SIZE_BYTES) 
                          ? e.target?.result as string 
                          : undefined;
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: dataUrl
          });
        };
        reader.onerror = reject;
        if (file.type.startsWith('image/') && file.size < MAX_DATA_URL_SIZE_BYTES) {
          reader.readAsDataURL(file); 
        } else {
           resolve({ name: file.name, type: file.type, size: file.size });
        }
      });
    });

    try {
      const evidenceFiles = await Promise.all(evidenceFilesPromises);
      const reportData: Omit<Report, 'id' | 'createdAt' | 'reportedBy' | 'status' | 'reporterIdentifier'> = {
        title,
        targetType,
        category,
        description,
        evidenceFiles, 
        contactInfo: contactInfo.trim() || undefined,
      };

      const newReport = await saveReport(reportData, currentUser);
      onReportSubmitted(newReport);
      onClose(); 
    } catch (err) {
      console.error("Failed to submit report or process files:", err);
      setError('Failed to submit report. Please try again.');
      // setRecaptchaToken(null); // Removed
      // recaptchaRef.current?.reset(); // Removed
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
          <label htmlFor="report-evidence-files" className="block text-sm font-medium text-gray-700">Evidence Attachments (jpg, png, pdf)</label>
          <input 
            type="file" 
            id="report-evidence-files" 
            multiple 
            onChange={handleFileChange} 
            accept=".jpg,.jpeg,.png,.pdf"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFiles.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              Selected: {selectedFiles.map(f => f.name).join(', ')}
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="report-contact" className="block text-sm font-medium text-gray-700">Relevant Contact Info (e.g., phone, email)</label>
          <input type="text" id="report-contact" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        
        {/* ReCAPTCHA component removed */}
        {/*
        <div className="flex justify-center my-3">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={(token) => setRecaptchaToken(token)}
              onExpired={() => setRecaptchaToken(null)}
               onErrored={() => {
                setError("reCAPTCHA error. Please try again.");
                setRecaptchaToken(null);
              }}
            />
        </div>
        */}

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
