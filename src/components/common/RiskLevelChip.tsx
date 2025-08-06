import React from 'react';
import { Chip } from 'react-native-paper';
import { RiskLevel } from '../../types/enums';
import { formatRiskLevel } from '../../utils/stringFormatters';

interface RiskLevelChipProps {
  riskLevel: RiskLevel;
  mode?: 'flat' | 'outlined';
  size?: 'small' | 'medium';
}

export const RiskLevelChip: React.FC<RiskLevelChipProps> = ({ 
  riskLevel, 
  mode = 'outlined',
  size = 'medium'
}) => {
  const getRiskColor = (level: RiskLevel): string => {
    switch (level) {
      case RiskLevel.LOW: return '#4CAF50';
      case RiskLevel.MEDIUM: return '#FF9800';
      case RiskLevel.HIGH: return '#FF5722';
      case RiskLevel.CRITICAL: return '#D32F2F';
      default: return '#757575';
    }
  };

  const color = getRiskColor(riskLevel);

  return (
    <Chip 
      mode={mode}
      compact={size === 'small'}
      textStyle={{ 
        color: mode === 'outlined' ? color : '#FFFFFF',
        fontSize: size === 'small' ? 12 : 14,
        fontWeight: '500'
      }}
      style={{ 
        borderColor: color,
        backgroundColor: mode === 'flat' ? color : 'transparent'
      }}
    >
      {formatRiskLevel(riskLevel)}
    </Chip>
  );
};