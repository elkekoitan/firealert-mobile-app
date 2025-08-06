export interface User {
  id: string;
  email: string;
  firstName?: string; // Supabase profiles tablosundaki first_name ile eşleşir
  lastName?: string;  // Supabase profiles tablosundaki last_name ile eşleşir
  name?: string; // firstName ve lastName'den türetilebilir, isteğe bağlı
  avatarUrl?: string; // Supabase profiles tablosundaki avatar_url ile eşleşir
  reliabilityScore: number;
  totalReports: number;
  verifiedReports: number;
  createdAt: string;
  updatedAt?: string; // Yeni eklendi
  isVerified: boolean;
}

export interface FireReport {
  id: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  images: string[];
  description: string;
  aiAnalysis: {
    confidence: number;
    detectedElements: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    isLikelyFire: boolean;
  };
  status: 'PENDING' | 'VERIFIED' | 'FALSE_ALARM' | 'RESOLVED';
  reportedAt: string;
  verifiedAt?: string;
  emergency112Notified: boolean;
  satelliteData?: SatelliteData;
}

export interface SatelliteData {
  source: 'NASA_FIRMS' | 'MODIS' | 'VIIRS';
  confidence: number;
  brightness: number;
  acquisitionDate: string;
  distance: number; // km from reported location
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'FIRE_ALERT' | 'VERIFICATION' | 'EMERGENCY' | 'SYSTEM';
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}