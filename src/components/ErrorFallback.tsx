import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Something went wrong
          </h2>
          
          <p className="text-gray-600 mb-6">
            We're sorry, but there was an error loading the quiz.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 w-full text-left">
            <p className="text-red-800 text-sm font-medium">Error message:</p>
            <p className="text-red-700 text-sm mt-1 break-words">{error.message}</p>
          </div>
          
          <button
            onClick={resetErrorBoundary}
            className="flex items-center justify-center w-full py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition duration-200"
          >
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;