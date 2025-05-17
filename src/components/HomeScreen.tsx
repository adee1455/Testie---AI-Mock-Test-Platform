import React, { useState } from 'react';
import { BookOpen, Brain, School } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { QuizSettings } from '../types';

const HomeScreen: React.FC = () => {
  const { startQuiz } = useQuiz();
  const [settings, setSettings] = useState<QuizSettings>({
    topic: '',
    numberOfQuestions: 5,
    difficulty: 'Medium',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === 'numberOfQuestions' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!settings.topic.trim()) {
      setErrorMessage('Please enter an exam name or topic');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      await startQuiz(settings);
    } catch (error) {
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Failed to start the quiz. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500 rounded-full text-white">
              <Brain size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Mock Test Generator</h1>
          <p className="text-gray-600">
            Create personalized quizzes on any topic with AI-generated questions
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 transition-all duration-300 hover:shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Exam Name or Topic
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <BookOpen size={18} />
                </div>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={settings.topic}
                  onChange={handleChange}
                  placeholder="e.g., Basic Python, World War 2"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="numberOfQuestions" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Questions
                </label>
                <select
                  id="numberOfQuestions"
                  name="numberOfQuestions"
                  value={settings.numberOfQuestions}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <School size={18} />
                  </div>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={settings.difficulty}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition duration-200 flex items-center justify-center ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Test...
                </>
              ) : (
                'Start Test'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;