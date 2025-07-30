import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "" 
});

export interface QuestionGenerationParams {
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  examType: "jamb" | "waec" | "neco" | "gce" | "custom";
  count: number;
}

export interface GeneratedQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}

export interface TutorResponse {
  explanation: string;
  examples?: string[];
  relatedTopics?: string[];
  confidence: number;
}

// Enhanced fallback patterns for intelligent responses
function generateQuestionExplanationFallback(questionText: string, correctAnswer: string, studentAnswer?: string): TutorResponse {
  const patterns = {
    mathematics: {
      keywords: ['calculate', 'solve', 'equation', 'formula', 'algebra', 'geometry', 'trigonometry', 'math'],
      explanation: "This is a mathematics problem requiring step-by-step calculation. The correct answer demonstrates proper application of mathematical principles.",
      examples: ["Work through the problem step by step", "Check your calculations carefully", "Verify using alternative methods"],
      relatedTopics: ["Mathematical formulas", "Problem-solving techniques", "Mathematical reasoning"]
    },
    english: {
      keywords: ['grammar', 'comprehension', 'passage', 'meaning', 'vocabulary', 'literature', 'essay'],
      explanation: "This question tests your understanding of English language rules and comprehension skills.",
      examples: ["Read the question carefully", "Consider context clues", "Analyze sentence structure"],
      relatedTopics: ["Grammar rules", "Reading comprehension", "Vocabulary building"]
    },
    science: {
      keywords: ['experiment', 'theory', 'hypothesis', 'chemical', 'physics', 'biology', 'reaction', 'cell', 'force'],
      explanation: "This science question requires understanding of scientific principles and their applications.",
      examples: ["Review the scientific concept", "Apply theoretical knowledge", "Connect to real-world examples"],
      relatedTopics: ["Scientific method", "Laboratory procedures", "Natural phenomena"]
    }
  };

  let category = 'general';
  const lowerText = questionText.toLowerCase();
  
  for (const [key, pattern] of Object.entries(patterns)) {
    if (pattern.keywords.some(keyword => lowerText.includes(keyword))) {
      category = key;
      break;
    }
  }

  const selectedPattern = patterns[category as keyof typeof patterns] || {
    explanation: "This question tests your knowledge and understanding of the subject matter.",
    examples: ["Read the question carefully", "Apply what you've learned", "Consider all options"],
    relatedTopics: ["Study materials", "Practice questions", "Subject fundamentals"]
  };

  let explanation = selectedPattern.explanation;
  if (studentAnswer && studentAnswer !== correctAnswer) {
    explanation += ` Your selected answer was ${studentAnswer}, but the correct answer is ${correctAnswer}. Review the concept and understand why this is the right choice.`;
  } else {
    explanation += ` The correct answer is ${correctAnswer}.`;
  }

  return {
    explanation,
    examples: selectedPattern.examples,
    relatedTopics: selectedPattern.relatedTopics,
    confidence: 0.85
  };
}

function generateTutoringFallback(query: string, context?: string): TutorResponse {
  const lowerQuery = query.toLowerCase();
  
  const subjectPatterns = {
    mathematics: {
      keywords: ['math', 'calculate', 'equation', 'formula', 'solve', 'algebra', 'geometry'],
      response: "Mathematics requires practice and understanding of fundamental concepts. Break down complex problems into smaller steps and practice regularly.",
      examples: ["Practice daily calculations", "Master basic formulas first", "Work through examples step by step"],
      topics: ["Basic arithmetic", "Algebraic concepts", "Problem-solving strategies"]
    },
    english: {
      keywords: ['english', 'grammar', 'writing', 'comprehension', 'vocabulary', 'essay'],
      response: "English language skills improve with consistent reading and practice. Focus on grammar rules and expand your vocabulary through regular reading.",
      examples: ["Read diverse materials daily", "Practice writing exercises", "Learn new vocabulary weekly"],
      topics: ["Grammar fundamentals", "Reading comprehension", "Essay writing techniques"]
    },
    science: {
      keywords: ['science', 'physics', 'chemistry', 'biology', 'experiment', 'theory'],
      response: "Science subjects require understanding of concepts and their practical applications. Connect theoretical knowledge with real-world examples.",
      examples: ["Understand the 'why' behind concepts", "Practice with past questions", "Relate theory to everyday life"],
      topics: ["Scientific method", "Laboratory techniques", "Natural phenomena"]
    }
  };

  let selectedPattern = subjectPatterns.mathematics; // default
  
  for (const [subject, pattern] of Object.entries(subjectPatterns)) {
    if (pattern.keywords.some(keyword => lowerQuery.includes(keyword))) {
      selectedPattern = pattern;
      break;
    }
  }

  return {
    explanation: selectedPattern.response + (context ? ` Given your context: ${context}, focus on understanding the fundamentals first.` : ""),
    examples: selectedPattern.examples,
    relatedTopics: selectedPattern.topics,
    confidence: 0.8
  };
}

