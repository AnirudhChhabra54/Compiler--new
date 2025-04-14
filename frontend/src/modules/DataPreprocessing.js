import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function DataPreprocessing({ onConsoleOutput, dataState, setIsProcessing }) {
  const [selectedOperation, setSelectedOperation] = useState('');
  const [operationConfig, setOperationConfig] = useState({});
  const [previewData, setPreviewData] = useState(null);

  const operations = [
    {
      id: 'remove-nulls',
      name: 'Remove NULL Values',
      icon: 'fa-eraser',
      command: 'remove_nulls()',
      description: 'Remove rows containing NULL values',
      config: []
    },
    {
      id: 'fill-nulls',
      name: 'Fill NULL Values',
      icon: 'fa-fill-drip',
      command: (config) => `fill_nulls("${config.column}", "${config.value}")`,
      description: 'Fill NULL values with specified value',
      config: [
        { key: 'column', type: 'select', label: 'Column' },
        { key: 'value', type: 'text', label: 'Fill Value' }
      ]
    },
    {
      id: 'drop-columns',
      name: 'Drop Columns',
      icon: 'fa-minus-circle',
      command: (config) => `drop_column("${config.column}")`,
      description: 'Remove specified columns from dataset',
      config: [
        { key: 'column', type: 'select', label: 'Column to Drop' }
      ]
    },
    {
      id: 'rename-column',
      name: 'Rename Column',
      icon: 'fa-pen',
      command: (config) => `rename_column("${config.oldName}", "${config.newName}")`,
      description: 'Rename a column',
      config: [
        { key: 'oldName', type: 'select', label: 'Current Name' },
        { key: 'newName', type: 'text', label: 'New Name' }
      ]
    },
    {
      id: 'normalize',
      name: 'Normalize Data',
      icon: 'fa-chart-line',
      command: (config) => `normalize("${config.column}")`,
      description: 'Scale values to range [0,1]',
      config: [
        { key: 'column', type: 'select', label: 'Column to Normalize' }
      ]
    },
    {
      id: 'standardize',
      name: 'Standardize Data',
      icon: 'fa-bell-curve',
      command: (config) => `standardize("${config.column}")`,
      description: 'Transform to zero mean and unit variance',
      config: [
        { key: 'column', type: 'select', label: 'Column to Standardize' }
      ]
    },
    {
      id: 'encode-categorical',
      name: 'Encode Categorical',
      icon: 'fa-tags',
      command: (config) => `encode_categorical("${config.column}")`,
      description: 'Convert categorical data to numerical',
      config: [
        { key: 'column', type: 'select', label: 'Column to Encode' }
      ]
    }
  ];

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

  const handleConfigChange = (key, value) => {
    setOperationConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleOperationSubmit = async (e) => {
    e.preventDefault();
    
    if (!dataState.isDataLoaded) {
      toast.warning('Please load data first');
      return;
    }

    const operation = operations.find(op => op.id === selectedOperation);
    if (!operation) return;

    try {
      const command = typeof operation.command === 'function' 
        ? operation.command(operationConfig)
        : operation.command;

      await executeCommand(command);
      
      // Refresh data preview
      const previewResult = await executeCommand('head()');
      setPreviewData(previewResult.data);
      
      toast.success('Operation completed successfully');
      setSelectedOperation('');
      setOperationConfig({});
    } catch (error) {
      console.error('Operation failed:', error);
    }
  };

  const renderConfigFields = () => {
    const operation = operations.find(op => op.id === selectedOperation);
    if (!operation?.config) return null;

    return (
      <div className="space-y-4">
        {operation.config.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                value={operationConfig[field.key] || ''}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                className="input w-full"
              >
                <option value="">Select {field.label}</option>
                {dataState.columns?.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={operationConfig[field.key] || ''}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                className="input w-full"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Data Preprocessing
        </h2>
      </div>

      {/* Operations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {operations.map((op) => (
          <button
            key={op.id}
            onClick={() => {
              setSelectedOperation(op.id);
              setOperationConfig({});
            }}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              selectedOperation === op.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <i className={`fas ${op.icon} text-2xl ${
                selectedOperation === op.id
                  ? 'text-primary-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}></i>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {op.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {op.description}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Operation Configuration */}
      {selectedOperation && (
        <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <form onSubmit={handleOperationSubmit} className="space-y-4">
            {renderConfigFields()}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedOperation('');
                  setOperationConfig({});
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Preview */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Data Preview
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {dataState.isDataLoaded ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {dataState.columns?.map(column => (
                      <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {previewData?.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {dataState.columns?.map(column => (
                        <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {row[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <i className="fas fa-database text-4xl mb-4"></i>
              <p>Load a dataset to preview data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataPreprocessing;
