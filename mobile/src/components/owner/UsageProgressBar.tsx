/**
 * Usage Progress Bar Component
 * Visual indicator for resource usage vs limits
 *
 * @author Agent 3 - Senior Mobile Developer (20+ Years)
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface UsageProgressBarProps {
  label: string;
  used: number;
  limit: number;
  unit?: string;
  warningThreshold?: number; // percentage (default: 80)
  dangerThreshold?: number; // percentage (default: 95)
}

const UsageProgressBar: React.FC<UsageProgressBarProps> = ({
  label,
  used,
  limit,
  unit = '',
  warningThreshold = 80,
  dangerThreshold = 95,
}) => {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  // Determine color based on usage
  const getColor = () => {
    if (percentage >= dangerThreshold) {return '#f44336';} // Red
    if (percentage >= warningThreshold) {return '#ff9800';} // Orange
    return '#4CAF50'; // Green
  };

  const color = getColor();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.usage, {color}]}>
          {used.toLocaleString()} / {limit.toLocaleString()} {unit}
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {width: `${percentage}%`, backgroundColor: color},
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.percentage, {color}]}>
          {percentage.toFixed(1)}% used
        </Text>
        {percentage >= warningThreshold && (
          <Text style={[styles.warning, {color}]}>
            {percentage >= dangerThreshold ? '⚠️ Limit reached!' : '⚠️ Approaching limit'}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  usage: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '500',
  },
  warning: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default UsageProgressBar;


