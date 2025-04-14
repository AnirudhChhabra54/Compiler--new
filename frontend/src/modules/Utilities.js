import React, { useState } from 'react';

function Utilities({ onConsoleOutput }) {
  const [selectedUtility, setSelectedUtility] = useState('');

  const utilities = [
    { id: 'data-shape', name: 'Data Shape', icon: 'fa-table', description: 'View dimensions of the dataset' },
    { id: 'column-profile', name: 'Column Profiling', icon: 'fa-columns', description: 'Analyze column statistics and distributions' },
    { id: 'data-quality', name: 'Data Quality Report', icon: 'fa-clipboard-check', description: 'Generate comprehensive data quality report' },
    { id: 'missing-values', name: 'Missing Values', icon: 'fa-question-circle', description: 'Analyze missing value patterns' },
    { id: 'duplicate-check', name: 'Duplicate Check', icon: 'fa-copy', description: 'Identify duplicate records' },
    { id: 'data-types', name: 'Data Types', icon: 'fa-code', description: 'View and modify column data types' },
    { id: 'memory-usage', name: 'Memory Usage', icon: 'fa-memory', description: 'Analyze memory consumption' },
    { id: 'backup', name: 'Backup Data', icon: 'fa-database', description: 'Create data backup' }
  ];

  const handleUtilityAction = (utilityId) => {
    onConsoleOutput({
      type: 'info',
      content: `Running ${utilities.find(u => u.id === utilityId)?.name}...`,
      timestamp: Date.now()
    });

    // Mock utility execution
    setTimeout(() => {
      let result;
      switch(utilityId) {
        case 'data-shape':
          result = 'Rows: 1000, Columns: 15';
          break;
        case 'memory-usage':
          result = 'Total Memory Usage: 24.5 MB';
          break;
        default:
          result = 'Operation completed successfully';
      }

      onConsoleOutput({
        type: 'success',
        content: result,
        timestamp: Date.now()
      });
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Utilities
        </h2>
      </div>

      {/* Utilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {utilities.map((utility) => (
          <div
            key={utility.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 
                     dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 
                     transition-all duration-200"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <i className={`fas ${utility.icon} text-2xl text-primary-500`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {utility.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {utility.description}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => handleUtilityAction(utility.id)}
                  className="w-full px-4 py-2 bg-primary-50 dark:bg-primary-900/10 text-primary-600 
                           dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/20 
                           transition-colors duration-150"
                >
                  Run
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              onConsoleOutput({
                type: 'info',
                content: 'Creating data backup...',
                timestamp: Date.now()
              });
            }}
            className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 
                     dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 
                     transition-colors duration-150"
          >
            <div className="flex flex-col items-center space-y-2">
              <i className="fas fa-database text-gray-400 dark:text-gray-500"></i>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Backup Data
              </span>
            </div>
          </button>
          <button
            onClick={() => {
              onConsoleOutput({
                type: 'info',
                content: 'Optimizing memory usage...',
                timestamp: Date.now()
              });
            }}
            className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 
                     dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 
                     transition-colors duration-150"
          >
            <div className="flex flex-col items-center space-y-2">
              <i className="fas fa-memory text-gray-400 dark:text-gray-500"></i>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Optimize Memory
              </span>
            </div>
          </button>
          <button
            onClick={() => {
              onConsoleOutput({
                type: 'info',
                content: 'Validating data types...',
                timestamp: Date.now()
              });
            }}
            className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 
                     dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 
                     transition-colors duration-150"
          >
            <div className="flex flex-col items-center space-y-2">
              <i className="fas fa-check-circle text-gray-400 dark:text-gray-500"></i>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Validate Types
              </span>
            </div>
          </button>
          <button
            onClick={() => {
              onConsoleOutput({
                type: 'info',
                content: 'Generating summary report...',
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
                Summary Report
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          System Information
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 border-b md:border-r border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</div>
              <div className="mt-2 flex items-center">
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">24.5 MB</span>
              </div>
            </div>
            <div className="p-6 border-b lg:border-r border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Data Size</div>
              <div className="mt-2 flex items-center">
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">1.2 GB</span>
              </div>
            </div>
            <div className="p-6 border-b md:border-r border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Last Backup</div>
              <div className="mt-2 flex items-center">
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">2h ago</span>
              </div>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">System Status</div>
              <div className="mt-2 flex items-center">
                <span className="text-2xl font-semibold text-green-500">Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Utilities;