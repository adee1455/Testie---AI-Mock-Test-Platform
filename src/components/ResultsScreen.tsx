import React, { useMemo, useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { Award, RefreshCw, Check, X, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

const ResultsScreen: React.FC = () => {
  const { state, resetQuiz } = useQuiz();
  const [timeSpent, setTimeSpent] = useState(0);
  
  // Get time spent from localStorage
  useEffect(() => {
    const savedTime = localStorage.getItem('quizTimeSpent');
    if (savedTime) {
      setTimeSpent(parseInt(savedTime, 10));
    }
  }, []);

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

  // Generate and download PDF report
  const generateReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Title with gradient-like effect
    doc.setFillColor(79, 70, 229); // Indigo color
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Quiz Results Report', pageWidth / 2, 25, { align: 'center' });
    
    // Reset text color for content
    doc.setTextColor(31, 41, 55); // Dark gray for text
    
    // Quiz Info in a styled box
    doc.setFillColor(224, 231, 255); // Light indigo background
    doc.roundedRect(margin, 50, contentWidth, 40, 3, 3, 'F');
    doc.setFontSize(12);
    doc.text(`Topic: ${state.settings.topic}`, margin + 10, 65);
    doc.text(`Difficulty: ${state.settings.difficulty}`, margin + 10, 75);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin + 10, 85);
    
    // Score Summary with visual elements
    doc.setFontSize(18);
    doc.text('Score Summary', margin, 110);
    
    // Score circle
    const scoreX = pageWidth / 2;
    const scoreY = 140;
    doc.setDrawColor(79, 70, 229); // Indigo border
    doc.setLineWidth(0.5);
    doc.circle(scoreX, scoreY, 30, 'S');
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229); // Indigo text
    doc.text(`${results.score.toFixed(1)}%`, scoreX, scoreY + 5, { align: 'center' });
    
    // Score details
    doc.setTextColor(31, 41, 55); // Dark gray text
    doc.setFontSize(12);
    doc.text(`Correct Answers: ${results.correctAnswers}/${results.totalQuestions}`, margin, 180);
    doc.text(`Time Taken: ${formatTime(timeSpent)}`, margin, 190);
    
    // Performance message in a styled box
    doc.setFillColor(224, 231, 255); // Light indigo background
    doc.roundedRect(margin, 200, contentWidth, 20, 3, 3, 'F');
    doc.text(results.performanceMessage, margin + 10, 213);
    
    // Question Review
    doc.setFontSize(18);
    doc.text('Question Review', margin, 240);
    
    let yPosition = 250;
    state.questions.forEach((question, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = margin;
      }
      
      const userAnswer = state.userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      // Question header with background
      doc.setFillColor(
        isCorrect ? 220 : 254,
        isCorrect ? 252 : 226,
        isCorrect ? 231 : 226
      ); // Green for correct, red for incorrect
      doc.roundedRect(margin, yPosition, contentWidth, 15, 3, 3, 'F');
      doc.setFontSize(14);
      doc.text(`Question ${index + 1}`, margin + 5, yPosition + 10);
      yPosition += 20;
      
      // Question text
      doc.setFontSize(12);
      const questionLines = doc.splitTextToSize(question.question, contentWidth - 10);
      questionLines.forEach((line: string) => {
        // Check if we need a new page before adding text
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin + 5, yPosition);
        yPosition += 7;
      });
      
      // Code snippet if available
      if (question.codeSnippet) {
        yPosition += 5;
        // Check if we need a new page before adding code snippet
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFillColor(243, 244, 246); // Light gray background
        doc.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F');
        const codeLines = doc.splitTextToSize(question.codeSnippet, contentWidth - 20);
        codeLines.forEach((line: string) => {
          // Check if we need a new page before adding code line
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 10, yPosition + 7);
          yPosition += 7;
        });
        yPosition += 5;
      }
      
      // Options
      Object.entries(question.options).forEach(([option, text]) => {
        // Check if we need a new page before adding option
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        
        const isUserAnswer = option === userAnswer;
        const isCorrectAnswer = option === question.correctAnswer;
        
        // Option background
        if (isCorrectAnswer) {
          doc.setFillColor(220, 252, 231); // Light green
        } else if (isUserAnswer) {
          doc.setFillColor(254, 226, 226); // Light red
        } else {
          doc.setFillColor(243, 244, 246); // Light gray
        }
        
        doc.roundedRect(margin, yPosition, contentWidth, 15, 3, 3, 'F');
        
        // Option text
        doc.text(`${option}. ${text}`, margin + 5, yPosition + 10);
        yPosition += 20;
      });
      
      // Explanation
      yPosition += 5;
      // Check if we need a new page before adding explanation
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.setFillColor(224, 231, 255); // Light indigo background
      doc.roundedRect(margin, yPosition, contentWidth, 20, 3, 3, 'F');
      const explanationLines = doc.splitTextToSize(`Explanation: ${question.explanation}`, contentWidth - 20);
      explanationLines.forEach((line: string) => {
        // Check if we need a new page before adding explanation line
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin + 5, yPosition + 7);
        yPosition += 7;
      });
      
      yPosition += 15;
    });
    
    // Save the PDF
    doc.save(`quiz-report-${state.settings.topic}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Results header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Quiz Results
          </h1>
          <div className="text-gray-600">
            Topic: {state.settings.topic} | Difficulty: {state.settings.difficulty}
          </div>
        </div>

        {/* Score summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Score Summary</h2>
              <p className="text-gray-600">Time taken: {formatTime(timeSpent)}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-black">
                {results.score.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                {results.correctAnswers} of {state.settings.numberOfQuestions} correct
              </div>
            </div>
          </div>

          {/* Performance message */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-800">
              {results.performanceMessage}
            </p>
          </div>
        </div>

        {/* Question review */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Question Review</h2>
          <div className="space-y-6">
            {state.questions.map((question, index) => {
              const userAnswer = state.userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-800">
                      Question {index + 1}
                    </h3>
                    <div className={`flex items-center ${
                      isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isCorrect ? (
                        <Check size={20} className="mr-1" />
                      ) : (
                        <X size={20} className="mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{question.question}</p>

                  {/* Code snippet if available */}
                  {question.codeSnippet && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto">
                      <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                        {question.codeSnippet}
                      </pre>
                    </div>
                  )}

                  <div className="space-y-2">
                    {Object.entries(question.options).map(([option, text]) => {
                      const isUserAnswer = option === userAnswer;
                      const isCorrectAnswer = option === question.correctAnswer;

                      return (
                        <div
                          key={option}
                          className={`p-3 rounded-lg border ${
                            isCorrectAnswer
                              ? 'border-green-500 bg-green-50'
                              : isUserAnswer
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm font-medium ${
                              isCorrectAnswer
                                ? 'bg-green-600 text-white'
                                : isUserAnswer
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {option}
                            </div>
                            <div className="flex-1">
                              <p className={`${
                                isCorrectAnswer
                                  ? 'text-green-800'
                                  : isUserAnswer
                                  ? 'text-red-800'
                                  : 'text-gray-700'
                              }`}>
                                {text}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Explanation:</span> {question.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={generateReport}
            className="flex items-center justify-center py-2.5 px-5 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg shadow transition duration-200"
          >
            <Download size={18} className="mr-2" />
            Download Report
          </button>
          <button
            onClick={resetQuiz}
            className="flex items-center justify-center py-2.5 px-5 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200 shadow transition duration-200"
          >
            Start New Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;