import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          ¡Ups! Algo salió mal
        </h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
};

export const AppErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
      onError={(error) => {
        console.error('Error caught by boundary:', error);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};