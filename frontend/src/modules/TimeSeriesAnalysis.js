import React, { useState } from 'react';

function TimeSeriesAnalysis({ onConsoleOutput }) {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [windowSize, setWindowSize] = useState(7);
  const [selectedAnalysis, setSelectedAnalysis] = useState('');

  const analysisTypes = [
    { id: 'rolling-mean', name: 'Rolling Mean', icon: 'fa-chart-line' },
    { id: 'resampling', name: 'Resampling', icon: 'fa-clock' },
    { id: 'seasonal', name: 'Seasonal Decomposition', icon: 'fa-wave-square' },
    { id: 'trend', name: 'Trend Analysis', icon: 'fa-arrow-trend-up' },
    { id: 'forecast', name: 'Forecasting', icon: 'fa-crystal-ball' },
    { id: 'anomaly', name: 'Anomaly Detection', icon: 'fa-exclamation-triangle' },
    { id: 'correlation', name: 'Time Correlation', icon: 'fa-link' },
    { id: 'patterns', name: 'Pattern Recognition', icon: 'fa-shapes' }
  ];

  const mockColumns = [
    'Daily Sales', 'Temperature', 'Stock Price', 'Website Traffic', 'Energy Consumption'
  ];

  const timeIntervals = [
    { value: 'D', label: 'Daily' },
    { value: 'W', label: 'Weekly' },
    { value: 'M', label: 'Monthly' },
    { value: 'Q', label: 'Quarterly' },
    { value: 'Y', label: 'Yearly' }
  ];

  const handleAnalyze = () => {
    if (!selectedAnalysis || !selectedColumn) return;

    onConsoleOutput({
      type: 'info',
      content: `Performing ${selectedAnalysis} analysis...`,
      timestamp: Date.now()
    });

    // Mock analysis process
    setTimeout(() => {
      onConsoleOutput({
        type: 'success',
        content: 'Analysis completed successfully',
        timestamp: Date.now()
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Time Series Analysis
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Analysis Type Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Select Analysis Type
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {analysisTypes.map((analysis) => (
              <button
                key={analysis.id}
                onClick={() => setSelectedAnalysis(analysis.id)}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  selectedAnalysis === analysis.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <i className={`fas ${analysis.icon} text-2xl ${
                    selectedAnalysis === analysis.id
                      ? 'text-primary-500'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}></i>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    {analysis.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Configuration
          </h3>
          
          {/* Time Series Column Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Time Series Column
            </label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select column</option>
              {mockColumns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Window Size Selection */}
          {['rolling-mean', 'resampling'].includes(selectedAnalysis) && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Window Size: {windowSize} {selectedAnalysis === 'rolling-mean' ? 'periods' : 'days'}
              </label>
              <input
                type="range"
                min="2"
                max="30"
                value={windowSize}
                onChange={(e) => setWindowSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Time Interval Selection */}
          {selectedAnalysis === 'resampling' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Resample Interval
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {timeIntervals.map((interval) => (
                  <option key={interval.value} value={interval.value}>
                    {interval.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Controls */}
      <div className="flex space-x-4">
        <button
          onClick={handleAnalyze}
          disabled={!selectedAnalysis || !selectedColumn}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                   transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Run Analysis
        </button>
        <button
          onClick={() => {
            onConsoleOutput({
              type: 'info',
              content: 'Exporting results...',
              timestamp: Date.now()
            });
          }}
          className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 
                   border border-gray-300 dark:border-gray-600 rounded-lg 
                   hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150"
        >
          <i className="fas fa-download mr-2"></i>
          Export Results
        </button>
      </div>

      {/* Results Display */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Analysis Results
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Time Series Chart */}
          <div className="p-6 min-h-[300px] flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
            <div className="text-center text-gray-500 dark:text-gray-400">
              Time series visualization will appear here
            </div>
          </div>

          {/* Statistics Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Mean</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                {(Math.random() * 100).toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Trend</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                Upward
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Seasonality</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                Quarterly
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => {
            onConsoleOutput({
              type: 'info',
              content: 'Generating forecast...',
              timestamp: Date.now()
            });
          }}
          className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 
                   dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 
                   transition-colors duration-150"
        >
          <div className="flex flex-col items-center space-y-2">
            <i className="fas fa-crystal-ball text-gray-400 dark:text-gray-500"></i>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Generate Forecast
            </span>
          </div>
        </button>
        <button
          onClick={() => {
            onConsoleOutput({
              type: 'info',
              content: 'Detecting anomalies...',
              timestamp: Date.now()
            });
          }}
          className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 
                   dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 
                   transition-colors duration-150"
        >
          <div className="flex flex-col items-center space-y-2">
            <i className="fas fa-exclamation-triangle text-gray-400 dark:text-gray-500"></i>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Detect Anomalies
            </span>
          </div>
        </button>
        <button
          onClick={() => {
            onConsoleOutput({
              type: 'info',
              content: 'Analyzing patterns...',
              timestamp: Date.now()
            });
          }}
          className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 
                   dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 
                   transition-colors duration-150"
        >
          <div className="flex flex-col items-center space-y-2">
            <i className="fas fa-shapes text-gray-400 dark:text-gray-500"></i>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Analyze Patterns
            </span>
          </div>
        </button>
        <button
          onClick={() => {
            onConsoleOutput({
              type: 'info',
              content: 'Generating report...',
              timestamp: Date.now()
            });
          }}
          className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 
                   dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 
                   transition-colors duration-150"
        >
          <div className="flex flex-col items-center space-y-2">
            <i className="fas fa-file-alt text-gray-400 dark:text-gray-500"></i>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Generate Report
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default TimeSeriesAnalysis;