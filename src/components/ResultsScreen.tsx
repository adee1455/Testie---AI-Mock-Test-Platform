import React, { useMemo } from 'react';
import { useQuiz } from '../context/QuizContext';
import { Award, RefreshCw, Check, X, ArrowLeft } from 'lucide-react';

const ResultsScreen: React.FC = () => {
  const { state, resetQuiz } = useQuiz();
  
  // Calculate results
  const results = useMemo(() => {
    const totalQuestions = state.settings.numberOfQuestions;
    const answeredQuestions = Object.keys(state.userAnswers).length;
    
    let correctAnswers = 0;
    for (let i = 0; i < totalQuestions; i++) {
      const userAnswer = state.userAnswers[i];
      const correctAnswer = state.questions[i]?.correctAnswer;
      if (userAnswer && userAnswer === correctAnswer) {
        correctAnswers++;
      }
    }
    
    const score = (correctAnswers / totalQuestions) * 100;
    
    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      score,
      performanceMessage: getPerformanceMessage(score),
    };
  }, [state]);
  
  // Generate message based on score
  function getPerformanceMessage(score: number): string {
    if (score >= 90) return "Excellent! You've mastered this topic!";
    if (score >= 75) return "Great job! You know your stuff!";
    if (score >= 60) return "Good effort! You have a solid understanding.";
    if (score >= 40) return "Not bad! Keep practicing to improve.";
    return "Keep studying! You'll get better with practice.";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with score */}
          <div className="bg-blue-600 p-6 text-center text-white">
            <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-white bg-opacity-20 mb-4">
              <Award size={40} className="text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Your Results
            </h2>
            <div className="text-4xl md:text-5xl font-bold mt-2">
              {Math.round(results.score)}%
            </div>
            <p className="mt-2 text-blue-100">
              {results.performanceMessage}
            </p>
          </div>
          
          {/* Score details */}
          <div className="p-6">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mb-6">
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-gray-800">
                  {results.correctAnswers}
                </div>
                <div className="text-sm text-gray-500">Correct</div>
              </div>
              <div className="h-10 w-px bg-gray-300"></div>
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-gray-800">
                  {results.totalQuestions - results.correctAnswers}
                </div>
                <div className="text-sm text-gray-500">Incorrect</div>
              </div>
              <div className="h-10 w-px bg-gray-300"></div>
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-gray-800">
                  {results.totalQuestions}
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
            
            {/* Question review */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Question Review
              </h3>
              
              <div className="space-y-2">
                {state.questions.map((question, index) => {
                  const userAnswer = state.userAnswers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${
                        isCorrect 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          {isCorrect ? (
                            <Check className="text-green-600" size={20} />
                          ) : (
                            <X className="text-red-600" size={20} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {index + 1}. {question.question}
                          </p>
                          
                          {!isCorrect && (
                            <div className="mt-2 text-sm">
                              <p className="text-red-700">
                                Your answer: {userAnswer} - {question.options[userAnswer as keyof typeof question.options]}
                              </p>
                              <p className="text-green-700 mt-1">
                                Correct answer: {question.correctAnswer} - {question.options[question.correctAnswer]}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Quiz info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600">
                <p><strong>Topic:</strong> {state.settings.topic}</p>
                <p><strong>Difficulty:</strong> {state.settings.difficulty}</p>
                <p><strong>Questions:</strong> {state.settings.numberOfQuestions}</p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetQuiz}
                className="flex items-center justify-center py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition duration-200 flex-1"
              >
                <RefreshCw size={18} className="mr-2" />
                Try Another Topic
              </button>
              
              <button
                onClick={() => {
                  // Start a new quiz with the same settings
                  resetQuiz();
                  // The user will need to press start test again
                }}
                className="flex items-center justify-center py-2.5 px-5 bg-white border border-blue-500 hover:bg-blue-50 text-blue-600 font-medium rounded-lg transition duration-200 flex-1"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;