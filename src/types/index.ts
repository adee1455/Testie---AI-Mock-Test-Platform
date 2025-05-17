export interface QuizSettings {
  topic: string;
  numberOfQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  codeSnippet?: string;
}

export interface QuizState {
  settings: QuizSettings;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: Record<number, string | null>;
  status: 'idle' | 'loading' | 'fetching' | 'completed' | 'error';
  error: string | null;
}

export type QuizAction =
  | { type: 'SET_SETTINGS'; payload: QuizSettings }
  | { type: 'SET_QUESTION'; payload: { index: number; question: QuizQuestion } }
  | { type: 'SET_USER_ANSWER'; payload: { index: number; answer: string } }
  | { type: 'SET_STATUS'; payload: 'idle' | 'loading' | 'fetching' | 'completed' | 'error' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_QUIZ' };