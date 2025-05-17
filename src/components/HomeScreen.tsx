import React, { useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { Play, Settings, Info } from 'lucide-react';

const HomeScreen: React.FC = () => {
  const { startQuiz } = useQuiz();
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [settings, setSettings] = useState({
    topic: '',
    numberOfQuestions: 5,
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
  });

  const handleStartQuiz = () => {
    startQuiz(settings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Testie Logo" className="mx-auto mb-6 w-36 h-36 rounded-full bg-black object-contain border-2 border-gray-800 shadow-lg" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to Testie
          </h1>
          <p className="text-gray-600">
            Smarter, faster, AI-powered mock tests for every learner. Boost your confidence and ace your exams with Testie!
          </p>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          {/* Settings form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <input
                type="text"
                id="topic"
                value={settings.topic}
                onChange={(e) => setSettings({ ...settings, topic: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="Enter a topic (e.g., Python Basics, JavaScript, React)"
              />
            </div>

            <div>
              <label htmlFor="questions" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions
              </label>
              <select
                id="questions"
                value={settings.numberOfQuestions}
                onChange={(e) => setSettings({ ...settings, numberOfQuestions: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={settings.difficulty}
                onChange={(e) => setSettings({ ...settings, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Start button */}
            <button
              onClick={handleStartQuiz}
              className="w-full flex items-center justify-center py-3 px-6 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg shadow transition duration-200"
            >
              <Play size={20} className="mr-2" />
              Start Quiz
            </button>
          </div>

          {/* Info section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Info size={18} className="mr-2" />
                How it works
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings size={18} className="mr-2" />
                Settings
              </button>
            </div>

            {showInfo && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">About the Quiz</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Questions are generated using AI technology</li>
                  <li>• Each quiz is unique and tailored to your topic</li>
                  <li>• Get immediate feedback on your answers</li>
                  <li>• Review your performance at the end</li>
                </ul>
              </div>
            )}

            {showSettings && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Quiz Settings</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Choose any programming topic</li>
                  <li>• Select number of questions (5-20)</li>
                  <li>• Pick difficulty level</li>
                  <li>• Questions adapt to your choices</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;