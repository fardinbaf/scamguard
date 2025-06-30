export interface User {
  id: string;
  identifier: string; // Email or phone number
  isAdmin: boolean;
  isBanned: boolean;
  isVerified: boolean;
}

export enum ReportStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export enum TargetType {
  BUSINESS = "Business",
  PERSON = "Person",
  COMPANY = "Company",
  WEBSITE = "Website",
  OTHER = "Other",
}

export enum ReportCategory {
  SCAM = "Scam",
  SPAM = "Spam",
  PHISHING = "Phishing",
  MALWARE = "Malware",
}

export interface EvidenceFile {
  id: string;
  filePath: string; // Path to the file on the server
  originalName: string;
  mimeType: string;
  size: number;
}

export interface Report {
  id: string;
  title: string;
  targetType: TargetType;
  category: ReportCategory;
  description: string;
  reportedById: string; // User ID
  reporterIdentifier?: string;
  createdAt: number; // Timestamp
  status: ReportStatus;
  evidenceFiles: EvidenceFile[]; // Now uses the new EvidenceFile type
  contactInfo?: string;
}

export interface ReportFilters {
  targetType?: TargetType | "All Types";
  category?: ReportCategory | "All Categories";
  status?: ReportStatus | "All Statuses";
  keyword?: string;
}

export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  userIdentifier: string;
  text: string;
  createdAt: number;
  isAnonymous: boolean;
}

export interface AdvertisementConfig {
  imageUrl?: string;
  targetUrl?: string;
  isEnabled: boolean;
}
