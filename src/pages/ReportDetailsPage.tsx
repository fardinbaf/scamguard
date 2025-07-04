import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Report, ReportStatus, Comment as CommentType } from '../types';
import { 
  getReportById, 
  updateReportStatus as serviceUpdateReportStatus,
  deleteReport as serviceDeleteReport,
  getCommentsByReportId,
  addComment as serviceAddComment
} from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { REPORT_STATUS_OPTIONS } from '../constants';
import { TrashIcon, CommentIcon as CommentsSectionIcon, AttachmentIcon } from '../components/Icons';

// --- CommentEntry Component ---
interface CommentEntryProps {
  comment: CommentType;
}
const CommentEntry: React.FC<CommentEntryProps> = ({ comment }) => {
  const commentDate = new Date(comment.created_at).toLocaleString();
  const displayName = comment.is_anonymous ? "Anonymous" : comment.profiles?.identifier;
  return (
    <div className="bg-gray-50 p-3 rounded-md mb-3 shadow-sm">
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
      <p className="text-xs text-gray-500 mt-1">
        By: {displayName} on {commentDate}
      </p>
    </div>
  );
};


// --- ReportDetailsPage Component ---
const ReportDetailsPage: React.FC = () => {
  const { id: reportId } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchReportAndComments = useCallback(async () => {
    if (!reportId) {
      setError("Report ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedReport = await getReportById(reportId);
      if (fetchedReport) {
        setReport(fetchedReport);
        const fetchedComments = await getCommentsByReportId(reportId);
        setComments(fetchedComments);
      } else {
        setError("Report not found.");
      }
    } catch (err: any) {
      console.error("Failed to fetch report details:", err);
      setError("You may not have permission to view this report, or it does not exist.");
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReportAndComments();
  }, [fetchReportAndComments]);

  const handleStatusChange = async (newStatus: ReportStatus) => {
    if (!reportId || !report || !isAdmin) return;
    try {
      const updatedReport = await serviceUpdateReportStatus(reportId, newStatus);
      if (updatedReport) {
        setReport(prev => prev ? {...prev, status: updatedReport.status} : null);
        // Refetch everything to ensure comment section visibility is correct
        fetchReportAndComments();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status.");
    }
  };

  const handleDeleteReport = async () => {
    if (!reportId || !report || !isAdmin) return;
    if (window.confirm(`Are you sure you want to delete the report "${report.title}"?`)) {
      try {
        await serviceDeleteReport(reportId);
        alert(`Report "${report.title}" deleted successfully.`);
        navigate(isAdmin ? '/admin' : '/search'); 
      } catch (error) {
        console.error("Error deleting report:", error);
        alert("An error occurred while deleting the report.");
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentUser || !reportId || report?.status !== ReportStatus.APPROVED) return;
    
    setIsSubmittingComment(true);
    try {
      const addedComment = await serviceAddComment(reportId, newCommentText, postAnonymously);
      setComments(prevComments => [...prevComments, addedComment]);
      setNewCommentText('');
      setPostAnonymously(false);
    } catch (err) {
      console.error("Error submitting comment:", err);
      alert("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const timeAgo = (timestamp: string): string => new Date(timestamp).toLocaleString();
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  if (error) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-red-500 text-xl">{error}</p>
      <Link to="/" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Go to Homepage</Link>
    </div>
  );
  if (!report) return null;


  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:text-blue-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
        Back
      </button>
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 md:mb-0">{report.title}</h1>
          <StatusBadge status={report.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 text-sm text-gray-600">
          <p><strong>Target Type:</strong> <span className="font-medium text-gray-800">{report.targetType}</span></p>
          <p><strong>Category:</strong> <span className="font-medium text-gray-800">{report.category}</span></p>
          <p><strong>Reported By:</strong> <span className="font-mono text-gray-700">{report.reporterIdentifier || 'N/A'}</span></p>
          <p><strong>Reported On:</strong> {timeAgo(report.created_at)}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{report.description}</p>
        </div>

        {report.evidenceFiles && report.evidenceFiles.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2 flex items-center"><AttachmentIcon className="w-5 h-5 mr-2 text-gray-600"/> Evidence</h2>
            <ul className="space-y-2">
              {report.evidenceFiles.map((file) => (
                <li key={file.id} className="p-2 border rounded-md bg-gray-50">
                  <a href={file.publicURL} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">{file.originalName}</a>
                  <div className="text-xs text-gray-500">
                    Type: {file.mimeType} | Size: {formatBytes(file.size)}
                  </div>
                   {file.publicURL && file.mimeType && file.mimeType.startsWith('image/') && (
                    <img src={file.publicURL} alt={`Evidence preview for ${file.originalName}`} className="mt-2 max-w-xs max-h-48 rounded shadow"/>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.contactInfo && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Associated Contact Info</h2>
            <p className="text-gray-700">{report.contactInfo}</p>
          </div>
        )}

        {isAdmin && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Admin Actions</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="status-update" className="text-sm font-medium text-gray-700">Change Status:</label>
                <select id="status-update" value={report.status} onChange={(e) => handleStatusChange(e.target.value as ReportStatus)} className="px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  {REPORT_STATUS_OPTIONS.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                </select>
              </div>
              <button onClick={handleDeleteReport} className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <TrashIcon className="w-4 h-4 mr-1" /> Delete Report
              </button>
            </div>
          </div>
        )}
      </div>

      {report.status === ReportStatus.APPROVED && (
        <div className="mt-8 bg-white shadow-xl rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center"><CommentsSectionIcon className="w-6 h-6 mr-2 text-blue-600" /> Community Comments</h2>
          {comments.length > 0 ? (
            <div className="mb-6 max-h-96 overflow-y-auto pr-2">{comments.map(comment => <CommentEntry key={comment.id} comment={comment} />)}</div>
          ) : (
            <p className="text-gray-500 mb-6">No comments yet. Be the first to share your thoughts!</p>
          )}

          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit}>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Add Your Comment</h3>
              <textarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Share your experience..." required />
              <div className="mt-2 flex items-center">
                <input type="checkbox" id="postAnonymously" checked={postAnonymously} onChange={(e) => setPostAnonymously(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="postAnonymously" className="ml-2 block text-sm text-gray-700">Post anonymously</label>
              </div>
              <button type="submit" disabled={isSubmittingComment || !newCommentText.trim()} className="mt-3 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {isSubmittingComment ? <LoadingSpinner /> : 'Submit Comment'}
              </button>
            </form>
          ) : (
             <p className="text-gray-500">Please <button type="button" className="text-blue-600 hover:underline" onClick={() => {
                const loginButton = document.getElementById('global-login-button');
                if (loginButton) loginButton.click();
             }}>login</button> to add a comment.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportDetailsPage;
