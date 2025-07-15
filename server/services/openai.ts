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
  try {
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
      explanation: result.explanation || "I couldn't generate an explanation for this question.",
      examples: result.examples || [],
      relatedTopics: result.relatedTopics || [],
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    console.error("Error explaining question:", error);
    throw new Error("Failed to explain question");
  }
}

export async function provideTutoring(question: string, context?: string): Promise<TutorResponse> {
  try {
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
      explanation: result.explanation || "I'd be happy to help! Could you provide more details about what you're studying?",
      examples: result.examples || [],
      relatedTopics: result.relatedTopics || [],
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    console.error("Error providing tutoring:", error);
    throw new Error("Failed to provide tutoring response");
  }
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
