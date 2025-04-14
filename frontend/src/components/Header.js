import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Header({ darkMode, setDarkMode }) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <i className="fas fa-code text-primary-600 dark:text-primary-400 text-2xl"></i>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              Data Analysis Platform
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Help Button */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 
                       hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <i className="fas fa-question-circle text-xl"></i>
              <span className="hidden sm:inline">Help</span>
            </button>

            {/* Documentation Link */}
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 
                       hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <i className="fas fa-book text-xl"></i>
              <span className="hidden sm:inline">Docs</span>
            </a>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 
                       transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <i className="fas fa-sun text-yellow-400 text-xl"></i>
              ) : (
                <i className="fas fa-moon text-gray-600 text-xl"></i>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Navigation */}
        <nav className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="px-6 py-2 flex items-center justify-between">
            <div className="flex space-x-4">
              <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 
                               hover:text-primary-600 dark:hover:text-primary-400 
                               focus:outline-none transition-colors">
                <i className="fas fa-file-import mr-2"></i>
                Import Data
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 
                               hover:text-primary-600 dark:hover:text-primary-400 
                               focus:outline-none transition-colors">
                <i className="fas fa-save mr-2"></i>
                Save Project
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 
                               hover:text-primary-600 dark:hover:text-primary-400 
                               focus:outline-none transition-colors">
                <i className="fas fa-cog mr-2"></i>
                Settings
              </button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <i className="fas fa-signal"></i>
              <span>Connected to Server</span>
            </div>
          </div>
        </nav>
      </header>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Quick Help Guide
              </h2>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <section>
                <h3 className="font-semibold mb-2">Available Commands</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>load_csv(filename) - Load a CSV file</li>
                  <li>describe() - Show dataset description</li>
                  <li>plot(x, y) - Create a plot</li>
                  <li>train_model(feature, target) - Train ML model</li>
                  <li>Type 'help' in console for full list</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tab - Autocomplete commands</li>
                  <li>↑/↓ - Navigate command history</li>
                  <li>Ctrl+L - Clear console</li>
                </ul>
              </section>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg 
                         hover:bg-primary-700 focus:outline-none focus:ring-2 
                         focus:ring-primary-500 focus:ring-offset-2"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container for Notifications */}
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
    </>
  );
}

export default Header;
