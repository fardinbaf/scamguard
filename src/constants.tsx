import { ReportCategory, ReportStatus, TargetType } from './types';

export const APP_NAME = "ScamGuard";
export const DESIGNATED_ADMIN_EMAIL = 'fardinbaf@gmail.com';

export const TARGET_TYPES_OPTIONS = Object.values(TargetType);
export const REPORT_CATEGORY_OPTIONS = Object.values(ReportCategory);
export const REPORT_STATUS_OPTIONS = [ReportStatus.PENDING, ReportStatus.APPROVED, ReportStatus.REJECTED];
