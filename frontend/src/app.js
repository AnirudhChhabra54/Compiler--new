import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import LiveConsole from './components/LiveConsole';
import FunctionInput from './components/FunctionInput';

// Import all module components
import FileHandling from './modules/FileHandling';
import DataPreprocessing from './modules/DataPreprocessing';
import DataAnalysis from './modules/DataAnalysis';
import DataVisualization from './modules/DataVisualization';
import MachineLearning from './modules/MachineLearning';
import TextProcessing from './modules/TextProcessing';
import TimeSeriesAnalysis from './modules/TimeSeriesAnalysis';
import Utilities from './modules/Utilities';

function App() {
  // State management
  const [darkMode, setDarkMode] = useState(false);
  const [activeModule, setActiveModule] = useState('file-handling');
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [dataState, setDataState] = useState({
    columns: [],
    rows: [],
    fileName: null,
    isDataLoaded: false
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // System dark mode preference check
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Update document class for dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Console output handler
  const handleConsoleOutput = (output) => {
    setConsoleOutput(prev => [...prev, {
      ...output,
      timestamp: new Date().toISOString()
    }]);

    // Show toast for errors
    if (output.type === 'error') {
      toast.error(output.content);
    }
  };

  // Data state handler
  const handleDataStateChange = (newState) => {
    setDataState(prev => ({
      ...prev,
      ...newState
    }));

    // Show success toast when data is loaded
    if (newState.isDataLoaded && newState.fileName) {
      toast.success(`Successfully loaded ${newState.fileName}`);
    }
  };

  // Module change handler
  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
    handleConsoleOutput({
      type: 'info',
      content: `Switched to ${moduleId} module`
    });
  };

  // Get current module component
  const getCurrentModule = () => {
    const modules = {
      'file-handling': FileHandling,
      'preprocessing': DataPreprocessing,
      'analysis': DataAnalysis,
      'visualization': DataVisualization,
      'machine-learning': MachineLearning,
      'text-processing': TextProcessing,
      'time-series': TimeSeriesAnalysis,
      'utilities': Utilities
    };

    const ModuleComponent = modules[activeModule];
    return ModuleComponent ? (
      <ModuleComponent
        onConsoleOutput={handleConsoleOutput}
        dataState={dataState}
        onDataStateChange={handleDataStateChange}
        setIsProcessing={setIsProcessing}
      />
    ) : (
      <div className="p-4 text-gray-500 dark:text-gray-400">
        Select a module from the sidebar
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar
          activeModule={activeModule}
          setActiveModule={handleModuleChange}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
          dataState={dataState}
        />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <Header
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            dataState={dataState}
            isProcessing={isProcessing}
          />

          {/* Main Panel */}
          <div className="flex-1 overflow-auto">
            <MainPanel
              activeModule={activeModule}
              onConsoleOutput={handleConsoleOutput}
              dataState={dataState}
              isProcessing={isProcessing}
            >
              {getCurrentModule()}
            </MainPanel>
          </div>

          {/* Console Section */}
          <div className="h-1/3 border-t border-gray-200 dark:border-gray-700 flex flex-col">
            <FunctionInput
              onConsoleOutput={handleConsoleOutput}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              dataState={dataState}
            />
            <div className="flex-1 overflow-hidden">
              <LiveConsole
                output={consoleOutput}
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
      />

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <div className="text-gray-700 dark:text-gray-300">Processing...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
