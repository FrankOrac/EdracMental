import {
  users,
  institutions,
  subjects,
  topics,
  questions,
  exams,
  examSessions,
  aiInteractions,
  payments,
  notifications,
  type User,
  type UpsertUser,
  type Institution,
  type InsertInstitution,
  type Subject,
  type Topic,
  type Question,
  type InsertQuestion,
  type Exam,
  type InsertExam,
  type ExamSession,
  type InsertExamSession,
  type AiInteraction,
  type InsertAiInteraction,
  type Payment,
  type InsertPayment,
  type Notification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count, avg, sum, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Institution operations
  createInstitution(institution: InsertInstitution & { ownerId: string }): Promise<Institution>;
  getInstitution(id: string): Promise<Institution | undefined>;
  getInstitutionsByOwner(ownerId: string): Promise<Institution[]>;
  updateInstitution(id: string, data: Partial<InsertInstitution>): Promise<Institution>;
  
  // Subject and topic operations
  getSubjects(): Promise<Subject[]>;
  getSubjectsByCategory(category: string): Promise<Subject[]>;
  getTopicsBySubject(subjectId: number): Promise<Topic[]>;
  
  // Question operations
  createQuestion(question: InsertQuestion & { createdBy: string }): Promise<Question>;
  getQuestionsByTopic(topicId: number): Promise<Question[]>;
  getQuestionsBySubject(subjectId: number): Promise<Question[]>;
  getRandomQuestions(params: {
    subjectIds?: number[];
    topicIds?: number[];
    difficulty?: string;
    examType?: string;
    limit: number;
  }): Promise<Question[]>;
  updateQuestion(id: number, data: Partial<InsertQuestion>): Promise<Question>;
  deleteQuestion(id: number): Promise<void>;
  
  // Exam operations
  createExam(exam: InsertExam & { createdBy: string }): Promise<Exam>;
  getExam(id: string): Promise<Exam | undefined>;
  getExamsByCreator(creatorId: string): Promise<Exam[]>;
  getExamsByInstitution(institutionId: string): Promise<Exam[]>;
  getPublicExams(): Promise<Exam[]>;
  updateExam(id: string, data: Partial<InsertExam>): Promise<Exam>;
  deleteExam(id: string): Promise<void>;
  
  // Exam session operations
  createExamSession(session: InsertExamSession & { userId: string }): Promise<ExamSession>;
  getExamSession(id: string): Promise<ExamSession | undefined>;
  getExamSessionsByUser(userId: string): Promise<ExamSession[]>;
  getExamSessionsByExam(examId: string): Promise<ExamSession[]>;
  updateExamSession(id: string, data: Partial<InsertExamSession>): Promise<ExamSession>;
  getUserActiveSession(userId: string): Promise<ExamSession | undefined>;
  
  // AI interaction operations
  createAiInteraction(interaction: InsertAiInteraction & { userId: string; response: string }): Promise<AiInteraction>;
  getAiInteractionsByUser(userId: string): Promise<AiInteraction[]>;
  
  // Payment operations
  createPayment(payment: InsertPayment & { userId: string }): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment>;
  
  // Notification operations
  createNotification(notification: { userId: string; title: string; message: string; type: string; metadata?: any }): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Analytics operations
  getUserStats(userId: string): Promise<{
    totalExams: number;
    averageScore: number;
    studyTime: number;
    recentSessions: ExamSession[];
  }>;
  getInstitutionStats(institutionId: string): Promise<{
    totalStudents: number;
    totalExams: number;
    averageScore: number;
    recentActivity: any[];
  }>;
  getSystemStats(): Promise<{
    totalUsers: number;
    totalExams: number;
    totalQuestions: number;
    totalInstitutions: number;
    dailyActiveUsers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Institution operations
  async createInstitution(institutionData: InsertInstitution & { ownerId: string }): Promise<Institution> {
    const id = `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [institution] = await db
      .insert(institutions)
      .values({ ...institutionData, id })
      .returning();
    return institution;
  }
  
  async getInstitution(id: string): Promise<Institution | undefined> {
    const [institution] = await db.select().from(institutions).where(eq(institutions.id, id));
    return institution;
  }
  
  async getInstitutionsByOwner(ownerId: string): Promise<Institution[]> {
    return await db.select().from(institutions).where(eq(institutions.ownerId, ownerId));
  }
  
  async updateInstitution(id: string, data: Partial<InsertInstitution>): Promise<Institution> {
    const [institution] = await db
      .update(institutions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(institutions.id, id))
      .returning();
    return institution;
  }
  
  // Subject and topic operations
  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.isActive, true));
  }
  
  async getSubjectsByCategory(category: string): Promise<Subject[]> {
    return await db
      .select()
      .from(subjects)
      .where(and(eq(subjects.category, category as any), eq(subjects.isActive, true)));
  }
  
  async getTopicsBySubject(subjectId: number): Promise<Topic[]> {
    return await db
      .select()
      .from(topics)
      .where(and(eq(topics.subjectId, subjectId), eq(topics.isActive, true)));
  }
  
  // Question operations
  async createQuestion(questionData: InsertQuestion & { createdBy: string }): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values(questionData)
      .returning();
    return question;
  }
  
  async getQuestionsByTopic(topicId: number): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(and(eq(questions.topicId, topicId), eq(questions.isActive, true)));
  }
  
  async getQuestionsBySubject(subjectId: number): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(and(eq(questions.subjectId, subjectId), eq(questions.isActive, true)));
  }
  
  async getRandomQuestions(params: {
    subjectIds?: number[];
    topicIds?: number[];
    difficulty?: string;
    examType?: string;
    limit: number;
  }): Promise<Question[]> {
    const conditions = [eq(questions.isActive, true)];
    
    if (params.subjectIds && params.subjectIds.length > 0) {
      conditions.push(inArray(questions.subjectId, params.subjectIds));
    }
    
    if (params.topicIds && params.topicIds.length > 0) {
      conditions.push(inArray(questions.topicId, params.topicIds));
    }
    
    if (params.difficulty) {
      conditions.push(eq(questions.difficulty, params.difficulty as any));
    }
    
    if (params.examType) {
      conditions.push(eq(questions.examType, params.examType as any));
    }
    
    return await db
      .select()
      .from(questions)
      .where(and(...conditions))
      .orderBy(sql`RANDOM()`)
      .limit(params.limit);
  }
  
  async updateQuestion(id: number, data: Partial<InsertQuestion>): Promise<Question> {
    const [question] = await db
      .update(questions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(questions.id, id))
      .returning();
    return question;
  }
  
  async deleteQuestion(id: number): Promise<void> {
    await db.update(questions).set({ isActive: false }).where(eq(questions.id, id));
  }
  
  // Exam operations
  async createExam(examData: InsertExam & { createdBy: string }): Promise<Exam> {
    const [exam] = await db
      .insert(exams)
      .values(examData)
      .returning();
    return exam;
  }
  
  async getExam(id: string): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    return exam;
  }
  
  async getExamsByCreator(creatorId: string): Promise<Exam[]> {
    return await db
      .select()
      .from(exams)
      .where(and(eq(exams.createdBy, creatorId), eq(exams.isActive, true)))
      .orderBy(desc(exams.createdAt));
  }
  
  async getExamsByInstitution(institutionId: string): Promise<Exam[]> {
    return await db
      .select()
      .from(exams)
      .where(and(eq(exams.institutionId, institutionId), eq(exams.isActive, true)))
      .orderBy(desc(exams.createdAt));
  }
  
  async getPublicExams(): Promise<Exam[]> {
    return await db
      .select()
      .from(exams)
      .where(and(eq(exams.isPublic, true), eq(exams.isActive, true)))
      .orderBy(desc(exams.createdAt));
  }
  
  async updateExam(id: string, data: Partial<InsertExam>): Promise<Exam> {
    const [exam] = await db
      .update(exams)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(exams.id, id))
      .returning();
    return exam;
  }
  
  async deleteExam(id: string): Promise<void> {
    await db.update(exams).set({ isActive: false }).where(eq(exams.id, id));
  }
  
  // Exam session operations
  async createExamSession(sessionData: InsertExamSession & { userId: string }): Promise<ExamSession> {
    const [session] = await db
      .insert(examSessions)
      .values(sessionData)
      .returning();
    return session;
  }
  
  async getExamSession(id: string): Promise<ExamSession | undefined> {
    const [session] = await db.select().from(examSessions).where(eq(examSessions.id, id));
    return session;
  }
  
  async getExamSessionsByUser(userId: string): Promise<ExamSession[]> {
    return await db
      .select()
      .from(examSessions)
      .where(eq(examSessions.userId, userId))
      .orderBy(desc(examSessions.createdAt));
  }
  
  async getExamSessionsByExam(examId: string): Promise<ExamSession[]> {
    return await db
      .select()
      .from(examSessions)
      .where(eq(examSessions.examId, examId))
      .orderBy(desc(examSessions.createdAt));
  }
  
  async updateExamSession(id: string, data: Partial<InsertExamSession>): Promise<ExamSession> {
    const [session] = await db
      .update(examSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(examSessions.id, id))
      .returning();
    return session;
  }
  
  async getUserActiveSession(userId: string): Promise<ExamSession | undefined> {
    const [session] = await db
      .select()
      .from(examSessions)
      .where(and(eq(examSessions.userId, userId), eq(examSessions.status, "in_progress")));
    return session;
  }
  
  // AI interaction operations
  async createAiInteraction(interactionData: InsertAiInteraction & { userId: string; response: string }): Promise<AiInteraction> {
    const [interaction] = await db
      .insert(aiInteractions)
      .values(interactionData)
      .returning();
    return interaction;
  }
  
  async getAiInteractionsByUser(userId: string): Promise<AiInteraction[]> {
    return await db
      .select()
      .from(aiInteractions)
      .where(eq(aiInteractions.userId, userId))
      .orderBy(desc(aiInteractions.createdAt))
      .limit(50);
  }
  
  // Payment operations
  async createPayment(paymentData: InsertPayment & { userId: string }): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(paymentData)
      .returning();
    return payment;
  }
  
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }
  
  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }
  
  async updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }
  
  // Notification operations
  async createNotification(notificationData: { userId: string; title: string; message: string; type: string; metadata?: any }): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...notificationData,
        type: notificationData.type as any
      })
      .returning();
    return notification;
  }
  
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }
  
  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }
  
  // Analytics operations
  async getUserStats(userId: string): Promise<{
    totalExams: number;
    averageScore: number;
    studyTime: number;
    recentSessions: ExamSession[];
  }> {
    const [totalExamsResult] = await db
      .select({ count: count() })
      .from(examSessions)
      .where(and(eq(examSessions.userId, userId), eq(examSessions.status, "completed")));
    
    const [avgScoreResult] = await db
      .select({ avg: avg(examSessions.percentage) })
      .from(examSessions)
      .where(and(eq(examSessions.userId, userId), eq(examSessions.status, "completed")));
    
    const recentSessions = await db
      .select()
      .from(examSessions)
      .where(eq(examSessions.userId, userId))
      .orderBy(desc(examSessions.createdAt))
      .limit(5);
    
    return {
      totalExams: totalExamsResult.count,
      averageScore: Number(avgScoreResult.avg) || 0,
      studyTime: 0, // Calculate from session durations
      recentSessions,
    };
  }
  
  async getInstitutionStats(institutionId: string): Promise<{
    totalStudents: number;
    totalExams: number;
    averageScore: number;
    recentActivity: any[];
  }> {
    const [studentsResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.institutionId, institutionId));
    
    const [examsResult] = await db
      .select({ count: count() })
      .from(exams)
      .where(eq(exams.institutionId, institutionId));
    
    return {
      totalStudents: studentsResult.count,
      totalExams: examsResult.count,
      averageScore: 0, // Calculate from exam sessions
      recentActivity: [],
    };
  }
  
  async getSystemStats(): Promise<{
    totalUsers: number;
    totalExams: number;
    totalQuestions: number;
    totalInstitutions: number;
    dailyActiveUsers: number;
  }> {
    const [usersResult] = await db.select({ count: count() }).from(users);
    const [examsResult] = await db.select({ count: count() }).from(exams);
    const [questionsResult] = await db.select({ count: count() }).from(questions);
    const [institutionsResult] = await db.select({ count: count() }).from(institutions);
    
    return {
      totalUsers: usersResult.count,
      totalExams: examsResult.count,
      totalQuestions: questionsResult.count,
      totalInstitutions: institutionsResult.count,
      dailyActiveUsers: 0, // Calculate from recent sessions
    };
  }
}

export const storage = new DatabaseStorage();
