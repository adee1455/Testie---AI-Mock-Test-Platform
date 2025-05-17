import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronRight, Timer, HelpCircle } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';

const QuizScreen: React.FC = () => {
  const { state, answerQuestion, nextQuestion } = useQuiz();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const currentIndex = state.currentQuestionIndex;
  const currentQuestion = state.questions[currentIndex];
  const isAnswered = state.userAnswers[currentIndex] !== undefined;
  const isCorrect = 
    isAnswered && 
    state.userAnswers[currentIndex] === currentQuestion?.correctAnswer;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle when user selects an answer
  const handleSelectAnswer = (answer: string) => {
    if (isAnswered || showFeedback) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    answerQuestion(answer);
  };

  // Progress to next question
  const handleNextQuestion = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setShowFeedback(false);
    setSelectedAnswer(null);
    
    try {
      await nextQuestion();
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  // Calculate progress percentage
  const progress = ((currentIndex + 1) / state.settings.numberOfQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Quiz header with progress */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-gray-600 font-medium">
              Question {currentIndex + 1} of {state.settings.numberOfQuestions}
            </div>
            <div className="flex items-center text-gray-600">
              <Timer size={16} className="mr-1" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            Topic: {state.settings.topic} | Difficulty: {state.settings.difficulty}
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6 transition-all duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion.question}
          </h2>

          {/* Answer options */}
          <div className="space-y-3">
            {Object.entries(currentQuestion.options).map(([option, text]) => {
              // Determine styling based on answer status
              let optionClasses = 
                "flex items-start p-4 border rounded-lg transition-all duration-200 cursor-pointer ";
              
              if (showFeedback) {
                if (option === currentQuestion.correctAnswer) {
                  // Correct answer
                  optionClasses += "border-green-500 bg-green-50 text-green-800 ";
                } else if (option === selectedAnswer) {
                  // Selected but incorrect
                  optionClasses += "border-red-500 bg-red-50 text-red-800 ";
                } else {
                  // Not selected
                  optionClasses += "border-gray-200 text-gray-500 opacity-70 ";
                }
              } else {
                // Not answered yet
                optionClasses += 
                  "border-gray-200 hover:border-blue-400 hover:bg-blue-50 ";
                
                if (option === selectedAnswer) {
                  optionClasses += "border-blue-500 bg-blue-50 ";
                }
              }

              return (
                <div
                  key={option}
                  className={optionClasses}
                  onClick={() => handleSelectAnswer(option)}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-3 font-medium">
                    {option}
                  </div>
                  <div className="flex-1">
                    <p>{text}</p>
                  </div>
                  
                  {showFeedback && option === currentQuestion.correctAnswer && (
                    <CheckCircle className="flex-shrink-0 ml-2 text-green-600" size={20} />
                  )}
                  
                  {showFeedback && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                    <XCircle className="flex-shrink-0 ml-2 text-red-600" size={20} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Feedback area */}
          {showFeedback && (
            <div className={`mt-6 p-4 rounded-lg ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  {isCorrect ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <XCircle className="text-red-600" size={24} />
                  )}
                </div>
                <div>
                  <h3 className={`font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h3>
                  <p className="mt-1 text-gray-700">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          {showFeedback && (
            <button
              onClick={handleNextQuestion}
              disabled={isLoading}
              className={`flex items-center py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition duration-200 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading...
                </>
              ) : currentIndex === state.settings.numberOfQuestions - 1 ? (
                'See Results'
              ) : (
                <>
                  Next Question
                  <ChevronRight size={18} className="ml-1" />
                </>
              )}
            </button>
          )}
          
          {!showFeedback && !selectedAnswer && (
            <div className="flex items-center text-gray-500">
              <HelpCircle size={16} className="mr-1.5" />
              <span>Select an answer to continue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;