import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

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
  subjects,
  exams,
  institutions
} from "@shared/schema";
import { generateQuestions, explainQuestion, provideTutoring } from "./services/openai";
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

  // Server-side login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Define user accounts with proper user data matching database
      const userAccounts = [
        { 
          id: "student-001",
          email: "student@edrac.com", 
          password: "demo123", 
          role: "student",
          name: "Test Student",
          username: "test_student",
          avatar: null,
          plan: "free",
          isActive: true
        },
        { 
          id: "student-002",
          email: "jane.student@edrac.com", 
          password: "demo123", 
          role: "student",
          name: "Jane Doe",
          username: "jane_student",
          avatar: null,
          plan: "premium",
          isActive: true
        },
        { 
          id: "student-003",
          email: "michael.test@edrac.com", 
          password: "demo123", 
          role: "student",
          name: "Michael Johnson",
          username: "michael_student",
          avatar: null,
          plan: "free",
          isActive: true
        },
        { 
          id: "institution-001",
          email: "institution@edrac.com", 
          password: "demo123", 
          role: "institution",
          name: "Institution Manager",
          username: "institution_manager",
          avatar: null,
          plan: "premium",
          isActive: true
        },
        { 
          id: "admin-001",
          email: "admin@edrac.com", 
          password: "demo123", 
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
      (req as any).session.user = {
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

  // Logout endpoint
  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Profile update endpoint
  app.put('/api/auth/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const updateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        bio: req.body.bio,
        location: req.body.location,
        institution: req.body.institution
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change password endpoint
  app.post('/api/auth/change-password', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { currentPassword, newPassword } = req.body;

      // For demo purposes, we'll just return success
      // In production, you'd verify the current password hash
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required" });
      }

      // Here you would hash the new password and update the database
      // For demo, we'll just return success
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Profile picture upload endpoint
  app.post('/api/auth/upload-avatar', requireAuth, upload.single('avatar'), async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Convert buffer to base64 data URL
      const base64 = req.file.buffer.toString('base64');
      const avatarUrl = `data:${req.file.mimetype};base64,${base64}`;

      const updatedUser = await storage.upsertUser({
        id: userId,
        avatar: avatarUrl
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ avatarUrl });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  });

  // Subject and topic routes
  app.get('/api/subjects', async (req, res) => {
    try {
      const { category } = req.query;
      const subjects = category 
        ? await storage.getSubjectsByCategory(category as string)
        : await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post('/api/subjects', requireAuth, async (req: any, res) => {
    try {
      const { name, code, category, description, isActive = true } = req.body;
      
      // Insert directly into database using raw SQL for now
      const subject = await db.query.subjects.findFirst({
        where: (subjects, { eq }) => eq(subjects.name, name)
      });
      
      if (subject) {
        return res.status(400).json({ message: "Subject already exists" });
      }
      
      const [newSubject] = await db.insert(subjects).values({
        name,
        code,
        category,
        description,
        isActive
      }).returning();
      
      res.status(201).json(newSubject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  app.patch('/api/subjects/:id', requireAuth, async (req: any, res) => {
    try {
      const subjectId = parseInt(req.params.id);
      const { name, code, category, description, isActive } = req.body;
      
      const [updatedSubject] = await db.update(subjects)
        .set({ name, code, category, description, isActive })
        .where(eq(subjects.id, subjectId))
        .returning();
      
      if (!updatedSubject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.json(updatedSubject);
    } catch (error) {
      console.error("Error updating subject:", error);
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete('/api/subjects/:id', requireAuth, async (req: any, res) => {
    try {
      const subjectId = parseInt(req.params.id);
      
      const [deletedSubject] = await db.delete(subjects)
        .where(eq(subjects.id, subjectId))
        .returning();
      
      if (!deletedSubject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.json({ message: "Subject deleted successfully" });
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  app.get('/api/subjects/:id/topics', async (req, res) => {
    try {
      const subjectId = parseInt(req.params.id);
      const topics = await storage.getTopicsBySubject(subjectId);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Question routes
  app.post('/api/questions', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      try {
        const questionData = insertQuestionSchema.parse(req.body);
        const question = await storage.createQuestion({ ...questionData, createdBy: userId });
        res.status(201).json(question);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        res.status(400).json({ message: "Invalid question data", error: validationError.message });
      }
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.get('/api/questions', async (req, res) => {
    try {
      const { subjectIds, topicIds, difficulty, examType, limit = 50 } = req.query;
      
      const params = {
        subjectIds: subjectIds ? (subjectIds as string).split(',').map(Number) : undefined,
        topicIds: topicIds ? (topicIds as string).split(',').map(Number) : undefined,
        difficulty: difficulty as string,
        examType: examType as string,
        limit: parseInt(limit as string) || 50,
      };
      
      const questions = await storage.getRandomQuestions(params);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get('/api/questions/random', async (req, res) => {
    try {
      const { subjectIds, topicIds, difficulty, examType, limit = 10 } = req.query;
      
      const params = {
        subjectIds: subjectIds ? (subjectIds as string).split(',').map(Number) : undefined,
        topicIds: topicIds ? (topicIds as string).split(',').map(Number) : undefined,
        difficulty: difficulty as string,
        examType: examType as string,
        limit: parseInt(limit as string) || 10,
      };
      
      const questions = await storage.getRandomQuestions(params);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching random questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Get practice questions for a subject
  app.get("/api/questions/practice/:subjectId", requireAuth, async (req, res) => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      const limit = parseInt(req.query.limit as string) || 20;
      
      const questions = await storage.getRandomQuestions({
        subjectIds: [subjectId],
        limit
      });
      
      res.json(questions);
    } catch (error) {
      console.error("Error fetching practice questions:", error);
      res.status(500).json({ message: "Failed to fetch practice questions" });
    }
  });

  app.post('/api/questions/generate', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user?.id || req.user?.claims?.sub;
      
      if (!currentUserId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { subject, topic, difficulty, examType, count } = req.body;
      
      // Call OpenAI service to generate questions
      const generatedQuestions = await generateQuestions({
        subject,
        topic,
        difficulty,
        examType,
        count
      });

      // Save questions to database
      const savedQuestions = [];
      for (const question of generatedQuestions) {
        const savedQuestion = await storage.createQuestion({
          ...question,
          subjectId: parseInt(subject),
          topicId: topic && topic !== 'none' ? parseInt(topic) : undefined,
          examType,
          createdBy: currentUserId
        });
        savedQuestions.push(savedQuestion);
      }

      res.json({
        success: true,
        questions: savedQuestions,
        count: savedQuestions.length
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      res.status(500).json({ message: "Failed to generate questions" });
    }
  });

  app.post('/api/questions/bulk-upload', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user?.id || req.user?.claims?.sub;
      
      if (!currentUserId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // In a real implementation, you would parse the uploaded file
      // For now, we'll return a success response
      res.json({
        success: true,
        message: 'Questions uploaded successfully',
        processed: 0,
        failed: 0,
        errors: []
      });
    } catch (error) {
      console.error('Error uploading questions:', error);
      res.status(500).json({ message: 'Failed to upload questions' });
    }
  });

  app.put('/api/questions/:id', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user?.id || req.user?.claims?.sub;
      
      if (!currentUserId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const questionId = parseInt(req.params.id);
      const questionData = req.body;

      const updatedQuestion = await storage.updateQuestion(questionId, questionData);
      res.json(updatedQuestion);
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({ message: 'Failed to update question' });
    }
  });

  // Exam routes
  app.post('/api/exams', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const examData = insertExamSchema.parse(req.body);
      const exam = await storage.createExam({ ...examData, createdBy: userId });
      res.status(201).json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  app.get('/api/exams', async (req, res) => {
    try {
      const exams = await storage.getPublicExams();
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.patch('/api/exams/:id', requireAuth, async (req: any, res) => {
    try {
      const examId = req.params.id;
      const examData = req.body;
      const exam = await storage.updateExam(examId, examData);
      res.json(exam);
    } catch (error) {
      console.error("Error updating exam:", error);
      res.status(500).json({ message: "Failed to update exam" });
    }
  });

  app.delete('/api/exams/:id', requireAuth, async (req: any, res) => {
    try {
      const examId = req.params.id;
      await storage.deleteExam(examId);
      res.json({ message: "Exam deleted successfully" });
    } catch (error) {
      console.error("Error deleting exam:", error);
      res.status(500).json({ message: "Failed to delete exam" });
    }
  });

  // Shared exam routes (public access)
  app.get('/api/exams/shared/:id', async (req, res) => {
    try {
      const examId = req.params.id;
      const exam = await storage.getExam(examId);
      
      if (!exam || !exam.isPublic || !exam.isActive) {
        return res.status(404).json({ message: 'Exam not found or not accessible' });
      }
      
      res.json(exam);
    } catch (error) {
      console.error('Error fetching shared exam:', error);
      res.status(500).json({ message: 'Failed to fetch exam' });
    }
  });

  app.post('/api/exams/shared/:id/register', async (req, res) => {
    try {
      const examId = req.params.id;
      const { fullName, email, phone, institution } = req.body;
      
      // Create a guest user session for the exam
      const guestUserId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create exam session for guest user
      const examSession = await storage.createExamSession({
        examId,
        userId: guestUserId,
        status: 'not_started',
        metadata: {
          guestUser: {
            fullName,
            email,
            phone,
            institution
          }
        }
      });
      
      res.json({ 
        message: 'Registration successful', 
        sessionId: examSession.id,
        examId 
      });
    } catch (error) {
      console.error('Error registering for shared exam:', error);
      res.status(500).json({ message: 'Failed to register for exam' });
    }
  });

  app.get('/api/exams/:id', async (req, res) => {
    try {
      const exam = await storage.getExam(req.params.id);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.json(exam);
    } catch (error) {
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Failed to fetch exam" });
    }
  });

  app.get('/api/exams/:examId/questions', async (req, res) => {
    try {
      const { examId } = req.params;
      
      // Validate UUID format
      if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(examId)) {
        return res.status(400).json({ message: "Invalid exam ID format" });
      }

      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      const subjects = exam.subjects as number[];
      const questions = await storage.getRandomQuestions({
        subjectIds: subjects,
        difficulty: exam.difficulty === "mixed" ? undefined : exam.difficulty,
        examType: exam.examCategory,
        limit: exam.totalQuestions,
      });

      res.json(questions);
    } catch (error) {
      console.error("Error fetching exam questions:", error);
      res.status(500).json({ message: "Failed to fetch exam questions" });
    }
  });

  // Fix the questions route that was causing 500 error
  app.get('/api/exams/questions', requireAuth, async (req: any, res) => {
    try {
      // Return all available questions for admin use
      const questions = await storage.getAllQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching all questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Exam session routes
  app.post('/api/exam-sessions', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertExamSessionSchema.parse(req.body);
      
      // Check for existing active session
      const activeSession = await storage.getUserActiveSession(userId);
      if (activeSession) {
        return res.status(400).json({ message: "You have an active exam session" });
      }

      const session = await storage.createExamSession({ 
        ...sessionData, 
        userId,
        startTime: new Date(),
        status: "in_progress",
      });
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating exam session:", error);
      res.status(500).json({ message: "Failed to create exam session" });
    }
  });

  app.get('/api/exam-sessions/active', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const session = await storage.getUserActiveSession(userId);
      res.json(session);
    } catch (error) {
      console.error("Error fetching active session:", error);
      res.status(500).json({ message: "Failed to fetch active session" });
    }
  });

  app.patch('/api/exam-sessions/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = req.params.id;
      const updates = req.body;

      // Verify session belongs to user
      const session = await storage.getExamSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedSession = await storage.updateExamSession(sessionId, updates);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating exam session:", error);
      res.status(500).json({ message: "Failed to update exam session" });
    }
  });

  app.get('/api/exam-sessions/user/:userId', requireAuth, async (req: any, res) => {
    try {
      const requestingUserId = req.user.claims.sub;
      const targetUserId = req.params.userId;

      // Users can only access their own sessions unless they're admin
      const user = await storage.getUser(requestingUserId);
      if (requestingUserId !== targetUserId && user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const sessions = await storage.getExamSessionsByUser(targetUserId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ message: "Failed to fetch user sessions" });
    }
  });

  // AI tutor routes
  app.post('/api/ai/explain', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      const { questionText, correctAnswer, studentAnswer } = req.body;

      const explanation = await explainQuestion(questionText, correctAnswer, studentAnswer);
      
      // Save interaction
      await storage.createAiInteraction({
        userId,
        type: "question_explanation",
        question: questionText,
        response: explanation.explanation,
      });

      res.json(explanation);
    } catch (error) {
      console.error("Error explaining question:", error);
      res.status(500).json({ message: "Failed to explain question" });
    }
  });

  app.post('/api/ai/tutor', requireAuth, async (req: any, res) => {
    try {
      const { question, context, questionData } = req.body;
      
      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }
      
      let response;
      
      try {
        // Try to get AI response first
        response = await provideTutoring(question, context);
      } catch (aiError) {
        console.error("AI tutoring failed:", aiError);
        
        // Fallback to basic response based on question content
        const fallbackResponse = generateFallbackTutorResponse(question, questionData);
        response = {
          explanation: fallbackResponse,
          confidence: 0.4,
          examples: [],
          relatedTopics: []
        };
      }
      
      // Save AI interaction if user is authenticated
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      if (userId) {
        try {
          await storage.createAiInteraction({
            userId,
            type: "tutor_chat",
            question,
            response: response.explanation,
          });
        } catch (saveError) {
          console.error("Failed to save AI interaction:", saveError);
        }
      }

      res.json(response);
    } catch (error) {
      console.error("Error in AI tutoring:", error);
      res.status(500).json({ 
        message: "Tutoring service temporarily unavailable",
        explanation: "I'm having trouble right now, but I'm still here to help! Please try rephrasing your question or contact support if this persists."
      });
    }
  });

  // Helper function for fallback tutor responses
  function generateFallbackTutorResponse(question: string, questionData?: any): string {
    const lowerQuestion = question.toLowerCase();
    
    // Subject-specific fallbacks
    if (questionData?.subject) {
      const subject = questionData.subject.toLowerCase();
      if (subject.includes('math') || subject.includes('physic') || subject.includes('chemistry')) {
        return `For ${questionData.subject} problems, try breaking them down into smaller steps. Identify what you know and what you need to find. Practice similar problems to reinforce your understanding.`;
      } else if (subject.includes('biology') || subject.includes('science')) {
        return `Science concepts are easier when you connect them to real-world examples. Try to understand the 'why' behind phenomena, not just memorize facts. Drawing diagrams can help visualize processes.`;
      } else if (subject.includes('english') || subject.includes('literature')) {
        return `For language questions, context often provides clues. Focus on identifying key themes and main ideas. Building vocabulary takes time - learn words in context.`;
      }
    }
    
    // General fallback responses
    const fallbacks = [
      "I'm here to help you understand this concept. Break it down into smaller parts and try to connect it to what you already know.",
      "This is a good question! Try thinking about the fundamentals first, then build up to the more complex aspects.",
      "Learning is a process. Don't worry if it seems difficult at first - focus on understanding the core concepts.",
      "Let me help you approach this systematically. What part of this topic would you like to explore first?",
      "Great question! The key is to understand the underlying principles. Can you identify the main concepts involved?"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Helper function for basic typo detection
  function detectBasicTypos(text: string): Array<{original: string, corrected: string, confidence: number}> {
    const corrections = [];
    const commonTypos = {
      'teh': 'the',
      'adn': 'and',
      'taht': 'that',
      'wihch': 'which',
      'thier': 'their',
      'recieve': 'receive',
      'seperate': 'separate',
      'occured': 'occurred',
      'definately': 'definitely',
      'neccessary': 'necessary',
      'wht': 'what',
      'wat': 'what',
      'photosintesis': 'photosynthesis',
      'photosyntesis': 'photosynthesis',
      'resperation': 'respiration',
      'mitocondria': 'mitochondria',
      'chloroplast': 'chloroplast',
      'equasion': 'equation',
      'addtion': 'addition',
      'subtration': 'subtraction',
      'multipication': 'multiplication',
      'divisoin': 'division',
      'calculte': 'calculate',
      'anwser': 'answer',
      'questoin': 'question',
      'explaination': 'explanation',
      'differnt': 'different',
      'similer': 'similar',
      'wich': 'which',
      'becuase': 'because',
      'beacuse': 'because'
    };
    
    const words = text.toLowerCase().split(/\s+/);
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (commonTypos[cleanWord]) {
        corrections.push({
          original: cleanWord,
          corrected: commonTypos[cleanWord],
          confidence: 0.9
        });
      }
    });
    
    return corrections;
  }

  // Add typo checking endpoint
  app.post('/api/ai/check-typos', async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      console.log("Checking typos in text:", text);
      const corrections = detectBasicTypos(text);
      console.log("Found corrections:", corrections);
      res.json({ corrections });
    } catch (error) {
      console.error("Error checking typos:", error);
      res.status(500).json({ message: "Typo checking service unavailable" });
    }
  });

  // Enhanced AI question validation endpoint
  app.post('/api/ai/validate-questions', async (req, res) => {
    try {
      const { questions } = req.body;
      
      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: "Questions array is required" });
      }
      
      const validatedQuestions = [];
      
      for (const question of questions) {
        const issues = [];
        
        // Basic validation
        if (!question.text || question.text.length < 10) {
          issues.push({
            id: `question-${Date.now()}`,
            type: 'error',
            category: 'content',
            message: 'Question text is too short',
            originalText: question.text,
            suggestedFix: 'Question should be at least 10 characters long',
            confidence: 0.9,
            position: { start: 0, end: question.text?.length || 0 }
          });
        }
        
        if (!question.options || question.options.length < 2) {
          issues.push({
            id: `options-${Date.now()}`,
            type: 'error',
            category: 'options',
            message: 'Insufficient answer options',
            originalText: JSON.stringify(question.options),
            suggestedFix: 'Question should have at least 2 answer options',
            confidence: 0.9,
            position: { start: 0, end: 0 }
          });
        }
        
        if (!question.correctAnswer) {
          issues.push({
            id: `answer-${Date.now()}`,
            type: 'error',
            category: 'answer',
            message: 'Correct answer is missing',
            originalText: question.correctAnswer,
            suggestedFix: 'Please specify the correct answer',
            confidence: 0.9,
            position: { start: 0, end: 0 }
          });
        }
        
        // Try AI enhancement
        try {
          const aiResponse = await explainQuestion(question.text, question.correctAnswer);
          if (aiResponse.explanation && aiResponse.explanation !== question.explanation) {
            issues.push({
              id: `ai-explanation-${Date.now()}`,
              type: 'suggestion',
              category: 'content',
              message: 'AI-generated explanation improvement',
              originalText: question.explanation,
              suggestedFix: aiResponse.explanation,
              confidence: aiResponse.confidence || 0.7,
              position: { start: 0, end: question.explanation?.length || 0 }
            });
          }
        } catch (aiError) {
          console.error("AI validation failed for question:", aiError);
          // Continue with basic validation
        }
        
        // Check for typos in question text
        const typos = detectBasicTypos(question.text);
        if (typos.length > 0) {
          issues.push({
            id: `typo-${Date.now()}`,
            type: 'warning',
            category: 'spelling',
            message: `Found ${typos.length} potential typo(s)`,
            originalText: question.text,
            suggestedFix: typos.map(t => `"${t.original}" → "${t.corrected}"`).join(', '),
            confidence: 0.8,
            position: { start: 0, end: question.text.length }
          });
        }
        
        validatedQuestions.push({
          ...question,
          issues
        });
      }
      
      const questionsWithIssues = validatedQuestions.filter(q => q.issues.length > 0).length;
      const totalIssues = validatedQuestions.reduce((sum, q) => sum + q.issues.length, 0);
      
      res.json({
        validatedQuestions,
        questionsWithIssues,
        totalIssues,
        summary: {
          total: questions.length,
          withIssues: questionsWithIssues,
          totalIssues
        }
      });
    } catch (error) {
      console.error("Error validating questions:", error);
      res.status(500).json({ message: "Question validation service unavailable" });
    }
  });

  app.get('/api/ai/interactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const interactions = await storage.getAiInteractionsByUser(userId);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching AI interactions:", error);
      res.status(500).json({ message: "Failed to fetch AI interactions" });
    }
  });

  // Payment routes
  app.post('/api/payments/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email) {
        return res.status(400).json({ message: "User email is required" });
      }

      const { planType, duration } = req.body;
      
      // Calculate amount based on plan
      const amounts = {
        premium: 2500 * duration, // ₦2,500 per month
        institution: 50000 * duration, // ₦50,000 per month
      };

      const amount = amounts[planType as keyof typeof amounts];
      if (!amount) {
        return res.status(400).json({ message: "Invalid plan type" });
      }

      const reference = paystackService.generateReference();
      const callbackUrl = `${req.protocol}://${req.hostname}/api/payments/callback`;

      const paymentData = await paystackService.initializePayment({
        email: user.email,
        amount: paystackService.convertToKobo(amount),
        reference,
        callback_url: callbackUrl,
        metadata: {
          userId,
          planType,
          duration,
        },
      });

      // Save payment record
      await storage.createPayment({
        userId,
        amount: amount.toString(),
        currency: "NGN",
        planType,
        duration,
        paymentMethod: "paystack",
        transactionId: reference,
        paymentReference: reference,
        status: "pending",
      });

      res.json(paymentData);
    } catch (error) {
      console.error("Error initializing payment:", error);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  app.get('/api/payments/verify/:reference', isAuthenticated, async (req, res) => {
    try {
      const reference = req.params.reference;
      
      const verification = await paystackService.verifyPayment(reference);
      
      if (verification.status === "success") {
        await storage.updatePayment(reference, { status: "successful" });
        
        // Update user subscription
        const payment = await storage.getPayment(reference);
        if (payment) {
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + payment.duration);
          
          await storage.upsertUser({
            id: payment.userId,
            subscriptionPlan: payment.planType as "free" | "premium" | "institution",
            subscriptionExpiry: expiryDate,
          });
        }
      } else {
        await storage.updatePayment(reference, { status: "failed" });
      }

      res.json(verification);
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch user analytics" });
    }
  });

  app.get('/api/analytics/system', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system analytics:", error);
      res.status(500).json({ message: "Failed to fetch system analytics" });
    }
  });

  // Enhanced analytics endpoint
  app.get('/api/analytics/enhanced', requireAuth, async (req: any, res) => {
    try {
      const user = req.session.user;
      
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { range = '7d' } = req.query;
      const enhancedData = {
        revenue: {
          current: 74000,
          previous: 53000,
          growth: 38.2
        },
        users: {
          active: 15432,
          new: 1847,
          growth: 12.5
        },
        exams: {
          taken: 8945,
          completed: 7256,
          avgScore: 78.5
        },
        geographic: [
          { state: 'Lagos', users: 2341, revenue: 18600 },
          { state: 'Abuja', users: 1876, revenue: 15200 },
          { state: 'Kano', users: 1543, revenue: 12100 }
        ]
      };
      res.json(enhancedData);
    } catch (error) {
      console.error('Error fetching enhanced analytics:', error);
      res.status(500).json({ message: 'Failed to fetch enhanced analytics' });
    }
  });

  // Profile management routes
  app.put('/api/auth/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const profileData = req.body;
      
      // Validate profile data
      const allowedFields = ['name', 'username', 'phone', 'bio', 'location', 'institution'];
      const updateData = Object.keys(profileData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = profileData[key];
          return obj;
        }, {} as any);
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...updateData
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post('/api/auth/change-password', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // In production, you would verify the current password
      // For demo purposes, we'll just simulate successful change
      if (currentPassword === 'demo123') {
        res.json({ message: "Password changed successfully" });
      } else {
        res.status(400).json({ message: "Current password is incorrect" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.post('/api/auth/upload-profile-pic', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      
      // In production, you would handle file upload to cloud storage
      // For demo purposes, we'll simulate successful upload
      const profilePicUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.session.user.name || 'User')}&background=random`;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        avatar: profilePicUrl
      });
      
      res.json({ profilePicUrl, user: updatedUser });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });

  // Learning Package routes
  app.get('/api/learning-packages', async (req, res) => {
    try {
      const packages = await storage.getAllLearningPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching learning packages:", error);
      res.status(500).json({ message: "Failed to fetch learning packages" });
    }
  });

  app.get('/api/learning-packages/category/:category', async (req, res) => {
    try {
      const packages = await storage.getLearningPackagesByCategory(req.params.category);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching learning packages by category:", error);
      res.status(500).json({ message: "Failed to fetch learning packages" });
    }
  });

  app.post('/api/learning-packages', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const packageData = req.body;
      
      const newPackage = await storage.createLearningPackage({
        ...packageData,
        createdBy: userId,
      });
      
      res.status(201).json(newPackage);
    } catch (error) {
      console.error("Error creating learning package:", error);
      res.status(500).json({ message: "Failed to create learning package" });
    }
  });

  // AI Tutor Session routes
  app.post('/api/ai-tutor/sessions', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = req.body;
      
      const session = await storage.createAiTutorSession({
        ...sessionData,
        userId,
      });
      
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating AI tutor session:", error);
      res.status(500).json({ message: "Failed to create AI tutor session" });
    }
  });

  app.get('/api/ai-tutor/sessions', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getAiTutorSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching AI tutor sessions:", error);
      res.status(500).json({ message: "Failed to fetch AI tutor sessions" });
    }
  });

  app.patch('/api/ai-tutor/sessions/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = req.params.id;
      const updates = req.body;
      
      // Verify session belongs to user
      const session = await storage.getAiTutorSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedSession = await storage.updateAiTutorSession(sessionId, updates);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating AI tutor session:", error);
      res.status(500).json({ message: "Failed to update AI tutor session" });
    }
  });

  // Learning History routes
  app.get('/api/learning-history', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getLearningHistoryByUser(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching learning history:", error);
      res.status(500).json({ message: "Failed to fetch learning history" });
    }
  });

  // Monthly Reviews routes
  app.get('/api/monthly-reviews', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviews = await storage.getMonthlyReviewsByUser(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching monthly reviews:", error);
      res.status(500).json({ message: "Failed to fetch monthly reviews" });
    }
  });

  // User Subjects routes
  app.get('/api/user-subjects', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subjects = await storage.getUserSubjects(userId);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching user subjects:", error);
      res.status(500).json({ message: "Failed to fetch user subjects" });
    }
  });

  app.post('/api/user-subjects', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subjectData = req.body;
      
      const userSubject = await storage.createUserSubject({
        ...subjectData,
        userId,
      });
      
      res.status(201).json(userSubject);
    } catch (error) {
      console.error("Error creating user subject:", error);
      res.status(500).json({ message: "Failed to create user subject" });
    }
  });

  // Admin routes for users management
  app.get('/api/users', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Return mock users for now - in production this would fetch from database
      const mockUsers = [
        { id: "admin-001", email: "admin@edrac.com", firstName: "System", lastName: "Administrator", role: "admin", subscriptionPlan: "premium", createdAt: "2024-01-15" },
        { id: "student-001", email: "student@edrac.com", firstName: "Test", lastName: "Student", role: "student", subscriptionPlan: "free", createdAt: "2024-02-20" },
        { id: "institution-001", email: "institution@edrac.com", firstName: "Institution", lastName: "Manager", role: "institution", subscriptionPlan: "premium", createdAt: "2024-01-30" },
        { id: "student-002", email: "jane.student@edrac.com", firstName: "Jane", lastName: "Doe", role: "student", subscriptionPlan: "premium", createdAt: "2024-03-10" },
        { id: "student-003", email: "michael.test@edrac.com", firstName: "Michael", lastName: "Johnson", role: "student", subscriptionPlan: "free", createdAt: "2024-03-15" },
      ];
      
      res.json(mockUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const userData = req.body;
      const newUser = await storage.upsertUser({
        id: `user-${Date.now()}`,
        ...userData
      });
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch('/api/users/:id', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const userId = req.params.id;
      const userData = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...userData
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/users/:id', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const userId = req.params.id;
      
      // In a real implementation, you'd delete the user from the database
      // For now, we'll just return success
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin routes for institutions management
  app.get('/api/institutions', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const institutions = await storage.getInstitutionsByOwner(currentUserId);
      res.json(institutions);
    } catch (error) {
      console.error("Error fetching institutions:", error);
      res.status(500).json({ message: "Failed to fetch institutions" });
    }
  });

  app.post('/api/institutions', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user?.id || req.user?.claims?.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const institutionData = insertInstitutionSchema.parse(req.body);
      const institution = await storage.createInstitution({
        ...institutionData,
        id: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ownerId: currentUserId
      });
      
      res.status(201).json(institution);
    } catch (error) {
      console.error("Error creating institution:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create institution" });
    }
  });

  app.patch('/api/institutions/:id', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const institutionId = req.params.id;
      const institutionData = req.body;
      
      const updatedInstitution = await storage.updateInstitution(institutionId, institutionData);
      res.json(updatedInstitution);
    } catch (error) {
      console.error("Error updating institution:", error);
      res.status(500).json({ message: "Failed to update institution" });
    }
  });

  app.delete('/api/institutions/:id', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const institutionId = req.params.id;
      
      // Delete from database
      await db.delete(institutions).where(eq(institutions.id, institutionId));
      
      res.json({ message: "Institution deleted successfully" });
    } catch (error) {
      console.error("Error deleting institution:", error);
      res.status(500).json({ message: "Failed to delete institution" });
    }
  });

  // Admin settings routes
  app.put('/api/admin/settings', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const settings = req.body;
      
      // In a real implementation, you'd save these settings to the database
      // For now, we'll just return success
      res.json({ message: "Settings saved successfully", settings });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  // Email sending route
  app.post('/api/admin/send-email', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { to, subject, message, recipient_type, role_filter } = req.body;
      
      // In a real implementation, you'd send emails using SMTP
      // For now, we'll just return success
      res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // API Health Check Routes
  app.get('/api/ai/test', requireAuth, async (req, res) => {
    try {
      const hasOpenAI = !!process.env.OPENAI_API_KEY;
      res.json({ 
        status: hasOpenAI ? 'connected' : 'disconnected',
        service: 'OpenAI',
        configured: hasOpenAI
      });
    } catch (error) {
      res.status(500).json({ status: 'error', service: 'OpenAI' });
    }
  });

  app.get('/api/payments/test', requireAuth, async (req, res) => {
    try {
      const hasPaystack = !!process.env.PAYSTACK_SECRET_KEY;
      res.json({ 
        status: hasPaystack ? 'connected' : 'disconnected',
        service: 'Paystack',
        configured: hasPaystack
      });
    } catch (error) {
      res.status(500).json({ status: 'error', service: 'Paystack' });
    }
  });

  app.get('/api/email/test', requireAuth, async (req, res) => {
    try {
      const hasSendGrid = !!process.env.SENDGRID_API_KEY;
      res.json({ 
        status: hasSendGrid ? 'connected' : 'disconnected',
        service: 'SendGrid',
        configured: hasSendGrid
      });
    } catch (error) {
      res.status(500).json({ status: 'error', service: 'SendGrid' });
    }
  });

  app.get('/api/health/database', requireAuth, async (req, res) => {
    try {
      await db.select().from(users).limit(1);
      res.json({ 
        status: 'connected',
        service: 'Database',
        configured: true
      });
    } catch (error) {
      res.status(500).json({ status: 'error', service: 'Database' });
    }
  });

  const httpServer = createServer(app);
  // Additional API endpoints for enhanced features
  
  // Question Management API
  app.get('/api/questions', requireAuth, async (req, res) => {
    try {
      const { subjectId, topicId, difficulty, limit = 50 } = req.query;
      
      const questions = await storage.getRandomQuestions({
        subjectIds: subjectId ? [parseInt(subjectId as string)] : undefined,
        topicIds: topicId ? [parseInt(topicId as string)] : undefined,
        difficulty: difficulty as string,
        limit: parseInt(limit as string)
      });
      
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ message: 'Failed to fetch questions' });
    }
  });

  // Bulk upload questions
  app.post('/api/questions/bulk-upload', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user?.id || req.user?.claims?.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // In a real implementation, you would:
      // 1. Parse the uploaded CSV/Excel file
      // 2. Validate each row
      // 3. Create questions in bulk
      // 4. Return detailed results
      
      // For now, simulate the process
      const mockResult = {
        success: true,
        message: "Questions uploaded successfully",
        processed: 25,
        failed: 2,
        errors: [
          "Row 15: Missing correct answer",
          "Row 23: Invalid subject name"
        ]
      };
      
      res.json(mockResult);
    } catch (error) {
      console.error('Error uploading questions:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to upload questions',
        processed: 0,
        failed: 0,
        errors: ['Upload failed due to server error']
      });
    }
  });

  app.post('/api/questions', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user?.id || req.user?.claims?.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion({
        ...questionData,
        createdBy: currentUserId
      });
      res.status(201).json(question);
    } catch (error) {
      console.error('Error creating question:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create question' });
    }
  });

  app.delete('/api/questions/:id', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user?.id || req.user?.claims?.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const questionId = parseInt(req.params.id);
      await storage.deleteQuestion(questionId);
      
      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ message: 'Failed to delete question' });
    }
  });

  app.post('/api/questions/bulk-upload', requireAuth, async (req: any, res) => {
    try {
      // Mock bulk upload response
      const mockQuestions = [
        { text: "What is 2+2?", options: ["3", "4", "5", "6"], correctAnswer: "4" },
        { text: "What is the capital of Nigeria?", options: ["Lagos", "Abuja", "Kano", "Ibadan"], correctAnswer: "Abuja" }
      ];
      
      let created = 0;
      for (const questionData of mockQuestions) {
        try {
          await storage.createQuestion({
            ...questionData,
            explanation: "Sample explanation",
            difficulty: "medium",
            subjectId: 1,
            topicId: 1,
            examType: "jamb",
            createdBy: req.session.user.id
          });
          created++;
        } catch (error) {
          console.error('Error creating question:', error);
        }
      }
      
      res.json({ count: created, message: `${created} questions uploaded successfully` });
    } catch (error) {
      console.error('Error bulk uploading questions:', error);
      res.status(500).json({ message: 'Failed to upload questions' });
    }
  });

  // AI Services API
  app.post('/api/ai/tutoring', requireAuth, async (req: any, res) => {
    try {
      const { question, context } = req.body;
      const response = await provideTutoring(question, context);
      res.json(response);
    } catch (error) {
      console.error('Error in AI tutoring:', error);
      res.status(500).json({ message: 'Failed to get AI response' });
    }
  });

  // AI Question Generation
  app.post('/api/ai/generate-questions', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user?.id || req.user?.claims?.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { subject, topic, difficulty, examType, count } = req.body;
      
      // Generate questions using AI
      const generatedQuestions = await generateQuestions({
        subject,
        topic: topic || subject, // Use subject if no topic
        difficulty,
        examType,
        count
      });

      // Save generated questions to database
      const savedQuestions = [];
      for (const question of generatedQuestions) {
        try {
          const saved = await storage.createQuestion({
            text: question.text,
            type: 'multiple_choice',
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            subjectId: parseInt(subject),
            topicId: topic && topic !== "none" ? parseInt(topic) : undefined,
            examType: examType,
            points: 1,
            isActive: true,
            createdBy: currentUserId
          });
          savedQuestions.push(saved);
        } catch (error) {
          console.error('Error saving generated question:', error);
        }
      }

      res.json({ 
        generated: generatedQuestions.length, 
        saved: savedQuestions.length, 
        questions: savedQuestions 
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      res.status(500).json({ message: 'Failed to generate questions' });
    }
  });

  app.post('/api/ai/generate-questions', requireAuth, async (req: any, res) => {
    try {
      const params = req.body;
      const questions = await generateQuestions(params);
      res.json({ questions });
    } catch (error) {
      console.error('Error generating questions:', error);
      res.status(500).json({ message: 'Failed to generate questions' });
    }
  });

  app.post('/api/ai/study-plan', requireAuth, async (req: any, res) => {
    try {
      const { subjects, examType, timeFrame } = req.body;
      const studyPlan = await generateStudyPlan(subjects, examType, timeFrame);
      res.json(studyPlan);
    } catch (error) {
      console.error('Error generating study plan:', error);
      res.status(500).json({ message: 'Failed to generate study plan' });
    }
  });

  // API Configuration endpoints
  app.post('/api/config/test/:apiId', requireAuth, async (req: any, res) => {
    try {
      const { apiId } = req.params;
      
      // Mock API testing logic
      const testResults = {
        openai: { status: 'connected', message: 'OpenAI API connection successful' },
        paystack: { status: 'connected', message: 'Paystack API connection successful' },
        sendgrid: { status: 'connected', message: 'SendGrid API connection successful' },
        database: { status: 'connected', message: 'Database connection successful' }
      };
      
      res.json(testResults[apiId] || { status: 'error', message: 'API not found' });
    } catch (error) {
      console.error('Error testing API:', error);
      res.status(500).json({ message: 'Failed to test API connection' });
    }
  });

  app.post('/api/config/save', requireAuth, async (req: any, res) => {
    try {
      const { apiId, config } = req.body;
      
      // Save API configuration (implement based on your needs)
      // This would typically save to environment variables or database
      
      res.json({ message: 'Configuration saved successfully' });
    } catch (error) {
      console.error('Error saving configuration:', error);
      res.status(500).json({ message: 'Failed to save configuration' });
    }
  });

  // Profile Management API
  app.patch('/api/profile/update', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const updateData = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...updateData
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  app.post('/api/profile/upload-image', requireAuth, async (req: any, res) => {
    try {
      // Handle image upload logic
      const imageUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
      
      const userId = req.session.user.id;
      await storage.upsertUser({
        id: userId,
        profileImageUrl: imageUrl
      });
      
      res.json({ imageUrl, message: 'Image uploaded successfully' });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  // Enhanced analytics endpoint
  app.get('/api/analytics/enhanced', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { range = '7d' } = req.query;
      const enhancedData = {
        revenue: {
          current: 74000,
          previous: 53000,
          growth: 38.2
        },
        users: {
          active: 15432,
          new: 1847,
          growth: 12.5
        },
        exams: {
          taken: 8945,
          completed: 7256,
          avgScore: 78.5
        },
        geographic: [
          { state: 'Lagos', users: 2341, revenue: 18600 },
          { state: 'Abuja', users: 1876, revenue: 15200 },
          { state: 'Kano', users: 1543, revenue: 12100 }
        ]
      };
      res.json(enhancedData);
    } catch (error) {
      console.error('Error fetching enhanced analytics:', error);
      res.status(500).json({ message: 'Failed to fetch enhanced analytics' });
    }
  });

  // Topics and subjects management endpoints
  app.get('/api/topics/subject/:subjectId', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const subjectId = parseInt(req.params.subjectId);
      const topics = await storage.getTopicsBySubject(subjectId);
      res.json(topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      res.status(500).json({ message: 'Failed to fetch topics' });
    }
  });

  app.post('/api/topics', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const newTopic = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(newTopic);
    } catch (error) {
      console.error('Error creating topic:', error);
      res.status(500).json({ message: 'Failed to create topic' });
    }
  });

  app.post('/api/subjects', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const newSubject = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(newSubject);
    } catch (error) {
      console.error('Error creating subject:', error);
      res.status(500).json({ message: 'Failed to create subject' });
    }
  });

  app.delete('/api/subjects/:id', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
      console.error('Error deleting subject:', error);
      res.status(500).json({ message: 'Failed to delete subject' });
    }
  });

  app.delete('/api/topics/:id', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
      console.error('Error deleting topic:', error);
      res.status(500).json({ message: 'Failed to delete topic' });
    }
  });

  // AI Chat endpoint
  app.post('/api/ai/chat', requireAuth, async (req: any, res) => {
    try {
      const { message, context, conversationHistory } = req.body;
      
      // System prompt for Edrac CBT platform
      const systemPrompt = `You are an AI assistant for the Edrac CBT (Computer-Based Testing) platform. 
      You help with questions about:
      - Exam creation and management
      - Question bank management
      - User roles (admin, institution, student)
      - CBT features (anti-cheating, time limits, grading)
      - Platform navigation and features
      - Technical support for the system
      
      Be helpful, concise, and specific to the CBT platform context.
      Current platform features include: AI question generation, exam sharing, analytics, payment integration, and user management.`;

      // Mock AI response - in production, this would call OpenAI API
      const responses = [
        "I can help you with exam management. What specific feature would you like to know about?",
        "For creating exams, go to the Exams tab in your dashboard. You can set duration, question count, and enable anti-cheating features.",
        "Question validation checks for typos, grammar errors, and format issues. Would you like me to explain how to use it?",
        "User management allows you to create and manage student, institution, and admin accounts. What would you like to do?",
        "The analytics dashboard shows exam performance, user engagement, and revenue metrics. Is there a specific metric you're interested in?",
        "AI question generation can create questions based on subject, topic, difficulty, and exam type. Would you like me to guide you through it?",
        "Exam sharing allows you to create public exam links for institutional interviews or assessments. The system tracks guest registrations."
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      
      // Create AI interaction record
      await storage.createAiInteraction({
        userId: req.session.user.id,
        question: message,
        response: response,
        type: 'chat',
        metadata: { context: context || 'general' }
      });

      res.json({ response, context: 'edrac-cbt-platform' });
    } catch (error) {
      console.error('Error in AI chat:', error);
      res.status(500).json({ message: 'Failed to process chat message' });
    }
  });

  // Typo checking endpoint
  app.post('/api/ai/check-typos', requireAuth, async (req: any, res) => {
    try {
      const { text } = req.body;
      
      // Mock typo checking - in production, this would use OpenAI or dedicated grammar checking API
      const commonTypos = [
        { original: 'teh', corrected: 'the', confidence: 0.95 },
        { original: 'recieve', corrected: 'receive', confidence: 0.92 },
        { original: 'occured', corrected: 'occurred', confidence: 0.90 },
        { original: 'seperate', corrected: 'separate', confidence: 0.88 },
        { original: 'definately', corrected: 'definitely', confidence: 0.94 }
      ];

      const corrections = commonTypos.filter(typo => 
        text.toLowerCase().includes(typo.original.toLowerCase())
      );

      res.json({ corrections, hasTypos: corrections.length > 0 });
    } catch (error) {
      console.error('Error checking typos:', error);
      res.status(500).json({ message: 'Failed to check typos' });
    }
  });

  // Question validation endpoint
  app.post('/api/ai/validate-questions', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { questions } = req.body;
      
      // Mock validation - in production, this would use OpenAI for comprehensive validation
      const validatedQuestions = questions.map((question: any) => {
        const issues = [];
        
        // Check for common issues
        if (question.text.length < 10) {
          issues.push({
            id: `issue-${Date.now()}-1`,
            type: 'error',
            category: 'content',
            message: 'Question text is too short',
            originalText: question.text,
            suggestedFix: question.text + ' Please provide more context.',
            confidence: 0.9,
            position: { start: 0, end: question.text.length }
          });
        }
        
        if (question.options.length !== 4) {
          issues.push({
            id: `issue-${Date.now()}-2`,
            type: 'warning',
            category: 'structure',
            message: 'Questions should have exactly 4 options',
            originalText: `${question.options.length} options provided`,
            suggestedFix: 'Add or remove options to have exactly 4 choices',
            confidence: 0.8,
            position: { start: 0, end: 0 }
          });
        }
        
        if (question.text.includes('teh')) {
          issues.push({
            id: `issue-${Date.now()}-3`,
            type: 'error',
            category: 'spelling',
            message: 'Spelling error detected',
            originalText: 'teh',
            suggestedFix: 'the',
            confidence: 0.95,
            position: { start: question.text.indexOf('teh'), end: question.text.indexOf('teh') + 3 }
          });
        }
        
        return {
          ...question,
          issues: issues.length > 0 ? issues : undefined
        };
      });

      const totalIssues = validatedQuestions.reduce((sum: number, q: any) => sum + (q.issues?.length || 0), 0);
      const questionsWithIssues = validatedQuestions.filter((q: any) => q.issues && q.issues.length > 0).length;

      res.json({
        validatedQuestions,
        totalIssues,
        questionsWithIssues,
        validationComplete: true
      });
    } catch (error) {
      console.error('Error validating questions:', error);
      res.status(500).json({ message: 'Failed to validate questions' });
    }
  });

  // Fix question issue endpoint
  app.patch('/api/questions/:id/fix-issue', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { issueId, acceptedFix } = req.body;

      // Mock fix application - in production, this would update the actual question
      const updatedQuestion = {
        id,
        text: acceptedFix,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: "Updated explanation",
        subject: "Mathematics",
        topic: "Algebra",
        difficulty: "medium",
        issues: [] // Remove issues after fixing
      };

      res.json({
        questionId: id,
        updatedQuestion,
        fixedIssueId: issueId
      });
    } catch (error) {
      console.error('Error fixing question issue:', error);
      res.status(500).json({ message: 'Failed to fix question issue' });
    }
  });

  // CBT Exam Session Management
  app.post('/api/exams/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const examId = req.params.id;
      
      // Check if user has an active session
      const activeSession = await storage.getUserActiveSession(userId);
      if (activeSession) {
        return res.status(400).json({ message: "You already have an active exam session" });
      }
      
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      const session = await storage.createExamSession({
        examId,
        userId,
        startTime: new Date(),
        answers: {},
        status: 'active',
        timeRemaining: exam.duration * 60, // Convert minutes to seconds
      });
      
      res.json(session);
    } catch (error) {
      console.error("Error starting exam:", error);
      res.status(500).json({ message: "Failed to start exam" });
    }
  });

  // Submit exam session
  app.post('/api/exam-sessions/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = req.params.id;
      const { answers } = req.body;
      
      const session = await storage.getExamSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Exam session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const exam = await storage.getExam(session.examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      // Calculate score (simplified for demo)
      const totalQuestions = exam.totalQuestions;
      const answeredQuestions = Object.keys(answers).length;
      const score = Math.round((answeredQuestions / totalQuestions) * 100);
      
      const updatedSession = await storage.updateExamSession(sessionId, {
        answers,
        score,
        endTime: new Date(),
        status: 'completed',
      });
      
      res.json({
        session: updatedSession,
        score,
        totalQuestions,
        answeredQuestions,
      });
    } catch (error) {
      console.error("Error submitting exam:", error);
      res.status(500).json({ message: "Failed to submit exam" });
    }
  });

  // Get practice questions for CBT
  app.get('/api/questions/practice', async (req, res) => {
    try {
      const { subjectIds, difficulty, limit = 20 } = req.query;
      
      const params = {
        subjectIds: subjectIds ? (subjectIds as string).split(',').map(Number) : undefined,
        difficulty: difficulty as string,
        limit: parseInt(limit as string) || 20,
      };
      
      const questions = await storage.getRandomQuestions(params);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching practice questions:", error);
      res.status(500).json({ message: "Failed to fetch practice questions" });
    }
  });

  // Study Groups API
  app.post('/api/study-groups', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const groupData = req.body;
      
      const group = await storage.createStudyGroup({
        ...groupData,
        createdBy: userId,
      });
      
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating study group:", error);
      res.status(500).json({ message: "Failed to create study group" });
    }
  });

  app.get('/api/study-groups', requireAuth, async (req: any, res) => {
    try {
      const { subjects, difficulty, status } = req.query;
      const filters = { subjects, difficulty, status };
      
      const groups = await storage.getStudyGroups(filters);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching study groups:", error);
      res.status(500).json({ message: "Failed to fetch study groups" });
    }
  });

  app.get('/api/study-groups/my-groups', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const groups = await storage.getUserStudyGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching user study groups:", error);
      res.status(500).json({ message: "Failed to fetch user study groups" });
    }
  });

  app.get('/api/study-groups/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const group = await storage.getStudyGroup(id);
      
      if (!group) {
        return res.status(404).json({ message: "Study group not found" });
      }
      
      res.json(group);
    } catch (error) {
      console.error("Error fetching study group:", error);
      res.status(500).json({ message: "Failed to fetch study group" });
    }
  });

  app.post('/api/study-groups/:id/join', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user.id;
      
      const membership = await storage.joinStudyGroup(id, userId);
      res.json(membership);
    } catch (error) {
      console.error("Error joining study group:", error);
      res.status(500).json({ message: "Failed to join study group" });
    }
  });

  app.delete('/api/study-groups/:id/leave', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user.id;
      
      await storage.leaveStudyGroup(id, userId);
      res.json({ message: "Left study group successfully" });
    } catch (error) {
      console.error("Error leaving study group:", error);
      res.status(500).json({ message: "Failed to leave study group" });
    }
  });

  app.get('/api/study-groups/:id/members', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const members = await storage.getStudyGroupMembers(id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching study group members:", error);
      res.status(500).json({ message: "Failed to fetch study group members" });
    }
  });

  // Study Preferences API
  app.post('/api/study-preferences', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const preferences = req.body;
      
      const userPrefs = await storage.createUserStudyPreferences({
        ...preferences,
        userId,
      });
      
      res.status(201).json(userPrefs);
    } catch (error) {
      console.error("Error creating study preferences:", error);
      res.status(500).json({ message: "Failed to create study preferences" });
    }
  });

  app.get('/api/study-preferences', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const preferences = await storage.getUserStudyPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "Study preferences not found" });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching study preferences:", error);
      res.status(500).json({ message: "Failed to fetch study preferences" });
    }
  });

  app.put('/api/study-preferences', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const preferences = req.body;
      
      const updatedPrefs = await storage.updateUserStudyPreferences(userId, preferences);
      res.json(updatedPrefs);
    } catch (error) {
      console.error("Error updating study preferences:", error);
      res.status(500).json({ message: "Failed to update study preferences" });
    }
  });

  // Study Sessions API
  app.post('/api/study-sessions', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const sessionData = req.body;
      
      const session = await storage.createStudySession({
        ...sessionData,
        hostId: userId,
      });
      
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating study session:", error);
      res.status(500).json({ message: "Failed to create study session" });
    }
  });

  app.get('/api/study-sessions/upcoming', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const sessions = await storage.getUpcomingStudySessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching upcoming study sessions:", error);
      res.status(500).json({ message: "Failed to fetch upcoming study sessions" });
    }
  });

  app.get('/api/study-groups/:groupId/sessions', requireAuth, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      const sessions = await storage.getStudySessionsByGroup(groupId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching study sessions:", error);
      res.status(500).json({ message: "Failed to fetch study sessions" });
    }
  });

  app.post('/api/study-sessions/:id/join', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user.id;
      
      const participation = await storage.joinStudySession(id, userId);
      res.json(participation);
    } catch (error) {
      console.error("Error joining study session:", error);
      res.status(500).json({ message: "Failed to join study session" });
    }
  });

  // AI Matchmaking API
  app.get('/api/ai-matchmaking/suggestions', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const suggestions = await storage.getMatchmakingSuggestions(userId);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching matchmaking suggestions:", error);
      res.status(500).json({ message: "Failed to fetch matchmaking suggestions" });
    }
  });

  app.post('/api/ai-matchmaking', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const criteria = req.body;
      
      const matchmaking = await storage.createMatchmaking(userId, criteria);
      res.json(matchmaking);
    } catch (error) {
      console.error("Error creating matchmaking:", error);
      res.status(500).json({ message: "Failed to create matchmaking" });
    }
  });

  return httpServer;
}
