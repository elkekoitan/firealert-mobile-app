// Risk levels for fire reports
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Report status types
export enum ReportStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FALSE_ALARM = 'FALSE_ALARM',
  RESOLVED = 'RESOLVED'
}

// Notification types
export enum NotificationType {
  FIRE_ALERT = 'FIRE_ALERT',
  VERIFICATION = 'VERIFICATION',
  EMERGENCY = 'EMERGENCY',
  SYSTEM = 'SYSTEM'
}

// Time range filters
export enum TimeRange {
  LAST_24H = '24h',
  LAST_48H = '48h', 
  LAST_72H = '72h'
}

// Environment types
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

// Permission types
export enum PermissionType {
  CAMERA = 'camera',
  LOCATION = 'location',
  NOTIFICATIONS = 'notifications',
  MEDIA_LIBRARY = 'media_library'
}