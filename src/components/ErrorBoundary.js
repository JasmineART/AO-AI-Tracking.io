/**
 * React Error Boundary Component
 * Catches and handles React component errors
 */

import React from 'react';
import errorMonitor from '../utils/errorMonitoring';
import { isProduction, reportError, devError } from '../utils/production';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = Date.now().toString();
    
    // Log error to monitoring system
    errorMonitor.logError({
      type: 'React Component Error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      errorId
    });

    // Report to external service in production
    reportError(error, {
      componentStack: errorInfo.componentStack,
      errorId,
      props: this.props
    });

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
      errorId
    }));

    // Only log to console in development
    devError('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Reload the page if errors persist
    if (this.state.errorCount > 3) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600">
                We've encountered an unexpected error. Don't worry, we're tracking it.
              </p>
            </div>

            {!isProduction() && this.state.error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-red-800 mb-2">Error Details (Development Only):</h3>
                <pre className="text-xs text-red-700 overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            {isProduction() && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  📧 This error has been automatically reported to our team. 
                  We'll work on fixing it as soon as possible.
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-bold"
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-bold"
              >
                🏠 Go Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold"
              >
                ↻ Refresh Page
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Error ID: {this.state.errorId || 'Unknown'}</p>
              <p>If this problem persists, please contact support with the Error ID above.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
