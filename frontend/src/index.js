import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full">
            <div className="text-red-600 dark:text-red-400 text-4xl mb-4">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The application encountered an error. Please try refreshing the page.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg 
                         hover:bg-primary-700 focus:outline-none focus:ring-2 
                         focus:ring-primary-500 focus:ring-offset-2"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 focus:outline-none focus:ring-2 
                         focus:ring-primary-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-auto">
                <pre className="text-xs text-gray-700 dark:text-gray-300">
                  {this.state.error.toString()}
                  {'\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Performance monitoring
const reportWebVitals = (metric) => {
  // You can send the metric to an analytics endpoint
  console.log(metric);
};

// Initialize the app with error boundary
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Monitor performance
reportWebVitals();

// Enable hot reloading in development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept();
}

// Handle service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(
      registration => {
        console.log('ServiceWorker registration successful');
      },
      err => {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}
