export const strategyTypes = [
  {
    id: 'trend_following',
    name: 'Trend Following',
    description: 'Buy when price is rising, sell when price is falling',
    parameters: [
      { id: 'period', name: 'Period (days)', type: 'number', default: 14 },
      { id: 'threshold', name: 'Threshold (%)', type: 'number', default: 2 }
    ]
  },
  {
    id: 'mean_reversion',
    name: 'Mean Reversion',
    description: 'Buy when price is below average, sell when above average',
    parameters: [
      { id: 'period', name: 'Period (days)', type: 'number', default: 20 },
      { id: 'deviation', name: 'Deviation (%)', type: 'number', default: 3 }
    ]
  },
  {
    id: 'breakout',
    name: 'Breakout',
    description: 'Buy when price breaks above resistance, sell when below support',
    parameters: [
      { id: 'lookback', name: 'Lookback (days)', type: 'number', default: 30 },
      { id: 'threshold', name: 'Threshold (%)', type: 'number', default: 5 }
    ]
  },
  {
    id: 'rsi',
    name: 'RSI Strategy',
    description: 'Buy when RSI is oversold, sell when overbought',
    parameters: [
      { id: 'period', name: 'RSI Period', type: 'number', default: 14 },
      { id: 'oversold', name: 'Oversold Level', type: 'number', default: 30 },
      { id: 'overbought', name: 'Overbought Level', type: 'number', default: 70 }
    ]
  },
  {
    id: 'macd',
    name: 'MACD Strategy',
    description: 'Buy on MACD crossover above signal line, sell on crossover below',
    parameters: [
      { id: 'fastPeriod', name: 'Fast EMA Period', type: 'number', default: 12 },
      { id: 'slowPeriod', name: 'Slow EMA Period', type: 'number', default: 26 },
      { id: 'signalPeriod', name: 'Signal Period', type: 'number', default: 9 }
    ]
  },
  {
    id: 'bollinger_bands',
    name: 'Bollinger Bands',
    description: 'Buy when price touches lower band, sell when touches upper band',
    parameters: [
      { id: 'period', name: 'Period', type: 'number', default: 20 },
      { id: 'stdDev', name: 'Standard Deviations', type: 'number', default: 2 }
    ]
  },
  {
    id: 'ichimoku',
    name: 'Ichimoku Cloud',
    description: 'Complex strategy using multiple indicators for trend identification',
    parameters: [
      { id: 'conversionPeriod', name: 'Conversion Period', type: 'number', default: 9 },
      { id: 'basePeriod', name: 'Base Period', type: 'number', default: 26 },
      { id: 'laggingSpan2Period', name: 'Lagging Span 2 Period', type: 'number', default: 52 },
      { id: 'displacement', name: 'Displacement', type: 'number', default: 26 }
    ]
  },
  {
    id: 'grid_trading',
    name: 'Grid Trading',
    description: 'Place buy and sell orders at regular price intervals',
    parameters: [
      { id: 'upperLimit', name: 'Upper Price Limit (%)', type: 'number', default: 10 },
      { id: 'lowerLimit', name: 'Lower Price Limit (%)', type: 'number', default: 10 },
      { id: 'gridLevels', name: 'Grid Levels', type: 'number', default: 5 }
    ]
  },
  {
    id: 'ai_pattern_recognition',
    name: 'AI Pattern Recognition',
    description: 'Use AI models to detect repeating price patterns or fractals across multiple timeframes',
    parameters: [
      { id: 'confidence', name: 'Confidence Threshold (%)', type: 'number', default: 75 },
      { id: 'patternTypes', name: 'Pattern Types', type: 'string', default: 'head_shoulders,cup_handle,wedges' },
      { id: 'confirmationIndicator', name: 'Confirmation Indicator', type: 'string', default: 'volume' }
    ]
  },
  {
    id: 'scalping',
    name: 'Scalping (High-Frequency)',
    description: 'Take advantage of small price movements multiple times per day',
    parameters: [
      { id: 'profitTarget', name: 'Profit Target (%)', type: 'number', default: 0.5 },
      { id: 'stopLoss', name: 'Stop Loss (%)', type: 'number', default: 0.3 },
      { id: 'maxTradesPerDay', name: 'Max Trades Per Day', type: 'number', default: 50 },
      { id: 'timeframe', name: 'Timeframe (minutes)', type: 'number', default: 5 }
    ]
  },
  {
    id: 'whale_watching',
    name: 'Smart Money / Whale Watching',
    description: 'Track large wallet movements and institutional money flow',
    parameters: [
      { id: 'minTransactionSize', name: 'Min Transaction Size ($)', type: 'number', default: 100000 },
      { id: 'followTimeframe', name: 'Follow Period (hours)', type: 'number', default: 24 },
      { id: 'volumeThreshold', name: 'Volume Spike Threshold (%)', type: 'number', default: 200 }
    ]
  }
];