import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DataAnalysis = ({ onConsoleOutput, dataState, setIsProcessing }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState({
    type: '',
    columns: []
  });

  const executeCommand = async (command) => {
    try {
      setIsProcessing(true);
      const response = await axios.post('/api/execute', { command });
      
      if (response.data.success) {
        onConsoleOutput({
          type: 'success',
          content: response.data.output,
          timestamp: Date.now()
        });
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      onConsoleOutput({
        type: 'error',
        content: error.message,
        timestamp: Date.now()
      });
      toast.error(error.message);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const analysisOptions = [
    {
      id: 'basic-stats',
      name: 'Basic Statistics',
      icon: 'fa-calculator',
      description: 'Calculate mean, median, variance, and standard deviation',
      columns: 1,
      command: (cols) => `describe("${cols[0]}")`
    },
    {
      id: 'correlation',
      name: 'Correlation Analysis',
      icon: 'fa-chart-line',
      description: 'Calculate correlation between two columns',
      columns: 2,
      command: (cols) => `correlation("${cols[0]}", "${cols[1]}")`
    },
    {
      id: 'distribution',
      name: 'Distribution Analysis',
      icon: 'fa-chart-bar',
      description: 'Analyze data distribution and generate histogram',
      columns: 1,
      command: (cols) => `histogram("${cols[0]}")`
    },
    {
      id: 'outliers',
      name: 'Outlier Detection',
      icon: 'fa-search',
      description: 'Detect and analyze outliers in the data',
      columns: 1,
      command: (cols) => `detect_anomalies("${cols[0]}")`
    },
    {
      id: 'summary',
      name: 'Data Summary',
      icon: 'fa-list-alt',
      description: 'Generate comprehensive data summary',
      columns: 0,
      command: () => 'describe()'
    }
  ];

  const handleAnalysis = async () => {
    if (!dataState.isDataLoaded) {
      toast.warning('Please load data first');
      return;
    }

    const analysis = analysisOptions.find(opt => opt.id === selectedAnalysis.type);
    if (!analysis) {
      toast.warning('Please select an analysis type');
      return;
    }

    if (analysis.columns > 0 && selectedAnalysis.columns.length < analysis.columns) {
      toast.warning(`Please select ${analysis.columns} column(s) for this analysis`);
      return;
    }

    try {
      await executeCommand(analysis.command(selectedAnalysis.columns));
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Data Analysis
        </h2>
        <button
          onClick={handleAnalysis}
          disabled={!dataState.isDataLoaded || !selectedAnalysis.type}
          className="btn btn-primary"
        >
          <i className="fas fa-play mr-2"></i>
          Run Analysis
        </button>
      </div>

      {/* Analysis Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysisOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => setSelectedAnalysis({ type: option.id, columns: [] })}
            className={`cursor-pointer rounded-lg p-4 border transition-all duration-200
              ${selectedAnalysis.type === option.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`mt-1 text-xl ${
                selectedAnalysis.type === option.id
                  ? 'text-primary-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                <i className={`fas ${option.icon}`}></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {option.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Column Selection */}
      {selectedAnalysis.type && dataState.isDataLoaded && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Select Columns
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {dataState.columns?.map((column) => (
              <div
                key={column}
                onClick={() => {
                  const analysis = analysisOptions.find(opt => opt.id === selectedAnalysis.type);
                  if (!analysis) return;

                  setSelectedAnalysis(prev => {
                    const columns = prev.columns.includes(column)
                      ? prev.columns.filter(col => col !== column)
                      : [...prev.columns, column].slice(-analysis.columns);
                    return { ...prev, columns };
                  });
                }}
                className={`cursor-pointer p-2 rounded border text-center transition-colors
                  ${selectedAnalysis.columns.includes(column)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
              >
                {column}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!dataState.isDataLoaded && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
            <i className="fas fa-database"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No Data Loaded
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please load a dataset using the File Handling module first
          </p>
        </div>
      )}
    </div>
  );
};

export default DataAnalysis;
