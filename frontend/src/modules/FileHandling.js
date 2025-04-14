import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function FileHandling({ onConsoleOutput, dataState, onDataStateChange, setIsProcessing }) {
  const [dragActive, setDragActive] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

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

  const handleFiles = async (files) => {
    const validFileTypes = [
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    for (let file of files) {
      if (!validFileTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        return;
      }
    }

    try {
      setIsProcessing(true);
      const formData = new FormData();
      const file = files[0]; // Handle one file at a time
      formData.append('file', file);

      // Upload file
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadResponse.data.success) {
        // Load the file using our compiler command
        const loadCommand = `load_csv("${uploadResponse.data.filename}")`;
        const result = await executeCommand(loadCommand);

        if (result.success) {
          // Update data state
          onDataStateChange({
            fileName: file.name,
            isDataLoaded: true
          });

          // Get data description
          await executeCommand('describe()');

          // Add to recent files
          setRecentFiles(prev => [
            { name: file.name, path: uploadResponse.data.filename },
            ...prev.slice(0, 4)
          ]);

          toast.success(`Successfully loaded ${file.name}`);
        }
      }
    } catch (error) {
      toast.error(`Failed to load file: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = [...e.dataTransfer.files];
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = [...e.target.files];
    handleFiles(files);
  }, []);

  const handleSaveData = async () => {
    if (!dataState.isDataLoaded) {
      toast.warning('No data loaded to save');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await executeCommand('save_csv("output.csv")');
      if (result.success) {
        toast.success('Data saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save data');
    }
  };

  const handleExportData = async (format) => {
    if (!dataState.isDataLoaded) {
      toast.warning('No data loaded to export');
      return;
    }

    try {
      setIsProcessing(true);
      const command = format === 'json' ? 'save_json("output.json")' : 'save_csv("output.csv")';
      const result = await executeCommand(command);
      if (result.success) {
        toast.success(`Data exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      toast.error(`Failed to export data as ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          File Handling
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExportData('csv')}
            disabled={!dataState.isDataLoaded}
            className="btn btn-secondary"
          >
            <i className="fas fa-file-csv mr-2"></i>
            Export CSV
          </button>
          <button
            onClick={() => handleExportData('json')}
            disabled={!dataState.isDataLoaded}
            className="btn btn-secondary"
          >
            <i className="fas fa-file-code mr-2"></i>
            Export JSON
          </button>
        </div>
      </div>

      {/* File Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
            : 'border-gray-300 dark:border-gray-600'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
          accept=".csv,.json,.xlsx,.xls"
        />
        
        <div className="space-y-4">
          <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 dark:text-gray-500"></i>
          <div className="text-gray-600 dark:text-gray-300">
            <p className="font-medium">Drop file here or click to upload</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supported formats: CSV, JSON, Excel
            </p>
          </div>
        </div>
      </div>

      {/* Current File Info */}
      {dataState.isDataLoaded && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fas fa-file-alt text-primary-500"></i>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {dataState.fileName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Currently loaded
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveData}
              className="btn btn-primary"
            >
              <i className="fas fa-save mr-2"></i>
              Save
            </button>
          </div>
        </div>
      )}

      {/* Recent Files */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Recent Files
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {recentFiles.length > 0 ? (
            recentFiles.map((file, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <div className="flex items-center">
                  <i className="fas fa-file-alt text-gray-400 mr-3"></i>
                  <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  onClick={() => handleFiles([file])}
                >
                  <i className="fas fa-redo-alt"></i>
                </button>
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
              No recent files
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileHandling;
