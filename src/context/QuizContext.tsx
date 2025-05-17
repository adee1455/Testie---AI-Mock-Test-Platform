import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { QuizState, QuizAction, QuizSettings, QuizQuestion } from '../types';
import { generateQuestion, resetUsedQuestions } from '../services/geminiService';

// Initial state
const initialState: QuizState = {
  settings: {
    topic: '',
    numberOfQuestions: 5,
    difficulty: 'Medium',
  },
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  status: 'idle',
  error: null,
};

// Create context
const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
  startQuiz: (settings: QuizSettings) => Promise<void>;
  answerQuestion: (answer: string) => void;
  nextQuestion: () => Promise<void>;
  resetQuiz: () => void;
}>({
  state: initialState,
  dispatch: () => null,
  startQuiz: async () => {},
  answerQuestion: () => {},
  nextQuestion: async () => {},
  resetQuiz: () => {},
});

// Reducer function
function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload,
        questions: [],
        currentQuestionIndex: 0,
        userAnswers: {},
        status: 'idle',
        error: null,
      };
    case 'SET_QUESTION':
      const updatedQuestions = [...state.questions];
      updatedQuestions[action.payload.index] = action.payload.question;
      return {
        ...state,
        questions: updatedQuestions,
        status: 'idle',
      };
    case 'SET_USER_ANSWER':
      return {
        ...state,
        userAnswers: {
          ...state.userAnswers,
          [action.payload.index]: action.payload.answer,
        },
      };
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        status: action.payload ? 'error' : state.status,
      };
    case 'SET_CURRENT_QUESTION_INDEX':
      return {
        ...state,
        currentQuestionIndex: action.payload,
      };
    case 'RESET_QUIZ':
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

// Provider component
export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  // Start the quiz with given settings
  const startQuiz = async (settings: QuizSettings) => {
    try {
      // Reset used questions when starting a new quiz
      resetUsedQuestions();
      
      dispatch({ type: 'SET_SETTINGS', payload: settings });
      dispatch({ type: 'SET_STATUS', payload: 'loading' });
      
      // Generate first question
      const firstQuestion = await generateQuestion(settings.topic, settings.difficulty);
      
      if (firstQuestion) {
        dispatch({
          type: 'SET_QUESTION',
          payload: { index: 0, question: firstQuestion },
        });
      } else {
        throw new Error('Failed to generate the first question');
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  // Record user's answer for current question
  const answerQuestion = (answer: string) => {
    dispatch({
      type: 'SET_USER_ANSWER',
      payload: { index: state.currentQuestionIndex, answer },
    });
  };

  // Move to next question and generate it if needed
  const nextQuestion = async () => {
    const nextIndex = state.currentQuestionIndex + 1;
    
    // Check if we've reached the end
    if (nextIndex >= state.settings.numberOfQuestions) {
      dispatch({ type: 'SET_STATUS', payload: 'completed' });
      return;
    }
    
    try {
      // Set status to fetching while we get the next question
      dispatch({ type: 'SET_STATUS', payload: 'fetching' });
      
      // Generate next question
      const nextQuestion = await generateQuestion(
        state.settings.topic,
        state.settings.difficulty
      );
      
      if (nextQuestion) {
        dispatch({
          type: 'SET_QUESTION',
          payload: { index: nextIndex, question: nextQuestion },
        });
        // Update current question index
        dispatch({ type: 'SET_CURRENT_QUESTION_INDEX', payload: nextIndex });
        dispatch({ type: 'SET_STATUS', payload: 'idle' });
      } else {
        throw new Error('Failed to generate the next question');
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  // Reset the quiz to initial state
  const resetQuiz = () => {
    resetUsedQuestions();
    dispatch({ type: 'RESET_QUIZ' });
  };

  return (
    <QuizContext.Provider
      value={{
        state,
        dispatch,
        startQuiz,
        answerQuestion,
        nextQuestion,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};