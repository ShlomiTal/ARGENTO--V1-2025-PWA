import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

interface EquityChartProps {
  data: number[];
  height?: number;
  showGrid?: boolean;
  title?: string;
}

export const EquityChart: React.FC<EquityChartProps> = ({ 
  data, 
  height = 180,
  showGrid = true,
  title
}) => {
  const { colors, isDarkMode } = useTheme();
  
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={{ color: colors.textSecondary }}>No data available</Text>
      </View>
    );
  }
  
  // Simple chart implementation without external dependencies
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;
  
  return (
    <View style={styles.container}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      
      <View style={[styles.chartContainer, { height }]}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>
            {Math.round(maxValue)}
          </Text>
          <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>
            {Math.round((maxValue + minValue) / 2)}
          </Text>
          <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>
            {Math.round(minValue)}
          </Text>
        </View>
        
        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines */}
          {showGrid && (
            <>
              <View style={[styles.gridLine, { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', top: 0 }]} />
              <View style={[styles.gridLine, { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', top: '50%' }]} />
              <View style={[styles.gridLine, { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', bottom: 0 }]} />
            </>
          )}
          
          {/* Data points */}
          <View style={styles.dataPointsContainer}>
            {data.map((value, index) => {
              const heightPercent = range === 0 ? 50 : ((value - minValue) / range) * 100;
              return (
                <View 
                  key={index} 
                  style={[
                    styles.dataBar, 
                    { 
                      height: `${heightPercent}%`,
                      backgroundColor: colors.primary,
                      width: `${90 / data.length}%`
                    }
                  ]} 
                />
              );
            })}
          </View>
        </View>
      </View>
      
      {/* X-axis labels */}
      <View style={styles.xAxis}>
        {data.length > 10 ? (
          // Show fewer labels if we have many data points
          <>
            <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>Start</Text>
            <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>Middle</Text>
            <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>End</Text>
          </>
        ) : (
          // Show all labels if we have few data points
          data.map((_, index) => (
            <Text 
              key={index} 
              style={[styles.axisLabel, { color: colors.textSecondary }]}
            >
              {index + 1}
            </Text>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    alignSelf: 'flex-start',
    paddingLeft: 10,
  },
  chartContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  yAxis: {
    width: 40,
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  axisLabel: {
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  dataPointsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    width: '100%',
    paddingHorizontal: 5,
  },
  dataBar: {
    alignSelf: 'flex-end',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
    marginTop: 5,
  }
});