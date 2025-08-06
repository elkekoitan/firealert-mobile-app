import { RiskLevel, TimeRange } from '../types/enums';

export const formatRiskLevel = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case RiskLevel.LOW:
      return 'Düşük Risk';
    case RiskLevel.MEDIUM:
      return 'Orta Risk';
    case RiskLevel.HIGH:
      return 'Yüksek Risk';
    case RiskLevel.CRITICAL:
      return 'Kritik Risk';
    default:
      return 'Bilinmeyen Risk';
  }
};

export const formatTimeRange = (timeRange: TimeRange): string => {
  switch (timeRange) {
    case TimeRange.LAST_24H:
      return 'Son 24 Saat';
    case TimeRange.LAST_48H:
      return 'Son 48 Saat';
    case TimeRange.LAST_72H:
      return 'Son 72 Saat';
    default:
      return 'Bilinmeyen Zaman';
  }
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

export const formatConfidence = (confidence: number): string => {
  return `%${Math.round(confidence)}`;
};