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
  insertPaymentSchema 
} from "@shared/schema";
import { generateQuestions, explainQuestion, provideTutoring } from "./services/openai";
import { paystackService } from "./services/paystack";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  await setupGoogleAuth(app);

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
      
      // Find user by email in database (since users were created with different IDs)
      let user;
      try {
        const allUsers = await db.select().from(users).where(eq(users.email, userAccount.email));
        user = allUsers[0];
        
        // If user doesn't exist, create them
        if (!user) {
          user = await storage.upsertUser({
            id: userAccount.id,
            email: userAccount.email,
            firstName: userAccount.name.split(' ')[0],
            lastName: userAccount.name.split(' ').slice(1).join(' ') || 'User',
            role: userAccount.role,
            subscriptionPlan: userAccount.plan === 'admin' ? 'premium' : userAccount.plan
          });
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
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion({ ...questionData, createdBy: userId });
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
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

  app.post('/api/questions/generate', isAuthenticated, async (req, res) => {
    try {
      const { subject, topic, difficulty, examType, count } = req.body;
      const questions = await generateQuestions({ subject, topic, difficulty, examType, count });
      res.json({ questions });
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ message: "Failed to generate questions" });
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

  app.get('/api/exams/:id/questions', async (req, res) => {
    try {
      const exam = await storage.getExam(req.params.id);
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const { question, context } = req.body;

      const response = await provideTutoring(question, context);
      
      // Save interaction
      await storage.createAiInteraction({
        userId,
        type: "tutor_chat",
        question,
        response: response.explanation,
      });

      res.json(response);
    } catch (error) {
      console.error("Error providing tutoring:", error);
      res.status(500).json({ message: "Failed to provide tutoring" });
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
  app.get('/api/analytics/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch user analytics" });
    }
  });

  app.get('/api/analytics/system', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);
  return httpServer;
}
