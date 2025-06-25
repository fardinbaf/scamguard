
export interface User {
  id: string;
  identifier: string; // Email or phone number
  isAdmin: boolean;
  isBanned?: boolean; // Optional: for user banning
  isVerified?: boolean; // For email/phone verification simulation
}

export enum ReportStatus {
  PENDING = "Pending",     // User submitted, awaiting admin review
  APPROVED = "Approved",   // Admin reviewed and approved, publicly visible
  REJECTED = "Rejected",   // Admin reviewed and rejected, not public
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
  name: string;
  type: string;
  size: number;
  dataUrl?: string; // For small images, store base64 data. Optional.
}

export interface Report {
  id: string;
  title: string;
  targetType: TargetType;
  category: ReportCategory;
  description: string;
  reportedBy: string; // User ID
  reporterIdentifier?: string; // To display who reported it, if needed
  createdAt: number; // Timestamp
  status: ReportStatus;
  evidenceFiles?: EvidenceFile[]; // Changed from evidenceLinks
  contactInfo?: string; // Optional contact info related to scam
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
  userIdentifier: string; // To display who commented, or "Anonymous"
  text: string;
  createdAt: number; // Timestamp
  isAnonymous?: boolean; // For anonymous comments
}

export interface AdvertisementConfig {
  imageUrl?: string;    // Base64 encoded image data
  targetUrl?: string;   // URL the ad links to
  isEnabled: boolean;  // Whether the ad is active
}