// Represents the user profile stored in the 'profiles' table.
export interface User {
  id: string; // Corresponds to auth.users.id
  identifier: string; // email
  isAdmin: boolean;
  isBanned: boolean;
  isVerified?: boolean; // This can be derived from Supabase's user object if needed.
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
  filePath: string; // Path in Supabase Storage
  originalName: string;
  mimeType: string;
  size: number;
  publicURL?: string; // To store the public URL for display
}

export interface Report {
  id: string;
  title: string;
  targetType: TargetType;
  category: ReportCategory;
  description: string;
  reported_by_id: string; // User ID from Supabase Auth
  created_at: string; // ISO 8601 timestamp string
  status: ReportStatus;
  contactInfo?: string;
  // Joined data
  evidenceFiles?: EvidenceFile[];
  reporterIdentifier?: string; // email of the reporter
}

export interface ReportFilters {
  targetType?: TargetType | "All Types";
  category?: ReportCategory | "All Categories";
  status?: ReportStatus | "All Statuses";
  keyword?: string;
}

export interface Comment {
  id: string;
  report_id: string;
  user_id: string;
  text: string;
  created_at: string; // ISO 8601 timestamp string
  is_anonymous: boolean;
  // Joined data
  profiles?: { identifier: string }; // To get user identifier
}

export interface AdvertisementConfig {
  id?: number;
  image_url?: string;
  target_url?: string;
  is_enabled: boolean;
  publicURL?: string; // To store the public URL for display
}