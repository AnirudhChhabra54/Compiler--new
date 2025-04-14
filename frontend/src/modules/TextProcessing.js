import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function TextProcessing({ onConsoleOutput, dataState, setIsProcessing }) {
  const [inputText, setInputText] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedOperations, setSelectedOperations] = useState([]);
  const [results, setResults] = useState({});

  const operations = [
    { 
      id: 'remove-stopwords', 
      name: 'Remove Stopwords', 
      icon: 'fa-filter',
      command: (col) => `remove_stopwords("${col}")`,
      description: 'Remove common words that don\'t add meaning'
    },
    { 
      id: 'stem-text', 
      name: 'Stemming', 
      icon: 'fa-seedling',
      command: (col) => `stem_text("${col}")`,
      description: 'Reduce words to their root form'
    },
    { 
      id: 'capitalize', 
      name: 'Capitalize Words', 
      icon: 'fa-font',
      command: (col) => `capitalize_words("${col}")`,
      description: 'Convert text to title case'
    },
    { 
      id: 'word-count', 
      name: 'Word Count', 
      icon: 'fa-calculator',
      command: (col) => `count_words("${col}")`,
      description: 'Count words in text'
    },
    { 
      id: 'tokenize', 
      name: 'Tokenization', 
      icon: 'fa-grip-lines-vertical',
      command: (col) => `tokenize("${col}")`,
      description: 'Split text into individual tokens'
    },
    { 
      id: 'lemmatize', 
      name: 'Lemmatization', 
      icon: 'fa-language',
      command: (col) => `lemmatize("${col}")`,
      description: 'Convert words to their dictionary form'
    },
    { 
      id: 'sentiment', 
      name: 'Sentiment Analysis', 
      icon: 'fa-face-smile',
      command: (col) => `analyze_sentiment("${col}")`,
      description: 'Determine text sentiment'
    },
    { 
      id: 'entities', 
      name: 'Named Entities', 
      icon: 'fa-tag',
      command: (col) => `extract_entities("${col}")`,
      description: 'Extract named entities (names, places, etc.)'
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

  const toggleOperation = (operationId) => {
    setSelectedOperations(prev =>
      prev.includes(operationId)
        ? prev.filter(id => id !== operationId)
        : [...prev, operationId]
    );
  };

  const processText = async () => {
    if (!dataState.isDataLoaded) {
      toast.warning('Please load data first');
      return;
    }

    if (!selectedColumn) {
      toast.warning('Please select a text column');
      return;
    }

    if (selectedOperations.length === 0) {
      toast.warning('Please select at least one operation');
      return;
    }

    try {
      const newResults = {};
      
      for (const operationId of selectedOperations) {
        const operation = operations.find(op => op.id === operationId);
        if (!operation) continue;

        const result = await executeCommand(operation.command(selectedColumn));
        newResults[operationId] = result.output;
      }

      setResults(newResults);
      toast.success('Text processing completed');
    } catch (error) {
      console.error('Text processing failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Text Processing
        </h2>
      </div>

      {/* Column Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Text Column
        </label>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="input w-full"
        >
          <option value="">Select a column</option>
          {dataState.columns?.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      {/* Operations Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Select Operations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {operations.map((operation) => (
            <button
              key={operation.id}
              onClick={() => toggleOperation(operation.id)}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                selectedOperations.includes(operation.id)
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <i className={`fas ${operation.icon} text-2xl ${
                  selectedOperations.includes(operation.id)
                    ? 'text-primary-500'
                    : 'text-gray-400 dark:text-gray-500'
                }`}></i>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  {operation.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {operation.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Process Button */}
      <div className="flex space-x-4">
        <button
          onClick={processText}
          disabled={!selectedColumn || selectedOperations.length === 0}
          className="flex-1 btn btn-primary"
        >
          <i className="fas fa-play mr-2"></i>
          Process Text
        </button>
        <button
          onClick={() => {
            setSelectedColumn('');
            setSelectedOperations([]);
            setResults({});
          }}
          className="btn btn-secondary"
        >
          <i className="fas fa-trash mr-2"></i>
          Clear All
        </button>
      </div>

      {/* Results Display */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Processing Results
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            {Object.keys(results).length > 0 ? (
              Object.entries(results).map(([operationId, result]) => (
                <div key={operationId} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {operations.find(op => op.id === operationId)?.name}
                  </h4>
                  <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {result}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                {!dataState.isDataLoaded ? (
                  'Load data and select a text column to begin'
                ) : (
                  'Select operations and process text to see results'
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextProcessing;
