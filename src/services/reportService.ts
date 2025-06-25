
import { Report, ReportStatus, TargetType, ReportCategory, ReportFilters, User, Comment, EvidenceFile } from '../types';
import { getCurrentUser } from './authService'; // Import getCurrentUser to check admin status

const REPORTS_KEY = 'scamguard_reports';
const COMMENTS_KEY = 'scamguard_comments';

const getInitialReports = (): Report[] => [
  {
    id: '1',
    title: 'Fake Investment Website "InvestMax"',
    targetType: TargetType.WEBSITE,
    category: ReportCategory.SCAM,
    description: 'This website promises unrealistic returns on investment. They ask for upfront fees and then disappear. The UI looks professional but the contact info is fake.',
    reportedBy: 'initial_user_1',
    reporterIdentifier: 'user1@example.com',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // approx 1 month ago
    status: ReportStatus.APPROVED, // Initial reports are approved for demo
    evidenceFiles: [{ name: 'screenshot-investmax.jpg', type: 'image/jpeg', size: 102400 }], // Example file
  },
  {
    id: '2',
    title: 'Spam SMS about Lottery Win',
    targetType: TargetType.PERSON, 
    category: ReportCategory.SPAM,
    description: 'Received an SMS claiming I won a lottery I never entered. Asks to click a suspicious link to claim the prize.',
    reportedBy: 'initial_user_2',
    reporterIdentifier: 'user2@example.com',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    status: ReportStatus.PENDING, // This one is pending
    contactInfo: 'SMS from +1234567890',
    evidenceFiles: [],
  },
  {
    id: '3',
    title: 'Phishing Email from "Bank of Trust"',
    targetType: TargetType.COMPANY, 
    category: ReportCategory.PHISHING,
    description: 'Email looked like it was from my bank, asking me to update my login details via a link. The link led to a fake login page.',
    reportedBy: 'initial_user_3',
    reporterIdentifier: 'user3@example.com',
    createdAt: Date.now() - 60 * 60 * 1000, // 1 hour ago
    status: ReportStatus.APPROVED, // Initial reports are approved for demo
    evidenceFiles: [],
  },
];

const getStoredReports = (): Report[] => {
  const reportsJson = localStorage.getItem(REPORTS_KEY);
  if (reportsJson) {
    return JSON.parse(reportsJson);
  } else {
    const initialReports = getInitialReports();
    localStorage.setItem(REPORTS_KEY, JSON.stringify(initialReports));
    return initialReports;
  }
};

const saveReports = (reports: Report[]) => {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
};

const getStoredComments = (): Comment[] => {
  const commentsJson = localStorage.getItem(COMMENTS_KEY);
  return commentsJson ? JSON.parse(commentsJson) : [];
};

const saveComments = (comments: Comment[]) => {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
};


export const getReports = async (filters?: ReportFilters): Promise<Report[]> => {
  let reports = getStoredReports();
  const currentUser = getCurrentUser(); // Check user role

  if (!currentUser?.isAdmin && (!filters?.status || filters.status === "All Statuses")) {
    reports = reports.filter(report => report.status === ReportStatus.APPROVED);
  }
  
  if (filters) {
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      reports = reports.filter(
        (report) =>
          report.title.toLowerCase().includes(keyword) ||
          report.description.toLowerCase().includes(keyword)
      );
    }
    if (filters.targetType && filters.targetType !== "All Types") {
      reports = reports.filter((report) => report.targetType === filters.targetType);
    }
    if (filters.category && filters.category !== "All Categories") {
      reports = reports.filter((report) => report.category === filters.category);
    }
    if (filters.status && filters.status !== "All Statuses") {
       if (currentUser?.isAdmin) {
         reports = reports.filter((report) => report.status === filters.status);
       } else { 
         if (filters.status === ReportStatus.APPROVED) {
            reports = reports.filter((report) => report.status === ReportStatus.APPROVED);
         } else { 
            reports = []; 
         }
       }
    }
  }
  return reports.sort((a,b) => b.createdAt - a.createdAt);
};

export const getReportById = async (id: string): Promise<Report | undefined> => {
  const reports = getStoredReports();
  const report = reports.find((report) => report.id === id);
  const currentUser = getCurrentUser();

  if (report && !currentUser?.isAdmin && report.status !== ReportStatus.APPROVED) {
    return undefined; 
  }
  return report;
};

// ReportData now includes evidenceFiles
export const addReport = async (
  reportData: Omit<Report, 'id' | 'createdAt' | 'reportedBy' | 'status' | 'reporterIdentifier'>, 
  reportingUser: User
): Promise<Report> => {
  const reports = getStoredReports();
  const newReport: Report = {
    ...reportData, // This includes title, targetType, category, description, evidenceFiles, contactInfo
    id: Date.now().toString(),
    createdAt: Date.now(),
    reportedBy: reportingUser.id,
    reporterIdentifier: reportingUser.identifier,
    status: ReportStatus.PENDING, 
  };
  reports.unshift(newReport); 
  saveReports(reports);
  return newReport;
};

export const updateReportStatus = async (id: string, status: ReportStatus): Promise<Report | null> => {
  const reports = getStoredReports();
  const reportIndex = reports.findIndex((report) => report.id === id);
  if (reportIndex > -1) {
    const originalStatus = reports[reportIndex].status;
    reports[reportIndex].status = status;
    saveReports(reports);
    
    // Simulate email notification if status changed and reporter identifier exists
    if (originalStatus !== status && reports[reportIndex].reporterIdentifier) {
      console.log(
        `SIMULATING EMAIL NOTIFICATION: 
        To: ${reports[reportIndex].reporterIdentifier}
        Subject: Your ScamGuard Report Status Updated
        Body: The status of your report titled "${reports[reportIndex].title}" has been updated to "${status}".
        Thank you for contributing to ScamGuard.`
      );
    }
    return reports[reportIndex];
  }
  return null;
};

export const deleteReport = async (id: string): Promise<boolean> => {
  let reports = getStoredReports();
  const initialLength = reports.length;
  reports = reports.filter(report => report.id !== id);
  
  if (reports.length < initialLength) {
    saveReports(reports);
    let comments = getStoredComments();
    comments = comments.filter(comment => comment.reportId !== id);
    saveComments(comments);
    return true;
  }
  return false;
};

// --- Comment Functions ---

export const getCommentsByReportId = async (reportId: string): Promise<Comment[]> => {
  const allComments = getStoredComments();
  return allComments
    .filter(comment => comment.reportId === reportId)
    .sort((a, b) => a.createdAt - b.createdAt); 
};

export const addComment = async (
  reportId: string, 
  text: string, 
  user: User,
  isAnonymous: boolean // New parameter
): Promise<Comment> => {
  const comments = getStoredComments();
  const newComment: Comment = {
    id: Date.now().toString(),
    reportId,
    userId: user.id,
    userIdentifier: isAnonymous ? "Anonymous" : user.identifier, // Set identifier based on anonymity
    text,
    createdAt: Date.now(),
    isAnonymous: isAnonymous,
  };
  comments.push(newComment);
  saveComments(comments);
  return newComment;
};