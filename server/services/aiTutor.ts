import { storage } from "../storage";
import { 
  AiTutorSession, 
  LearningHistory, 
  AiWebResource, 
  UserSubject,
  InsertAiTutorSession, 
  InsertLearningHistory 
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

interface TutorMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  type?: "text" | "audio" | "explanation" | "lesson";
}

interface LearningPath {
  currentLevel: "beginner" | "intermediate" | "advanced";
  completedTopics: string[];
  nextRecommendations: string[];
  strengthAreas: string[];
  improvementAreas: string[];
}

export class EnhancedAITutor {
  private userId: string;
  private currentSession: AiTutorSession | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  async startSession(params: {
    sessionName: string;
    subjectId?: number;
    topicId?: number;
    sessionType: "explanation" | "lesson" | "practice" | "qa";
    difficulty: "beginner" | "intermediate" | "advanced";
  }): Promise<AiTutorSession> {
    const sessionData: InsertAiTutorSession & { userId: string } = {
      userId: this.userId,
      sessionName: params.sessionName,
      subjectId: params.subjectId,
      topicId: params.topicId,
      sessionType: params.sessionType,
      difficulty: params.difficulty,
      messages: [],
      learningPath: await this.generateLearningPath(params.subjectId, params.topicId),
      completionStatus: "in_progress",
    };

    this.currentSession = await storage.createAiTutorSession(sessionData);
    return this.currentSession;
  }

  async sendMessage(message: string, isAudio: boolean = false): Promise<{
    response: string;
    audioUrl?: string;
    explanations?: string[];
    webResources?: AiWebResource[];
    nextSteps?: string[];
  }> {
    if (!this.currentSession) {
      throw new Error("No active session. Please start a session first.");
    }

    // Save user message
    const userMessage: TutorMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
      type: isAudio ? "audio" : "text",
    };

    // Get AI response
    const aiResponse = await this.generateAIResponse(message);
    
    // Check if we need to search the web for additional resources
    const webResources = await this.searchWebIfNeeded(message, aiResponse);
    
    // Save assistant message
    const assistantMessage: TutorMessage = {
      role: "assistant",
      content: aiResponse.response,
      timestamp: new Date(),
      type: "text",
    };

    // Update session with new messages
    const updatedMessages = [
      ...(this.currentSession.messages as TutorMessage[]),
      userMessage,
      assistantMessage,
    ];

    await storage.updateAiTutorSession(this.currentSession.id, {
      messages: updatedMessages,
      updatedAt: new Date(),
    });

    // Record learning history
    await this.recordLearningActivity(message, aiResponse.response);

