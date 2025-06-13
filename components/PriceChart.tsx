import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '@/constants/colors';

interface PriceChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showGrid?: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  width = Dimensions.get('window').width - 40,
  height = 200,
  color,
  showGrid = true,
}) => {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  // Determine color based on price trend
  const chartColor = color || (data[data.length - 1] >= data[0] ? colors.chart.green : colors.chart.red);
  
  // Create path
  const xRatio = width / (data.length - 1);
  const yRatio = height / range;
  
  let path = `M 0 ${height - (data[0] - min) * yRatio}`;
  
  for (let i = 1; i < data.length; i++) {
    path += ` L ${i * xRatio} ${height - (data[i] - min) * yRatio}`;
  }
  
  // Create grid lines
  const gridLines = [];
  if (showGrid) {
    // Horizontal grid lines
    const numHLines = 4;
    for (let i = 0; i <= numHLines; i++) {
      const y = (height / numHLines) * i;
      gridLines.push(
        <Line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={colors.chart.grid}
          strokeWidth={0.5}
        />
      );
      
      // Price labels
      const price = max - (range / numHLines) * i;
      gridLines.push(
        <SvgText
          key={`ht-${i}`}
          x={5}
          y={y - 5}
          fontSize={10}
          fill={colors.textSecondary}
        >
          {price.toFixed(2)}
        </SvgText>
      );
    }
    
    // Vertical grid lines
    const numVLines = 6;
    for (let i = 0; i <= numVLines; i++) {
      const x = (width / numVLines) * i;
      gridLines.push(
        <Line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={colors.chart.grid}
          strokeWidth={0.5}
        />
      );
    }
  }
  
  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {showGrid && gridLines}
        <Path d={path} stroke={chartColor} strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
});