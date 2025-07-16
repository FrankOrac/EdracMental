import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "" 
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

export async function generateQuestions(params: QuestionGenerationParams): Promise<GeneratedQuestion[]> {
  try {
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
  // Generate smart fallback first
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
      confidence: result.confidence || 0.8,
    };
  } catch (error) {
    console.error("Error explaining question:", error);
    return fallbackResponse;
  }
}

function generateQuestionExplanationFallback(questionText: string, correctAnswer: string, studentAnswer?: string): TutorResponse {
  let explanation = `The correct answer is ${correctAnswer}. `;
  
  if (studentAnswer && studentAnswer !== correctAnswer) {
    explanation += `You selected ${studentAnswer}, which is incorrect. `;
  }
  
  explanation += "To understand this better, review the key concepts related to this topic and practice similar questions.";
  
  return {
    explanation,
    examples: ["Review your textbook for similar examples", "Practice more questions on this topic"],
    relatedTopics: ["Core concepts", "Practice exercises", "Exam techniques"],
    confidence: 0.6
  };
}

export async function provideTutoring(question: string, context?: string): Promise<TutorResponse> {
  // First try with fallback response if API is not available
  const fallbackResponse = generateSmartFallback(question, context);
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      return fallbackResponse;
    }

    const prompt = `A Nigerian student is asking for help with their studies:

Student Question: ${question}
${context ? `Context: ${context}` : ""}

Provide a helpful, encouraging response that:
1. Directly answers their question
2. Provides clear explanations with examples
3. Suggests related topics to study
4. Encourages further learning

Keep your response appropriate for Nigerian secondary school students.

Respond in JSON format:
{
  "explanation": "Your helpful response here",
  "examples": ["Practical example 1", "Practical example 2"],
  "relatedTopics": ["Related topic 1", "Related topic 2"],
  "confidence": 0.90
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an encouraging AI tutor helping Nigerian students with their studies. You understand the Nigerian curriculum and examination systems (JAMB, WAEC, NECO, GCE)."
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
      confidence: result.confidence || 0.8,
    };
  } catch (error) {
    console.error("Error providing tutoring:", error);
    return fallbackResponse;
  }
}

function generateSmartFallback(question: string, context?: string): TutorResponse {
  const lowerQuestion = question.toLowerCase();
  
  // Detect subject areas
  let subject = "general";
  let examples: string[] = [];
  let relatedTopics: string[] = [];
  
  if (lowerQuestion.includes("math") || lowerQuestion.includes("algebra") || lowerQuestion.includes("equation") || /\d+/.test(question)) {
    subject = "mathematics";
    examples = ["Start with basic examples", "Practice step-by-step solutions", "Use visual aids like graphs"];
    relatedTopics = ["Problem solving", "Mathematical reasoning", "Basic calculations"];
  } else if (lowerQuestion.includes("physics") || lowerQuestion.includes("force") || lowerQuestion.includes("motion")) {
    subject = "physics";
    examples = ["Real-world applications", "Laboratory experiments", "Formula applications"];
    relatedTopics = ["Scientific method", "Mathematical physics", "Applied sciences"];
  } else if (lowerQuestion.includes("chemistry") || lowerQuestion.includes("reaction") || lowerQuestion.includes("element")) {
    subject = "chemistry";
    examples = ["Chemical equations", "Laboratory procedures", "Molecular structures"];
    relatedTopics = ["Periodic table", "Chemical bonding", "Reaction mechanisms"];
  } else if (lowerQuestion.includes("biology") || lowerQuestion.includes("cell") || lowerQuestion.includes("organism")) {
    subject = "biology";
    examples = ["Living examples", "Biological processes", "Ecosystem interactions"];
    relatedTopics = ["Life processes", "Evolution", "Ecology"];
  } else if (lowerQuestion.includes("english") || lowerQuestion.includes("essay") || lowerQuestion.includes("grammar")) {
    subject = "english";
    examples = ["Reading comprehension", "Essay structure", "Grammar rules"];
    relatedTopics = ["Literature analysis", "Writing skills", "Communication"];
  }
  
  const explanations = {
    mathematics: "For math problems, break them into smaller steps. Identify what you know and what you need to find. Practice similar problems and check your work.",
    physics: "Physics concepts are easier when you connect them to real-world examples. Focus on understanding the principles behind formulas.",
    chemistry: "Chemistry is about understanding how substances interact. Learn the patterns and practice balancing equations.",
    biology: "Biology is the study of life. Connect concepts to living examples around you and understand the processes.",
    english: "For English, focus on understanding the context and main ideas. Practice reading regularly and expand your vocabulary.",
    general: "Great question! Break it down into smaller parts and connect it to what you already know. Practice regularly and don't hesitate to ask for clarification."
  };
  
  return {
    explanation: explanations[subject] || explanations.general,
    examples,
    relatedTopics,
    confidence: 0.7
  };
}

export async function generateStudyPlan(subjects: string[], examType: string, timeFrame: number): Promise<{
  plan: any[];
  tips: string[];
}> {
  try {
    const prompt = `Create a study plan for a Nigerian student preparing for ${examType.toUpperCase()} examination.

Subjects: ${subjects.join(", ")}
Time Frame: ${timeFrame} weeks

Create a structured study plan that includes:
1. Weekly breakdown of topics to cover
2. Daily study schedule recommendations
3. Practice test scheduling
4. Review periods
5. Study tips specific to each subject

Respond in JSON format:
{
  "plan": [
    {
      "week": 1,
      "subjects": {
        "Mathematics": ["Algebra basics", "Quadratic equations"],
        "English": ["Comprehension", "Essay writing"]
      },
      "practiceTests": ["Week 1 diagnostic test"],
      "goals": ["Complete basic algebra", "Improve reading speed"]
    }
  ],
  "tips": [
    "Study tip 1",
    "Study tip 2"
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Nigerian education consultant who creates effective study plans for students preparing for JAMB, WAEC, NECO, and GCE examinations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      plan: result.plan || [],
      tips: result.tips || [],
    };
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw new Error("Failed to generate study plan");
  }
}
