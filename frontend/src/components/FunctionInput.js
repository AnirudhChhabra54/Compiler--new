import React, { useState } from 'react';
import axios from 'axios';

function FunctionInput({ onConsoleOutput }) {
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    // Add command to console output
    onConsoleOutput({
      type: 'command',
      content: `> ${command}`,
      timestamp: Date.now()
    });

    setIsLoading(true);

    try {
      const response = await axios.post('/api/execute', { command });
      
      if (response.data.success) {
        onConsoleOutput({
          type: 'success',
          content: response.data.output,
          timestamp: Date.now()
        });
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      onConsoleOutput({
        type: 'error',
        content: error.message || 'An error occurred while executing the command',
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
      setCommand('');
    }
  };

  // Function to handle command suggestions
  const getCommandSuggestions = (cmd) => {
    const commands = [
      'load_csv',
      'describe',
      'mean',
      'median',
      'plot',
      'scatter_plot',
      'bar_chart',
      'histogram',
      'train_model',
      'predict',
      'normalize',
      'standardize',
      'remove_stopwords',
      'stem_text',
      'rolling_mean',
      'detect_trends',
      'get_shape',
      'data_quality_report'
    ];

    return commands.filter(c => c.startsWith(cmd.toLowerCase()));
  };

  const handleKeyDown = (e) => {
    // Handle tab completion
    if (e.key === 'Tab') {
      e.preventDefault();
      const suggestions = getCommandSuggestions(command);
      if (suggestions.length === 1) {
        setCommand(suggestions[0]);
      }
    }
  };

  return (
    <div className="bg-gray-800 p-4 border-b border-gray-700">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command (e.g., load_csv('data.csv'))"
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg 
                     border border-gray-600 focus:border-primary-500 focus:ring-1 
                     focus:ring-primary-500 focus:outline-none placeholder-gray-400
                     font-mono"
            disabled={isLoading}
          />
          {command && (
            <div className="absolute right-2 top-2 text-xs text-gray-400">
              Press Tab for autocomplete
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-primary-600 text-white rounded-lg 
                   hover:bg-primary-700 focus:outline-none focus:ring-2 
                   focus:ring-primary-500 focus:ring-offset-2 
                   focus:ring-offset-gray-800 disabled:opacity-50 
                   disabled:cursor-not-allowed flex items-center"
          disabled={!command.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running...
            </>
          ) : (
            'Run'
          )}
        </button>
      </form>
      <div className="mt-2 text-xs text-gray-400 flex justify-between">
        <span>Press Enter to execute command</span>
        <span>Type 'help' for available commands</span>
      </div>
    </div>
  );
}

export default FunctionInput;
