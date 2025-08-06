import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Surface } from 'react-native-paper';
import { mockReports } from '../../data/fireAlertMockData';
import { formatDate } from '../../utils/stringFormatters';
import { RiskLevelChip } from '../../components/common/RiskLevelChip';

export const ReportsScreen: React.FC = () => {

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Text variant="headlineSmall">Yangın Raporları</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Toplam {mockReports.length} rapor
        </Text>
      </Surface>

      <View style={styles.reportsList}>
        {mockReports.map((report) => (
          <Card key={report.id} style={styles.reportCard}>
            <Card.Content>
              <View style={styles.reportHeader}>
                <Text variant="titleMedium">{report.userName}</Text>
                <RiskLevelChip riskLevel={report.aiAnalysis.riskLevel} />
              </View>
              
              <Text variant="bodyMedium" style={styles.description}>
                {report.description}
              </Text>
              
              <View style={styles.reportFooter}>
                <Text variant="bodySmall" style={styles.date}>
                  {formatDate(new Date(report.reportedAt))}
                </Text>
                <Text variant="bodySmall" style={styles.confidence}>
                  Güven: %{report.aiAnalysis.confidence}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  reportsList: {
    padding: 16,
    gap: 12,
  },
  reportCard: {
    borderRadius: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    opacity: 0.7,
  },
  confidence: {
    opacity: 0.7,
    fontWeight: 'bold',
  },
});