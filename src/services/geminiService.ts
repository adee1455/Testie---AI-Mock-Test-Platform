import { QuizQuestion } from '../types';

const GEMINI_API_KEY = 'AIzaSyCGYsSSxUKPKD2F9c-7M6mZ51OSpl1_t8w';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Keep track of used questions to ensure uniqueness
const usedQuestions = new Set<string>();

/**
 * Calls the Gemini API to generate a quiz question based on given parameters
 */
export async function generateQuestion(
  topic: string,
  difficulty: string,
  retries = 3
): Promise<QuizQuestion | null> {
  const prompt = `
You are a quiz generator. Create a single multiple-choice quiz question on the topic of "${topic}" at a "${difficulty}" difficulty level. Make sure the question is unique and challenging. The format should be:
Question: <The question>
A. <Option A>
B. <Option B>
C. <Option C>
D. <Option D>
Correct Answer: <Correct option letter>
Explanation: <1-2 line explanation>

Important:
- Make sure options are clearly distinct
- Avoid obvious incorrect answers
- Include plausible distractors
- Keep question text clear and concise
`;

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8, // Increased for more variety
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    }),
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate question');
    }
    
    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!text) {
      throw new Error('No text in response');
    }

    const question = parseQuestionFromText(text);

    // Check if this question has been used before
    if (usedQuestions.has(question.question)) {
      if (retries > 0) {
        console.log('Duplicate question detected, generating new one...');
        return generateQuestion(topic, difficulty, retries - 1);
      }
      throw new Error('Unable to generate unique question after multiple attempts');
    }

    // Add to used questions set
    usedQuestions.add(question.question);
    return question;

  } catch (error) {
    console.error('Error generating question:', error);
    
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      return generateQuestion(topic, difficulty, retries - 1);
    }
    
    throw error;
  }
}

/**
 * Parses raw text from API into a structured question object
 */
function parseQuestionFromText(text: string): QuizQuestion {
  // Default structure in case parsing fails
  const defaultQuestion: QuizQuestion = {
    question: 'Failed to generate a proper question. Please try again.',
    options: {
      A: 'Option A',
      B: 'Option B',
      C: 'Option C',
      D: 'Option D',
    },
    correctAnswer: 'A',
    explanation: 'Could not parse the explanation.',
  };

  try {
    // Extract question
    const questionMatch = text.match(/Question:\s*(.*?)(?=\n[A-D]\.|\n\n)/s);
    if (!questionMatch) return defaultQuestion;
    
    // Extract options
    const optionAMatch = text.match(/A\.\s*(.*?)(?=\n[B-D]\.|\n\n|$)/s);
    const optionBMatch = text.match(/B\.\s*(.*?)(?=\n[C-D]\.|\n\n|$)/s);
    const optionCMatch = text.match(/C\.\s*(.*?)(?=\n[D]\.|\n\n|$)/s);
    const optionDMatch = text.match(/D\.\s*(.*?)(?=\nCorrect Answer:|\n\n|$)/s);
    
    // Extract correct answer
    const correctAnswerMatch = text.match(/Correct Answer:\s*([A-D])/);
    
    // Extract explanation
    const explanationMatch = text.match(/Explanation:\s*(.*?)(?=\n\n|$)/s);
    
    if (!optionAMatch || !optionBMatch || !optionCMatch || !optionDMatch || !correctAnswerMatch) {
      return defaultQuestion;
    }
    
    return {
      question: questionMatch[1].trim(),
      options: {
        A: optionAMatch[1].trim(),
        B: optionBMatch[1].trim(),
        C: optionCMatch[1].trim(),
        D: optionDMatch[1].trim(),
      },
      correctAnswer: correctAnswerMatch[1] as 'A' | 'B' | 'C' | 'D',
      explanation: explanationMatch ? explanationMatch[1].trim() : 'No explanation provided.',
    };
  } catch (error) {
    console.error('Error parsing question:', error);
    return defaultQuestion;
  }
}