export async function generateQuestions(params: QuestionGenerationParams): Promise<GeneratedQuestion[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = `Generate ${params.count} multiple choice questions for ${params.examType.toUpperCase()} exam preparation.

Subject: ${params.subject}
Topic: ${params.topic}
Difficulty: ${params.difficulty}

Requirements:
- Questions should match ${params.examType.toUpperCase()} exam standards
- Each question should have 4 options (A, B, C, D)
- Include detailed explanations for correct answers
- Questions should be clear and unambiguous
- Difficulty should be appropriate for ${params.difficulty} level

Return the response as a JSON array with this structure:
{
  "questions": [
    {
      "text": "Question text here",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this is correct",
      "difficulty": "${params.difficulty}"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Nigerian education specialist who creates high-quality exam questions for JAMB, WAEC, NECO, and GCE examinations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions");
  }
}

export async function explainQuestion(questionText: string, correctAnswer: string, studentAnswer?: string): Promise<TutorResponse> {
  const fallbackResponse = generateQuestionExplanationFallback(questionText, correctAnswer, studentAnswer);
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      return fallbackResponse;
    }

    const prompt = `As an AI tutor, explain this exam question to a Nigerian student:

Question: ${questionText}
Correct Answer: ${correctAnswer}
${studentAnswer ? `Student's Answer: ${studentAnswer}` : ""}

Please provide:
1. A clear explanation of the correct answer
2. Why other options are incorrect (if applicable)
3. Related concepts the student should understand
4. Study tips for this topic

Be encouraging and educational. Use simple language that Nigerian students can understand.

Respond in JSON format:
{
  "explanation": "Detailed explanation here",
  "examples": ["Example 1", "Example 2"],
  "relatedTopics": ["Topic 1", "Topic 2"],
  "confidence": 0.95
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI tutor specializing in Nigerian curriculum and exam preparation. You explain concepts clearly and encourage students."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      explanation: result.explanation || fallbackResponse.explanation,
      examples: result.examples || fallbackResponse.examples,
      relatedTopics: result.relatedTopics || fallbackResponse.relatedTopics,
      confidence: result.confidence || fallbackResponse.confidence,
    };
  } catch (error) {
    console.error("Error explaining question:", error);
    return fallbackResponse;
  }
}

export async function provideTutoring(query: string, context?: string): Promise<TutorResponse> {
  const fallbackResponse = generateTutoringFallback(query, context);
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      return fallbackResponse;
    }

    const prompt = `You are an AI tutor helping Nigerian students with their studies. 

Student Question: ${query}
${context ? `Additional Context: ${context}` : ""}

Please provide helpful, educational guidance that:
1. Directly answers the student's question
2. Provides clear, step-by-step explanations
3. Includes relevant examples
4. Suggests related study topics
5. Uses language appropriate for Nigerian students

Respond in JSON format:
{
  "explanation": "Your detailed explanation here",
  "examples": ["Example 1", "Example 2"],
  "relatedTopics": ["Topic 1", "Topic 2"],
  "confidence": 0.9
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable AI tutor specializing in Nigerian curriculum. You provide clear, encouraging, and educational guidance to students."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      explanation: result.explanation || fallbackResponse.explanation,
      examples: result.examples || fallbackResponse.examples,
      relatedTopics: result.relatedTopics || fallbackResponse.relatedTopics,
      confidence: result.confidence || fallbackResponse.confidence,
    };
  } catch (error) {
    console.error("Error providing tutoring:", error);
    return fallbackResponse;
  }
}