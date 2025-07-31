import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { users, questions, topics, subjects, exams, examSessions } from "@shared/schema";
import { eq, and, desc, sql, count, avg, sum, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

// Custom middleware for session-based auth
const requireAuth = (req: any, res: any, next: any) => {
  // Check session-based auth first
  if (req.session && req.session.user) {
    req.user = { claims: { sub: req.session.user.id } };
    return next();
  }
  
  // Fall back to OAuth auth if available
  if (req.user && req.user.claims) {
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
};

import { setupGoogleAuth } from "./googleAuth";
import { 
  insertQuestionSchema, 
  insertExamSchema, 
  insertExamSessionSchema,
  insertAiInteractionSchema,
  insertPaymentSchema,
  insertUserSchema,
  insertInstitutionSchema,
  institutions
} from "@shared/schema";
import { explainQuestion, provideTutoring } from "./services/enhanced-openai";
import { paystackService } from "./services/paystack";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const multerStorage = multer.memoryStorage();
  const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Auth middleware
  await setupAuth(app);
  await setupGoogleAuth(app);

  // Demo login endpoint for testing
  app.post('/api/auth/demo-login', async (req: any, res) => {
    try {
      const { email } = req.body;
      
      // Find user by email
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (!user || user.length === 0) {
        return res.status(400).json({ message: "Demo account not found" });
      }
      
      // Create session
      req.session.user = {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role
      };
      
      res.json({ message: "Login successful", user: user[0] });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Demo logout endpoint
  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check session-based auth first
      if (req.session && req.session.user) {
        const user = await storage.getUser(req.session.user.id);
        return res.json(user);
      }
      
      // Fall back to OAuth auth if available
      if (req.user && req.user.claims) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }
      
      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Traditional login endpoint
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          message: "Email and password are required" 
        });
      }
      
      // Demo accounts for testing
      const userAccounts = [
        { 
          id: "demo-student-123",
          email: "student@edrac.com", 
          password: "password123", 
          role: "student",
          name: "Demo Student",
          username: "student123",
          avatar: null,
          plan: "free",
          isActive: true
        },
        { 
          id: "demo-jane-456",
          email: "jane.student@edrac.com", 
          password: "password123", 
          role: "student",
          name: "Jane Doe",
          username: "jane_doe",
          avatar: null,
          plan: "basic",
          isActive: true
        },
        { 
          id: "demo-institution-123",
          email: "institution@edrac.com", 
          password: "password123", 
          role: "institution",
          name: "Demo Institution",
          username: "institution1",
          avatar: null,
          plan: "premium",
          isActive: true
        },
        { 
          id: "demo-admin-123",
          email: "admin@edrac.com", 
          password: "password123", 
          role: "admin",
          name: "System Administrator",
          username: "admin",
          avatar: null,
          plan: "admin",
          isActive: true
        }
      ];
      
      const userAccount = userAccounts.find(acc => acc.email === email && acc.password === password);
      
      if (!userAccount) {
        return res.status(401).json({ 
          message: "Invalid credentials" 
        });
      }
      
      // Find user by email in database
      let user;
      try {
        const allUsers = await db.select().from(users).where(eq(users.email, userAccount.email));
        user = allUsers[0];
        
        if (!user) {
          return res.status(401).json({ message: "User not found in database" });
        }
      } catch (error) {
        console.error('Error finding user:', error);
        return res.status(500).json({ message: "Database error" });
      }
      
      // Create session
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan
      };
      
      res.json({ 
        success: true, 
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          subscriptionPlan: user.subscriptionPlan
        }
      });
      
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Subjects endpoint
  app.get('/api/subjects', async (req: any, res) => {
    try {
      const allSubjects = await db.select().from(subjects).orderBy(subjects.name);
      res.json(allSubjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Topics endpoint
  app.get('/api/topics', async (req: any, res) => {
    try {
      const { subjectId } = req.query;
      
      let query = db.select().from(topics);
      
      if (subjectId) {
        query = query.where(eq(topics.subjectId, parseInt(subjectId as string)));
      }
      
      const allTopics = await query.orderBy(topics.name);
      res.json(allTopics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Questions endpoint - students can only view questions, not create/edit/delete
  app.get('/api/questions', async (req: any, res) => {
    try {
      const user = req.session?.user;
      const { subjectId, topicId, difficulty, limit = 50 } = req.query;
      
      let query = db
        .select({
          id: questions.id,
          text: questions.text,
          options: questions.options,
          correctAnswer: questions.correctAnswer,
          explanation: questions.explanation,
          difficulty: questions.difficulty,
          subjectId: questions.subjectId,
          topicId: questions.topicId,
          examType: questions.examType,
          points: questions.points
        })
        .from(questions);
      
      const conditions = [];
      
      if (subjectId) {
        conditions.push(eq(questions.subjectId, parseInt(subjectId as string)));
      }
      
      if (topicId) {
        conditions.push(eq(questions.topicId, parseInt(topicId as string)));
      }
      
      if (difficulty) {
        conditions.push(eq(questions.difficulty, difficulty as string));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query
        .orderBy(questions.id)
        .limit(parseInt(limit as string));
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Exams endpoint - students can only view exams created by admin/institutions
  app.get('/api/exams', async (req: any, res) => {
    try {
      const user = req.session?.user;
      
      // Students can only view public exams created by admin/institutions
      if (user?.role === 'student') {
        const allExams = await db.select().from(exams)
          .where(and(
            eq(exams.isPublic, true),
            eq(exams.isActive, true)
          ))
          .orderBy(desc(exams.createdAt));
        res.json(allExams);
      } else {
        // Admin/institutions can see all their exams
        const allExams = await db.select().from(exams).orderBy(desc(exams.createdAt));
        res.json(allExams);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  // Specific exam endpoint
  app.get('/api/exams/:examId', async (req: any, res) => {
    try {
      const { examId } = req.params;
      const exam = await db.select().from(exams).where(eq(exams.id, examId)).limit(1);
      
      if (!exam || exam.length === 0) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      res.json(exam[0]);
    } catch (error) {
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Failed to fetch exam" });
    }
  });

  // Exam questions endpoint
  app.get('/api/exams/:examId/questions', async (req: any, res) => {
    try {
      const { examId } = req.params;
      
      // Get exam details first
      const exam = await db.select().from(exams).where(eq(exams.id, examId)).limit(1);
      
      if (!exam || exam.length === 0) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      const examData = exam[0];
      
      // Get questions based on exam subjects
      const examQuestions = await storage.getRandomQuestions({
        subjectIds: examData.subjects,
        difficulty: examData.difficulty === 'mixed' ? undefined : examData.difficulty,
        examType: examData.examCategory,
        limit: examData.totalQuestions
      });
      
      res.json(examQuestions);
    } catch (error) {
      console.error("Error fetching exam questions:", error);
      res.status(500).json({ message: "Failed to fetch exam questions" });
    }
  });

  // Start exam session
  app.post('/api/exams/:examId/start', requireAuth, async (req: any, res) => {
    try {
      const { examId } = req.params;
      const userId = req.session?.user?.id || req.user?.claims?.sub;
      
      const exam = await db.select().from(exams).where(eq(exams.id, examId)).limit(1);
      
      if (!exam || exam.length === 0) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      const examData = exam[0];
      const sessionId = randomUUID();
      
      // Create exam session
      const session = await storage.createExamSession({

        examId,
        userId,
        startTime: new Date(),
        timeRemaining: examData.duration * 60, // Convert minutes to seconds
        answers: {},
        isCompleted: false
      });
      
      res.json({
        sessionId: session.id,
        timeRemaining: session.timeRemaining,
        examDuration: examData.duration
      });
    } catch (error) {
      console.error("Error starting exam session:", error);
      res.status(500).json({ message: "Failed to start exam session" });
    }
  });

  // Submit exam session
  app.post('/api/exam-sessions/:sessionId/submit', requireAuth, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { answers, timeSpent } = req.body;
      const userId = req.session?.user?.id || req.user?.claims?.sub;
      
      // Get session
      const session = await storage.getExamSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Exam session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to exam session" });
      }
      
      // Get exam questions for scoring
      const examQuestions = await storage.getRandomQuestions({
        subjectIds: [], // Will be filtered by exam
        limit: 100 // Get all questions for this exam
      });
      
      // Calculate score
      let correctAnswers = 0;
      const totalQuestions = Object.keys(answers).length;
      
      for (const [questionId, answer] of Object.entries(answers)) {
        const question = examQuestions.find(q => q.id.toString() === questionId);
        if (question && question.correctAnswer === answer) {
          correctAnswers++;
        }
      }
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      // Update session
      await storage.updateExamSession(sessionId, {
        answers: answers as Record<string, string>,
        score,
        timeSpent,
        isCompleted: true,
        completedAt: new Date()
      });
      
      res.json({
        score: correctAnswers,
        totalQuestions,
        percentage: score,
        timeSpent,
        passed: score >= 50 // Assuming 50% is passing
      });
    } catch (error) {
      console.error("Error submitting exam session:", error);
      res.status(500).json({ message: "Failed to submit exam session" });
    }
  });

  // AI explanation endpoint with intelligent fallbacks
  app.post('/api/ai/explain-question', requireAuth, async (req: any, res) => {
    try {
      const { questionText, correctAnswer, studentAnswer } = req.body;
      
      if (!questionText || !correctAnswer) {
        return res.status(400).json({ message: "Question text and correct answer are required" });
      }
      
      const explanation = await explainQuestion(questionText, correctAnswer, studentAnswer);
      res.json(explanation);
    } catch (error) {
      console.error("Error explaining question:", error);
      
      // Smart fallback explanation based on question content
      const lowerText = (questionText || '').toLowerCase();
      let fallbackExplanation = {
        explanation: `The correct answer is: ${correctAnswer}. `,
        examples: ["Review the question carefully", "Consider all given information"],
        relatedTopics: ["Study materials", "Practice questions"],
        confidence: 0.7
      };

      if (lowerText.includes('calculate') || lowerText.includes('solve') || lowerText.includes('math')) {
        fallbackExplanation.explanation += "This is a mathematical problem. Break it down step by step and apply the appropriate formulas.";
        fallbackExplanation.examples = ["Identify the given values", "Choose the correct formula", "Substitute and calculate", "Check your answer"];
        fallbackExplanation.relatedTopics = ["Mathematical formulas", "Problem-solving steps", "Calculation methods"];
      } else if (lowerText.includes('comprehension') || lowerText.includes('passage') || lowerText.includes('meaning')) {
        fallbackExplanation.explanation += "This is a comprehension question. Read the passage carefully and look for key information.";
        fallbackExplanation.examples = ["Read the passage twice", "Look for keywords", "Eliminate wrong options", "Choose the best answer"];
        fallbackExplanation.relatedTopics = ["Reading comprehension", "Text analysis", "Context clues"];
      } else if (lowerText.includes('experiment') || lowerText.includes('theory') || lowerText.includes('science')) {
        fallbackExplanation.explanation += "This is a science question. Consider the scientific principles and concepts involved.";
        fallbackExplanation.examples = ["Recall scientific facts", "Apply theoretical knowledge", "Consider cause and effect", "Use logical reasoning"];
        fallbackExplanation.relatedTopics = ["Scientific principles", "Laboratory procedures", "Theory application"];
      }

      if (studentAnswer && studentAnswer !== correctAnswer) {
        fallbackExplanation.explanation += ` You selected ${studentAnswer}, but the correct answer is ${correctAnswer}. Review the concept and understand why this option is correct.`;
      }

      res.json(fallbackExplanation);
    }
  });

  // AI tutoring endpoint with enhanced fallback patterns
  app.post('/api/ai/tutor', requireAuth, async (req: any, res) => {
    try {
      const { query, context, question } = req.body;
      const userQuestion = query || question;
      
      if (!userQuestion) {
        return res.status(400).json({ message: "Question is required" });
      }
      
      const response = await provideTutoring(userQuestion, context);
      res.json(response);
    } catch (error) {
      console.error("Error providing tutoring:", error);
      
      // Enhanced intelligent fallback when OpenAI fails
      const lowerQuery = (req.body.query || req.body.question || '').toLowerCase();
      let fallbackResponse = {
        explanation: "I'm here to help with your studies! While my advanced AI is temporarily unavailable, I can still provide guidance.",
        examples: ["Break down complex problems into smaller steps", "Review your study materials", "Practice with similar questions"],
        relatedTopics: ["Study techniques", "Exam preparation"],
        confidence: 0.7
      };

      // Smart pattern matching for fallback responses
      if (lowerQuery.includes('math') || lowerQuery.includes('calculate') || lowerQuery.includes('solve')) {
        fallbackResponse = {
          explanation: "For mathematics problems, focus on understanding the fundamental concepts. Break down complex problems step by step and practice regularly.",
          examples: ["Identify what the problem is asking", "List the given information", "Choose the right formula", "Show your work clearly"],
          relatedTopics: ["Mathematical formulas", "Problem-solving strategies", "Step-by-step methods"],
          confidence: 0.8
        };
      } else if (lowerQuery.includes('english') || lowerQuery.includes('grammar') || lowerQuery.includes('essay')) {
        fallbackResponse = {
          explanation: "For English language skills, focus on reading comprehension, grammar rules, and vocabulary building. Practice writing regularly.",
          examples: ["Read diverse materials daily", "Practice grammar exercises", "Write short essays", "Learn new vocabulary"],
          relatedTopics: ["Grammar fundamentals", "Reading comprehension", "Essay writing", "Vocabulary building"],
          confidence: 0.8
        };
      } else if (lowerQuery.includes('jamb') || lowerQuery.includes('waec') || lowerQuery.includes('exam')) {
        fallbackResponse = {
          explanation: "For exam preparation, create a study schedule, practice with past questions, and focus on understanding concepts rather than memorization.",
          examples: ["Practice past questions daily", "Time yourself during practice", "Focus on weak subjects", "Review regularly"],
          relatedTopics: ["Exam strategies", "Time management", "Past questions", "Study planning"],
          confidence: 0.8
        };
      }
      
      res.json(fallbackResponse);
    }
  });

  // Users endpoint (admin only)
  app.get('/api/users', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.claims?.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/system', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.claims?.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Get system-wide analytics
      const totalUsers = await db.select({ count: count() }).from(users);
      const totalExams = await db.select({ count: count() }).from(exams);
      const totalQuestions = await db.select({ count: count() }).from(questions);
      const totalSessions = await db.select({ count: count() }).from(examSessions);
      
      res.json({
        totalUsers: totalUsers[0]?.count || 0,
        totalExams: totalExams[0]?.count || 0,
        totalQuestions: totalQuestions[0]?.count || 0,
        totalSessions: totalSessions[0]?.count || 0,
        activeUsers: 0, // Placeholder
        avgScore: 75, // Placeholder
      });
    } catch (error) {
      console.error("Error fetching system analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Institution endpoints
  app.get('/api/institutions', requireAuth, async (req: any, res) => {
    try {
      const allInstitutions = await storage.getAllInstitutions();
      res.json(allInstitutions);
    } catch (error) {
      console.error("Error fetching institutions:", error);
      res.status(500).json({ message: "Failed to fetch institutions" });
    }
  });

  app.get('/api/institutions/students', requireAuth, async (req: any, res) => {
    try {
      // Return empty array for now - institutions can be enhanced later
      res.json([]);
    } catch (error) {
      console.error("Error fetching institution students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get('/api/institutions/exams', requireAuth, async (req: any, res) => {
    try {
      // Return empty array for now - institutions can be enhanced later
      res.json([]);
    } catch (error) {
      console.error("Error fetching institution exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.get('/api/institutions/performance', requireAuth, async (req: any, res) => {
    try {
      // Return empty array for now
      res.json([]);
    } catch (error) {
      console.error("Error fetching institution performance:", error);
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });

  app.get('/api/institutions/packages', requireAuth, async (req: any, res) => {
    try {
      // Return empty array for now
      res.json([]);
    } catch (error) {
      console.error("Error fetching institution packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.get('/api/institutions/groups', requireAuth, async (req: any, res) => {
    try {
      // Return empty array for now
      res.json([]);
    } catch (error) {
      console.error("Error fetching institution groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get('/api/institutions/settings', requireAuth, async (req: any, res) => {
    try {
      // Return default settings
      res.json({
        id: 1,
        institutionId: "demo-institution-123",
        allowStudentRegistration: true,
        requireEmailVerification: false,
        defaultExamDuration: 60,
        passingScore: 50,
        showScoreImmediately: true,
        allowRetakes: true,
        maxRetakes: 3,
        notificationSettings: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true
        }
      });
    } catch (error) {
      console.error("Error fetching institution settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get('/api/analytics/institution', requireAuth, async (req: any, res) => {
    try {
      // Return placeholder analytics for institutions
      res.json({
        totalStudents: 0,
        totalExams: 0,
        avgScore: 0,
        completionRate: 0
      });
    } catch (error) {
      console.error("Error fetching institution analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}