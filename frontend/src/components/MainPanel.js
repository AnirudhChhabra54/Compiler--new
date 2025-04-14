import React, { useState } from 'react';
import LiveConsole from './LiveConsole';
import FileHandling from '../modules/FileHandling';
import DataPreprocessing from '../modules/DataPreprocessing';
import DataAnalysis from '../modules/DataAnalysis';
import MachineLearning from '../modules/MachineLearning';
import DataVisualization from '../modules/DataVisualization';
import TextProcessing from '../modules/TextProcessing';
import TimeSeriesAnalysis from '../modules/TimeSeriesAnalysis';
import Utilities from '../modules/Utilities';

function MainPanel({ activeModule }) {
  const [consoleOutput, setConsoleOutput] = useState([]);

  const handleConsoleOutput = (output) => {
    setConsoleOutput(prev => [...prev, output]);
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'file-handling':
        return <FileHandling onConsoleOutput={handleConsoleOutput} />;
      case 'preprocessing':
        return <DataPreprocessing onConsoleOutput={handleConsoleOutput} />;
      case 'analysis':
        return <DataAnalysis onConsoleOutput={handleConsoleOutput} />;
      case 'machine-learning':
        return <MachineLearning onConsoleOutput={handleConsoleOutput} />;
      case 'visualization':
        return <DataVisualization onConsoleOutput={handleConsoleOutput} />;
      case 'text-processing':
        return <TextProcessing onConsoleOutput={handleConsoleOutput} />;
      case 'time-series':
        return <TimeSeriesAnalysis onConsoleOutput={handleConsoleOutput} />;
      case 'utilities':
        return <Utilities onConsoleOutput={handleConsoleOutput} />;
      default:
        return <div className="text-gray-500 dark:text-gray-400">Select a module from the sidebar</div>;
    }
  };

  return (
    <main className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-1 min-h-0">
        {/* Left Panel - Module Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 h-full">
            {renderModule()}
          </div>
        </div>

        {/* Right Panel - Live Console */}
        <div className="w-1/3 p-6 border-l border-gray-200 dark:border-gray-700">
          <div className="h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Command Line Interface
            </h2>
            <div className="flex-1 min-h-0">
              <LiveConsole />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Output Display */}
      <div className="h-1/4 min-h-[200px] p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full overflow-auto">
          <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Output
          </h3>
          <div className="font-mono text-sm">
            {consoleOutput.map((output, index) => (
              <div 
                key={index}
                className="text-gray-600 dark:text-gray-400"
              >
                {output}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default MainPanel;
