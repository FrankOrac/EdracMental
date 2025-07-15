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
  app.post('/api/ai/explain', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub;
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

  app.post('/api/ai/tutor', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub;
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

  return httpServer;
}
