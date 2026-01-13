import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusReport as StatusReportType } from '@/mocks/signals';

interface StatusReportProps {
  report: StatusReportType;
  onInsightPress?: (index: number) => void;
}

export default function StatusReport({ report, onInsightPress }: StatusReportProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textDim }]}>Status report:</Text>
      {report.insights.map((insight, index) => (
        <Pressable
          key={index}
          onPress={() => onInsightPress?.(index)}
          style={({ pressed }) => [
            styles.insightRow,
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={[styles.bullet, { backgroundColor: colors.accent }]} />
          <Text style={[styles.insightText, { color: colors.textPrimary }]}>
            {insight}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 2,
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 10,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    marginTop: 4,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'monospace',
    flex: 1,
  },
});
