import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { QuizState, QuizAction, QuizSettings, QuizQuestion } from '../types';
import { generateQuestion } from '../services/geminiService';

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
      };
    case 'SET_QUESTION':
      const updatedQuestions = [...state.questions];
      updatedQuestions[action.payload.index] = action.payload.question;
      return {
        ...state,
        questions: updatedQuestions,
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
      dispatch({ type: 'SET_SETTINGS', payload: settings });
      dispatch({ type: 'SET_STATUS', payload: 'loading' });
      
      // Generate first question
      const firstQuestion = await generateQuestion(settings.topic, settings.difficulty);
      
      if (firstQuestion) {
        dispatch({
          type: 'SET_QUESTION',
          payload: { index: 0, question: firstQuestion },
        });
        dispatch({ type: 'SET_STATUS', payload: 'idle' });
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
      
      // Only generate if we don't already have this question
      if (!state.questions[nextIndex]) {
        const nextQuestion = await generateQuestion(
          state.settings.topic,
          state.settings.difficulty
        );
        
        if (nextQuestion) {
          dispatch({
            type: 'SET_QUESTION',
            payload: { index: nextIndex, question: nextQuestion },
          });
        } else {
          throw new Error('Failed to generate the next question');
        }
      }
      
      // Move to next question
      dispatch({ type: 'SET_STATUS', payload: 'idle' });
      
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      return;
    }
    
    // Update current question index
    return new Promise<void>((resolve) => {
      // Use setTimeout to ensure state is updated properly
      setTimeout(() => {
        dispatch({
          type: 'SET_STATUS',
          payload: 'idle',
        });
        resolve();
      }, 0);
    });
  };

  // Reset the quiz to initial state
  const resetQuiz = () => {
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

// Custom hook to use the quiz context
export const useQuiz = () => useContext(QuizContext);