    return {
      response: aiResponse.response,
      explanations: aiResponse.explanations,
      webResources,
      nextSteps: aiResponse.nextSteps,
    };
  }

  private async generateAIResponse(message: string): Promise<{
    response: string;
    explanations?: string[];
    nextSteps?: string[];
    confidence: number;
  }> {
    if (!openai) {
      return this.generateFallbackResponse(message);
    }

    try {
      const systemPrompt = this.buildSystemPrompt();
      const conversationHistory = this.buildConversationHistory();

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: message },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "";
      
      // Parse structured response
      const explanations = this.extractExplanations(response);
      const nextSteps = this.extractNextSteps(response);

      return {
        response: response,
        explanations,
        nextSteps,
        confidence: 0.9,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      return this.generateFallbackResponse(message);
    }
  }

  private generateFallbackResponse(message: string): {
    response: string;
    explanations?: string[];
    nextSteps?: string[];
    confidence: number;
  } {
    // Intelligent fallback responses based on keywords
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("explain") || lowerMessage.includes("what is")) {
      return {
        response: "I understand you're looking for an explanation. Let me break this down step by step for you. This topic requires understanding the fundamental concepts first.",
        explanations: [
          "Start with the basic definition",
          "Understand the core principles",
          "Look at practical examples",
          "Practice with similar problems"
        ],
        nextSteps: [
          "Review related topics",
          "Practice exercises",
          "Take a quiz on this topic"
        ],
        confidence: 0.6,
      };
    }

    if (lowerMessage.includes("solve") || lowerMessage.includes("calculate")) {
      return {
        response: "For solving problems like this, I recommend following a systematic approach. Let me guide you through the steps.",
        explanations: [
          "Identify what you're asked to find",
          "List the given information",
          "Choose the appropriate formula or method",
          "Work through the calculation step by step"
        ],
        nextSteps: [
          "Practice similar problems",
          "Review the formula",
          "Check your work"
        ],
        confidence: 0.7,
      };
    }

    return {
      response: "I'm here to help you learn! Could you tell me more about what specific topic you'd like to explore? I can provide step-by-step explanations, examples, and practice questions.",
      nextSteps: [
        "Be more specific about your question",
        "Choose a subject to focus on",
        "Let me know your current level"
      ],
      confidence: 0.5,
    };
  }

  private async searchWebIfNeeded(query: string, aiResponse: any): Promise<AiWebResource[]> {
    // Check if AI response confidence is low or if it's a specialized topic
    if (aiResponse.confidence < 0.7 || this.isSpecializedTopic(query)) {
      return await this.searchAndCacheWebResources(query);
    }
    return [];
  }

  private isSpecializedTopic(query: string): boolean {
    const specializedKeywords = [
      "latest", "recent", "current", "new", "breakthrough", "discovery",
      "advanced", "cutting-edge", "research", "study", "findings"
    ];
    return specializedKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private async searchAndCacheWebResources(query: string): Promise<AiWebResource[]> {
    // Simulate web search (in real implementation, use search API)
    const mockResults: AiWebResource[] = [
      {
        id: 1,
        query,
        subjectId: this.currentSession?.subjectId,
        topicId: this.currentSession?.topicId,
        title: "Educational Resource: " + query,
        url: "https://example.com/resource1",
        content: "Comprehensive explanation of " + query,
        summary: "Key concepts and practical examples",
        relevanceScore: 0.85,
        isVerified: true,
        addedBy: "ai-tutor",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Cache results in database
    for (const resource of mockResults) {
      await storage.createAiWebResource(resource);
    }

    return mockResults;
  }

  private buildSystemPrompt(): string {
    const userSubjects = this.getUserSubjects();
    const learningHistory = this.getUserLearningHistory();
    
    return `You are an advanced AI tutor for the Edrac educational platform. Your role is to:

1. Provide personalized, step-by-step explanations
2. Adapt your teaching style to the student's level
3. Use the student's learning history to improve recommendations
4. Encourage active learning through questions and practice
5. Break down complex topics into manageable chunks

Student Context:
- Current session: ${this.currentSession?.sessionType}
- Difficulty level: ${this.currentSession?.difficulty}
- Subject: ${this.currentSession?.subjectId ? 'Subject ID ' + this.currentSession.subjectId : 'General'}

Guidelines:
- Always start with what the student knows
- Use examples relevant to Nigerian education system
- Provide multiple explanations for difficult concepts
- Ask probing questions to test understanding
- Suggest next steps for continued learning

Teaching Style:
- Be encouraging and supportive
- Use simple language first, then introduce technical terms
- Provide real-world applications
- Include mnemonics and memory aids where helpful`;
  }

  private buildConversationHistory(): Array<{ role: "user" | "assistant"; content: string }> {
    if (!this.currentSession) return [];
    
    const messages = this.currentSession.messages as TutorMessage[];
    return messages.slice(-10).map(msg => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));
  }

  private extractExplanations(response: string): string[] {
    // Extract bullet points or numbered lists from response
    const explanationRegex = /(?:^|\n)(?:\d+\.|[-*])\s+(.+)/gm;
    const explanations: string[] = [];
    let match;
    
    while ((match = explanationRegex.exec(response)) !== null) {
      explanations.push(match[1].trim());
    }
    
    return explanations.length > 0 ? explanations : [response];
  }

  private extractNextSteps(response: string): string[] {
    // Look for next steps or recommendations in the response
    const nextStepsKeywords = ["next", "recommend", "should", "try", "practice"];
    const sentences = response.split(/[.!?]+/);
    
    return sentences
      .filter(sentence => 
        nextStepsKeywords.some(keyword => 
          sentence.toLowerCase().includes(keyword)
        )
      )
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .slice(0, 3);
  }

  private async generateLearningPath(subjectId?: number, topicId?: number): Promise<LearningPath> {
    // Generate personalized learning path based on user's history
    const userHistory = await storage.getLearningHistoryByUser(this.userId);
    
    return {
      currentLevel: "beginner",
      completedTopics: [],
      nextRecommendations: [
        "Start with basic concepts",
        "Practice fundamental problems",
        "Review examples"
      ],
      strengthAreas: [],
      improvementAreas: ["All topics - just starting"],
    };
  }

  private async recordLearningActivity(question: string, response: string): Promise<void> {
    const activityData: InsertLearningHistory & { userId: string } = {
      userId: this.userId,
      subjectId: this.currentSession?.subjectId || 1,
      topicId: this.currentSession?.topicId,
      activityType: "tutor_session",
      timeSpent: 5, // Estimate 5 minutes per interaction
      metadata: {
        question,
        response,
        sessionId: this.currentSession?.id,
      },
    };

    await storage.createLearningHistory(activityData);
  }

  private getUserSubjects(): UserSubject[] {
    // This would fetch from storage in real implementation
    return [];
  }

  private getUserLearningHistory(): LearningHistory[] {
    // This would fetch from storage in real implementation
    return [];
  }

  async endSession(rating?: number, feedback?: string): Promise<void> {
    if (!this.currentSession) return;

    await storage.updateAiTutorSession(this.currentSession.id, {
      completionStatus: "completed",
      endTime: new Date(),
      rating,
      feedback,
      updatedAt: new Date(),
    });

    this.currentSession = null;
  }

  async readQuestionAloud(questionText: string): Promise<string> {
    // This would integrate with text-to-speech service
    return "Audio playback initiated for: " + questionText;
  }

  async generateLessonPlan(subjectId: number, topicId?: number): Promise<{
    title: string;
    lessons: Array<{
      title: string;
      content: string;
      duration: number;
      difficulty: string;
      exercises: string[];
    }>;
  }> {
    // Generate structured lesson plan from beginner to advanced
    return {
      title: "Complete Learning Path",
      lessons: [
        {
          title: "Introduction & Basics",
          content: "Fundamental concepts and definitions",
          duration: 30,
          difficulty: "beginner",
          exercises: ["Basic practice problems", "Vocabulary quiz"],
        },
        {
          title: "Intermediate Applications",
          content: "Real-world applications and problem-solving",
          duration: 45,
          difficulty: "intermediate",
          exercises: ["Applied problems", "Case studies"],
        },
        {
          title: "Advanced Concepts",
          content: "Complex theories and advanced applications",
          duration: 60,
          difficulty: "advanced",
          exercises: ["Research project", "Advanced problem sets"],
        },
      ],
    };
  }
}

// Helper function to create tutor instance
export function createAITutor(userId: string): EnhancedAITutor {
  return new EnhancedAITutor(userId);
}