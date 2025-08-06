import { RiskLevel, ReportStatus, NotificationType } from '../types/enums';

// Mock user data for development
export const mockUser = {
  id: '1',
  email: 'test@firealert.com',
  name: 'Test User',
  phone: '+90 555 123 4567',
  reliabilityScore: 85,
  totalReports: 12,
  verifiedReports: 10,
  createdAt: '2024-01-15T10:30:00Z',
  isVerified: true
} as const;

// Mock fire reports for development
export const mockReports = [
  {
    id: '1',
    userId: '1',
    userName: 'Test User',
    latitude: 39.9334,
    longitude: 32.8597,
    images: ['https://example.com/fire1.jpg'],
    description: 'Orman yangını görüldü, duman yoğun',
    aiAnalysis: {
      confidence: 92,
      detectedElements: ['smoke', 'fire', 'vegetation'],
      riskLevel: RiskLevel.HIGH,
      isLikelyFire: true
    },
    status: ReportStatus.VERIFIED,
    reportedAt: '2024-01-20T14:30:00Z',
    verifiedAt: '2024-01-20T14:35:00Z',
    emergency112Notified: true
  },
  {
    id: '2', 
    userId: '2',
    userName: 'Another User',
    latitude: 40.7589,
    longitude: 29.9167,
    images: ['https://example.com/fire2.jpg'],
    description: 'Küçük yangın başlangıcı tespit edildi',
    aiAnalysis: {
      confidence: 78,
      detectedElements: ['smoke', 'vegetation'],
      riskLevel: RiskLevel.MEDIUM,
      isLikelyFire: true
    },
    status: ReportStatus.PENDING,
    reportedAt: '2024-01-20T16:15:00Z',
    emergency112Notified: false
  }
] as const;

// Mock notifications for development
export const mockNotifications = [
  {
    id: '1',
    title: 'Kritik Yangın Uyarısı',
    body: 'Yakınınızda yüksek riskli yangın raporu alındı',
    type: NotificationType.FIRE_ALERT,
    data: { reportId: '1' },
    read: false,
    createdAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    title: 'Rapor Doğrulandı',
    body: 'Gönderdiğiniz rapor yetkililerce doğrulandı',
    type: NotificationType.VERIFICATION,
    data: { reportId: '2' },
    read: true,
    createdAt: '2024-01-20T13:45:00Z'
  }
] as const;

// Root props for the main app component
export const mockRootProps = {
  initialRoute: 'Main' as const,
  theme: 'light' as const,
  environment: 'development' as const
};