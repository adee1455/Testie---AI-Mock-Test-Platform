import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQuiz, QuizProvider } from './context/QuizContext';
import ErrorFallback from './components/ErrorFallback';

// Lazy load components
const HomeScreen = lazy(() => import('./components/HomeScreen'));
const QuizScreen = lazy(() => import('./components/QuizScreen'));
const ResultsScreen = lazy(() => import('./components/ResultsScreen'));

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const QuizApp: React.FC = () => {
  const { state } = useQuiz();

  // Determine which screen to show based on app state
  const renderScreen = () => {
    // No questions or completed
    if (state.status === 'idle' && state.questions.length === 0) {
      return <HomeScreen />;
    }
    
    // Quiz completed
    if (state.status === 'completed') {
      return <ResultsScreen />;
    }
    
    // Quiz in progress
    return <QuizScreen />;
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingScreen />}>
        {renderScreen()}
      </Suspense>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <QuizProvider>
      <QuizApp />
    </QuizProvider>
  );
}

export default App;