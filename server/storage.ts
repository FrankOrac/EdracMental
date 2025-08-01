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
  learningPackages,
  userPackages,
  aiTutorSessions,
  learningHistory,
  aiWebResources,
  monthlyReviews,
  userSubjects,
  studyGroups,
  studyGroupMembers,
  userStudyPreferences,
  studySessions,
  studySessionParticipants,
  aiMatchmaking,
  institutionPackages,
  institutionSettings,
  studentPerformance,
  institutionStudentGroups,
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
  type LearningPackage,
  type InsertLearningPackage,
  type UserPackage,
  type InsertUserPackage,
  type AiTutorSession,
  type InsertAiTutorSession,
  type LearningHistory,
  type InsertLearningHistory,
  type AiWebResource,
  type MonthlyReview,
  type UserSubject,
  type InsertUserSubject,
  type StudyGroup,
  type StudyGroupMember,
  type UserStudyPreferences,
  type StudySession,
  type StudySessionParticipant,
  type AiMatchmaking,
  type InsertStudyGroup,
  type InsertUserStudyPreferences,
  type InsertStudySession,
  type InstitutionPackage,
  type InsertInstitutionPackage,
  type InstitutionSettings,
  type InsertInstitutionSettings,
  type StudentPerformance,
  type InsertStudentPerformance,
  type InstitutionStudentGroup,
  type InsertInstitutionStudentGroup,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count, avg, sum, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByInstitution(institutionId: string): Promise<User[]>;
  enableDisableUser(id: string, enabled: boolean, reason?: string, adminId?: string): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User>;
  
  // Institution admin operations
  getAllInstitutions(): Promise<Institution[]>;
  enableDisableInstitution(id: string, enabled: boolean, reason?: string, adminId?: string): Promise<Institution>;
  
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
  
  // Learning Package operations
  createLearningPackage(packageData: InsertLearningPackage & { createdBy: string }): Promise<LearningPackage>;
  getLearningPackage(id: string): Promise<LearningPackage | undefined>;
  getLearningPackagesByCategory(category: string): Promise<LearningPackage[]>;
  getAllLearningPackages(): Promise<LearningPackage[]>;
  updateLearningPackage(id: string, data: Partial<InsertLearningPackage>): Promise<LearningPackage>;
  deleteLearningPackage(id: string): Promise<void>;
  
  // User Package operations
  createUserPackage(packageData: InsertUserPackage & { userId: string }): Promise<UserPackage>;
  getUserPackages(userId: string): Promise<UserPackage[]>;
  getUserActivePackages(userId: string): Promise<UserPackage[]>;
  updateUserPackage(id: string, data: Partial<InsertUserPackage>): Promise<UserPackage>;
  
  // AI Tutor Session operations
  createAiTutorSession(sessionData: InsertAiTutorSession & { userId: string }): Promise<AiTutorSession>;
  getAiTutorSession(id: string): Promise<AiTutorSession | undefined>;
  getAiTutorSessionsByUser(userId: string): Promise<AiTutorSession[]>;
  updateAiTutorSession(id: string, data: Partial<InsertAiTutorSession>): Promise<AiTutorSession>;
  deleteAiTutorSession(id: string): Promise<void>;
  
  // Learning History operations
  createLearningHistory(historyData: InsertLearningHistory & { userId: string }): Promise<LearningHistory>;
  getLearningHistoryByUser(userId: string): Promise<LearningHistory[]>;
  getLearningHistoryBySubject(userId: string, subjectId: number): Promise<LearningHistory[]>;
  
  // AI Web Resource operations
  createAiWebResource(resourceData: Omit<AiWebResource, 'id' | 'createdAt' | 'updatedAt'>): Promise<AiWebResource>;
  getAiWebResourcesByQuery(query: string): Promise<AiWebResource[]>;
  getAiWebResourcesBySubject(subjectId: number): Promise<AiWebResource[]>;
  
  // Monthly Review operations
  createMonthlyReview(reviewData: Omit<MonthlyReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonthlyReview>;
  getMonthlyReviewsByUser(userId: string): Promise<MonthlyReview[]>;
  getMonthlyReview(userId: string, month: number, year: number): Promise<MonthlyReview | undefined>;
  
  // User Subject operations
  createUserSubject(subjectData: InsertUserSubject & { userId: string }): Promise<UserSubject>;
  getUserSubjects(userId: string): Promise<UserSubject[]>;
  updateUserSubject(id: number, data: Partial<InsertUserSubject>): Promise<UserSubject>;
  deleteUserSubject(id: number): Promise<void>;
  
  // Study group operations
  createStudyGroup(studyGroup: InsertStudyGroup & { createdBy: string }): Promise<StudyGroup>;
  getStudyGroup(id: string): Promise<StudyGroup | undefined>;
  getStudyGroups(filters?: { subjects?: string[]; difficulty?: string; status?: string }): Promise<StudyGroup[]>;
  getUserStudyGroups(userId: string): Promise<StudyGroup[]>;
  updateStudyGroup(id: string, data: Partial<InsertStudyGroup>): Promise<StudyGroup>;
  deleteStudyGroup(id: string): Promise<void>;
  joinStudyGroup(groupId: string, userId: string): Promise<StudyGroupMember>;
  leaveStudyGroup(groupId: string, userId: string): Promise<void>;
  getStudyGroupMembers(groupId: string): Promise<StudyGroupMember[]>;
  updateMemberRole(groupId: string, userId: string, role: string): Promise<StudyGroupMember>;
  
  // User study preferences
  createUserStudyPreferences(preferences: InsertUserStudyPreferences & { userId: string }): Promise<UserStudyPreferences>;
  getUserStudyPreferences(userId: string): Promise<UserStudyPreferences | undefined>;
  updateUserStudyPreferences(userId: string, preferences: Partial<InsertUserStudyPreferences>): Promise<UserStudyPreferences>;
  
  // Study sessions
  createStudySession(session: InsertStudySession & { hostId: string }): Promise<StudySession>;
  getStudySession(id: string): Promise<StudySession | undefined>;
  getStudySessionsByGroup(groupId: string): Promise<StudySession[]>;
  getUpcomingStudySessions(userId: string): Promise<StudySession[]>;
  updateStudySession(id: string, data: Partial<InsertStudySession>): Promise<StudySession>;
  deleteStudySession(id: string): Promise<void>;
  joinStudySession(sessionId: string, userId: string): Promise<StudySessionParticipant>;
  leaveStudySession(sessionId: string, userId: string): Promise<void>;
  getStudySessionParticipants(sessionId: string): Promise<StudySessionParticipant[]>;
  
  // AI matchmaking
  createMatchmaking(userId: string, criteria: any): Promise<AiMatchmaking>;
  getMatchmakingSuggestions(userId: string): Promise<StudyGroup[]>;
  updateMatchmaking(userId: string, criteria: any): Promise<AiMatchmaking>;
  
  // Institution package operations
  createInstitutionPackage(packageData: InsertInstitutionPackage & { institutionId: string }): Promise<InstitutionPackage>;
  getInstitutionPackage(id: string): Promise<InstitutionPackage | undefined>;
  getInstitutionPackagesByInstitution(institutionId: string): Promise<InstitutionPackage[]>;
  updateInstitutionPackage(id: string, data: Partial<InsertInstitutionPackage>): Promise<InstitutionPackage>;
  deleteInstitutionPackage(id: string): Promise<void>;
  
  // Institution settings operations
  createInstitutionSettings(settingsData: InsertInstitutionSettings & { institutionId: string }): Promise<InstitutionSettings>;
  getInstitutionSettings(institutionId: string): Promise<InstitutionSettings | undefined>;
  updateInstitutionSettings(institutionId: string, data: Partial<InsertInstitutionSettings>): Promise<InstitutionSettings>;
  
  // Student performance operations
  createStudentPerformance(performanceData: InsertStudentPerformance & { userId: string; institutionId: string }): Promise<StudentPerformance>;
  getStudentPerformance(userId: string, institutionId: string, subjectId?: number): Promise<StudentPerformance[]>;
  getInstitutionStudentPerformance(institutionId: string): Promise<StudentPerformance[]>;
  updateStudentPerformance(id: number, data: Partial<InsertStudentPerformance>): Promise<StudentPerformance>;
  
  // Institution student group operations
  createInstitutionStudentGroup(groupData: InsertInstitutionStudentGroup & { institutionId: string }): Promise<InstitutionStudentGroup>;
  getInstitutionStudentGroup(id: string): Promise<InstitutionStudentGroup | undefined>;
  getInstitutionStudentGroups(institutionId: string): Promise<InstitutionStudentGroup[]>;
  updateInstitutionStudentGroup(id: string, data: Partial<InsertInstitutionStudentGroup>): Promise<InstitutionStudentGroup>;
  deleteInstitutionStudentGroup(id: string): Promise<void>;
  addStudentToGroup(groupId: string, studentId: string): Promise<InstitutionStudentGroup>;
  removeStudentFromGroup(groupId: string, studentId: string): Promise<InstitutionStudentGroup>;
  
  // Institution analytics
  getInstitutionAnalytics(institutionId: string): Promise<{
    totalStudents: number;
    activeStudents: number;
    totalExams: number;
    averageScore: number;
    totalStudyHours: number;
    subjectPerformance: Array<{
      subjectId: number;
      subjectName: string;
      averageScore: number;
      totalStudents: number;
    }>;
    recentActivity: Array<{
      studentName: string;
      action: string;
      timestamp: Date;
      details: any;
    }>;
  }>;

  // Admin-specific operations
  getAllUsers(): Promise<User[]>;
  getAllInstitutions(): Promise<Institution[]>;
  enableDisableUser(id: string, enabled: boolean, reason?: string, adminId?: string): Promise<User>;
  enableDisableInstitution(id: string, enabled: boolean, reason?: string, adminId?: string): Promise<Institution>;
  getAllLearningPackages(): Promise<LearningPackage[]>;
  createLearningPackage(packageData: InsertLearningPackage & { createdBy: string }): Promise<LearningPackage>;
  updateLearningPackage(id: string, data: Partial<InsertLearningPackage>): Promise<LearningPackage>;
  deleteLearningPackage(id: string): Promise<void>;
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersByInstitution(institutionId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.institutionId, institutionId))
      .orderBy(desc(users.createdAt));
  }

  async enableDisableUser(id: string, enabled: boolean, reason?: string, adminId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isEnabled: enabled,
        disabledReason: enabled ? null : reason,
        disabledBy: enabled ? null : adminId,
        disabledAt: enabled ? null : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
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
  
  async getAllInstitutions(): Promise<Institution[]> {
    return await db.select().from(institutions).orderBy(desc(institutions.createdAt));
  }

  async getInstitutionsByOwner(ownerId: string): Promise<Institution[]> {
    return await db.select().from(institutions).where(eq(institutions.ownerId, ownerId));
  }

  async enableDisableInstitution(id: string, enabled: boolean, reason?: string, adminId?: string): Promise<Institution> {
    const [institution] = await db
      .update(institutions)
      .set({
        isEnabled: enabled,
        disabledReason: enabled ? null : reason,
        disabledBy: enabled ? null : adminId,
        disabledAt: enabled ? null : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(institutions.id, id))
      .returning();
    return institution;
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

  async getUsersByInstitution(institutionId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.institutionId, institutionId));
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

  // Learning Package operations
  async createLearningPackage(packageData: InsertLearningPackage & { createdBy: string }): Promise<LearningPackage> {
    const [packageResult] = await db
      .insert(learningPackages)
      .values(packageData)
      .returning();
    return packageResult;
  }

  async getLearningPackage(id: string): Promise<LearningPackage | undefined> {
    const [packageResult] = await db
      .select()
      .from(learningPackages)
      .where(eq(learningPackages.id, id));
    return packageResult;
  }

  async getLearningPackagesByCategory(category: string): Promise<LearningPackage[]> {
    return await db
      .select()
      .from(learningPackages)
      .where(and(eq(learningPackages.category, category as any), eq(learningPackages.isActive, true)))
      .orderBy(desc(learningPackages.createdAt));
  }

  async getAllLearningPackages(): Promise<LearningPackage[]> {
    return await db
      .select()
      .from(learningPackages)
      .where(eq(learningPackages.isActive, true))
      .orderBy(desc(learningPackages.createdAt));
  }

  async updateLearningPackage(id: string, data: Partial<InsertLearningPackage>): Promise<LearningPackage> {
    const [packageResult] = await db
      .update(learningPackages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(learningPackages.id, id))
      .returning();
    return packageResult;
  }

  async deleteLearningPackage(id: string): Promise<void> {
    await db
      .update(learningPackages)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(learningPackages.id, id));
  }

  // User Package operations
  async createUserPackage(packageData: InsertUserPackage & { userId: string }): Promise<UserPackage> {
    const [userPackageResult] = await db
      .insert(userPackages)
      .values(packageData)
      .returning();
    return userPackageResult;
  }

  async getUserPackages(userId: string): Promise<UserPackage[]> {
    return await db
      .select()
      .from(userPackages)
      .where(eq(userPackages.userId, userId))
      .orderBy(desc(userPackages.createdAt));
  }

  async getUserActivePackages(userId: string): Promise<UserPackage[]> {
    return await db
      .select()
      .from(userPackages)
      .where(and(
        eq(userPackages.userId, userId),
        eq(userPackages.status, "active")
      ))
      .orderBy(desc(userPackages.createdAt));
  }

  async updateUserPackage(id: string, data: Partial<InsertUserPackage>): Promise<UserPackage> {
    const [userPackageResult] = await db
      .update(userPackages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userPackages.id, id))
      .returning();
    return userPackageResult;
  }

  // AI Tutor Session operations
  async createAiTutorSession(sessionData: InsertAiTutorSession & { userId: string }): Promise<AiTutorSession> {
    const [sessionResult] = await db
      .insert(aiTutorSessions)
      .values(sessionData)
      .returning();
    return sessionResult;
  }

  async getAiTutorSession(id: string): Promise<AiTutorSession | undefined> {
    const [sessionResult] = await db
      .select()
      .from(aiTutorSessions)
      .where(eq(aiTutorSessions.id, id));
    return sessionResult;
  }

  async getAiTutorSessionsByUser(userId: string): Promise<AiTutorSession[]> {
    return await db
      .select()
      .from(aiTutorSessions)
      .where(eq(aiTutorSessions.userId, userId))
      .orderBy(desc(aiTutorSessions.createdAt));
  }

  async updateAiTutorSession(id: string, data: Partial<InsertAiTutorSession>): Promise<AiTutorSession> {
    const [sessionResult] = await db
      .update(aiTutorSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiTutorSessions.id, id))
      .returning();
    return sessionResult;
  }

  async deleteAiTutorSession(id: string): Promise<void> {
    await db
      .delete(aiTutorSessions)
      .where(eq(aiTutorSessions.id, id));
  }

  // Learning History operations
  async createLearningHistory(historyData: InsertLearningHistory & { userId: string }): Promise<LearningHistory> {
    const [historyResult] = await db
      .insert(learningHistory)
      .values(historyData)
      .returning();
    return historyResult;
  }

  async getLearningHistoryByUser(userId: string): Promise<LearningHistory[]> {
    return await db
      .select()
      .from(learningHistory)
      .where(eq(learningHistory.userId, userId))
      .orderBy(desc(learningHistory.date));
  }

  async getLearningHistoryBySubject(userId: string, subjectId: number): Promise<LearningHistory[]> {
    return await db
      .select()
      .from(learningHistory)
      .where(and(
        eq(learningHistory.userId, userId),
        eq(learningHistory.subjectId, subjectId)
      ))
      .orderBy(desc(learningHistory.date));
  }

  // AI Web Resource operations
  async createAiWebResource(resourceData: Omit<AiWebResource, 'id' | 'createdAt' | 'updatedAt'>): Promise<AiWebResource> {
    const [resourceResult] = await db
      .insert(aiWebResources)
      .values(resourceData)
      .returning();
    return resourceResult;
  }

  async getAiWebResourcesByQuery(query: string): Promise<AiWebResource[]> {
    return await db
      .select()
      .from(aiWebResources)
      .where(eq(aiWebResources.query, query))
      .orderBy(desc(aiWebResources.relevanceScore));
  }

  async getAiWebResourcesBySubject(subjectId: number): Promise<AiWebResource[]> {
    return await db
      .select()
      .from(aiWebResources)
      .where(eq(aiWebResources.subjectId, subjectId))
      .orderBy(desc(aiWebResources.relevanceScore));
  }

  // Monthly Review operations
  async createMonthlyReview(reviewData: Omit<MonthlyReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonthlyReview> {
    const [reviewResult] = await db
      .insert(monthlyReviews)
      .values(reviewData)
      .returning();
    return reviewResult;
  }

  async getMonthlyReviewsByUser(userId: string): Promise<MonthlyReview[]> {
    return await db
      .select()
      .from(monthlyReviews)
      .where(and(
        eq(monthlyReviews.userId, userId),
        eq(monthlyReviews.isActive, true)
      ))
      .orderBy(desc(monthlyReviews.year), desc(monthlyReviews.month));
  }

  async getMonthlyReview(userId: string, month: number, year: number): Promise<MonthlyReview | undefined> {
    const [reviewResult] = await db
      .select()
      .from(monthlyReviews)
      .where(and(
        eq(monthlyReviews.userId, userId),
        eq(monthlyReviews.month, month),
        eq(monthlyReviews.year, year),
        eq(monthlyReviews.isActive, true)
      ));
    return reviewResult;
  }

  // User Subject operations
  async createUserSubject(subjectData: InsertUserSubject & { userId: string }): Promise<UserSubject> {
    const [subjectResult] = await db
      .insert(userSubjects)
      .values(subjectData)
      .returning();
    return subjectResult;
  }

  async getUserSubjects(userId: string): Promise<UserSubject[]> {
    return await db
      .select()
      .from(userSubjects)
      .where(and(
        eq(userSubjects.userId, userId),
        eq(userSubjects.isActive, true)
      ))
      .orderBy(desc(userSubjects.priority));
  }

  async updateUserSubject(id: number, data: Partial<InsertUserSubject>): Promise<UserSubject> {
    const [subjectResult] = await db
      .update(userSubjects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userSubjects.id, id))
      .returning();
    return subjectResult;
  }

  async deleteUserSubject(id: number): Promise<void> {
    await db
      .update(userSubjects)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(userSubjects.id, id));
  }

  // Study Group operations
  async createStudyGroup(groupData: InsertStudyGroup & { createdBy: string }): Promise<StudyGroup> {
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const [groupResult] = await db
      .insert(studyGroups)
      .values({ ...groupData, joinCode })
      .returning();
    
    // Add creator as admin member
    await db
      .insert(studyGroupMembers)
      .values({
        groupId: groupResult.id,
        userId: groupData.createdBy,
        role: 'admin',
        lastActive: new Date(),
      });
    
    return groupResult;
  }

  async getStudyGroup(id: string): Promise<StudyGroup | undefined> {
    const [groupResult] = await db
      .select()
      .from(studyGroups)
      .where(eq(studyGroups.id, id));
    return groupResult;
  }

  async getStudyGroups(filters?: { subjects?: string[]; difficulty?: string; status?: string }): Promise<StudyGroup[]> {
    let query = db.select().from(studyGroups);
    
    if (filters?.status) {
      query = query.where(eq(studyGroups.status, filters.status));
    }
    
    return await query.orderBy(desc(studyGroups.createdAt));
  }

  async getUserStudyGroups(userId: string): Promise<StudyGroup[]> {
    return await db
      .select({
        id: studyGroups.id,
        name: studyGroups.name,
        description: studyGroups.description,
        createdBy: studyGroups.createdBy,
        subjects: studyGroups.subjects,
        difficulty: studyGroups.difficulty,
        maxMembers: studyGroups.maxMembers,
        currentMembers: studyGroups.currentMembers,
        isPrivate: studyGroups.isPrivate,
        joinCode: studyGroups.joinCode,
        status: studyGroups.status,
        meetingSchedule: studyGroups.meetingSchedule,
        studyGoals: studyGroups.studyGoals,
        tags: studyGroups.tags,
        createdAt: studyGroups.createdAt,
        updatedAt: studyGroups.updatedAt,
      })
      .from(studyGroups)
      .innerJoin(studyGroupMembers, eq(studyGroups.id, studyGroupMembers.groupId))
      .where(eq(studyGroupMembers.userId, userId))
      .orderBy(desc(studyGroups.createdAt));
  }

  async updateStudyGroup(id: string, data: Partial<InsertStudyGroup>): Promise<StudyGroup> {
    const [groupResult] = await db
      .update(studyGroups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(studyGroups.id, id))
      .returning();
    return groupResult;
  }

  async deleteStudyGroup(id: string): Promise<void> {
    await db
      .update(studyGroups)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(studyGroups.id, id));
  }

  async joinStudyGroup(groupId: string, userId: string): Promise<StudyGroupMember> {
    // Update current members count
    await db
      .update(studyGroups)
      .set({ 
        currentMembers: sql`${studyGroups.currentMembers} + 1`,
        updatedAt: new Date()
      })
      .where(eq(studyGroups.id, groupId));

    const [memberResult] = await db
      .insert(studyGroupMembers)
      .values({
        groupId,
        userId,
        role: 'member',
        lastActive: new Date(),
      })
      .returning();
    return memberResult;
  }

  async leaveStudyGroup(groupId: string, userId: string): Promise<void> {
    await db
      .delete(studyGroupMembers)
      .where(and(
        eq(studyGroupMembers.groupId, groupId),
        eq(studyGroupMembers.userId, userId)
      ));

    // Update current members count
    await db
      .update(studyGroups)
      .set({ 
        currentMembers: sql`${studyGroups.currentMembers} - 1`,
        updatedAt: new Date()
      })
      .where(eq(studyGroups.id, groupId));
  }

  async getStudyGroupMembers(groupId: string): Promise<StudyGroupMember[]> {
    return await db
      .select()
      .from(studyGroupMembers)
      .where(eq(studyGroupMembers.groupId, groupId))
      .orderBy(desc(studyGroupMembers.joinedAt));
  }

  async updateMemberRole(groupId: string, userId: string, role: string): Promise<StudyGroupMember> {
    const [memberResult] = await db
      .update(studyGroupMembers)
      .set({ role })
      .where(and(
        eq(studyGroupMembers.groupId, groupId),
        eq(studyGroupMembers.userId, userId)
      ))
      .returning();
    return memberResult;
  }

  // User Study Preferences operations
  async createUserStudyPreferences(preferencesData: InsertUserStudyPreferences & { userId: string }): Promise<UserStudyPreferences> {
    const [preferencesResult] = await db
      .insert(userStudyPreferences)
      .values(preferencesData)
      .returning();
    return preferencesResult;
  }

  async getUserStudyPreferences(userId: string): Promise<UserStudyPreferences | undefined> {
    const [preferencesResult] = await db
      .select()
      .from(userStudyPreferences)
      .where(eq(userStudyPreferences.userId, userId));
    return preferencesResult;
  }

  async updateUserStudyPreferences(userId: string, preferences: Partial<InsertUserStudyPreferences>): Promise<UserStudyPreferences> {
    const [preferencesResult] = await db
      .update(userStudyPreferences)
      .set({ ...preferences, updatedAt: new Date() })
      .where(eq(userStudyPreferences.userId, userId))
      .returning();
    return preferencesResult;
  }

  // Study Session operations
  async createStudySession(sessionData: InsertStudySession & { hostId: string }): Promise<StudySession> {
    const [sessionResult] = await db
      .insert(studySessions)
      .values(sessionData)
      .returning();
    
    // Add host as first participant
    await db
      .insert(studySessionParticipants)
      .values({
        sessionId: sessionResult.id,
        userId: sessionData.hostId,
        status: 'registered',
      });
    
    return sessionResult;
  }

  async getStudySession(id: string): Promise<StudySession | undefined> {
    const [sessionResult] = await db
      .select()
      .from(studySessions)
      .where(eq(studySessions.id, id));
    return sessionResult;
  }

  async getStudySessionsByGroup(groupId: string): Promise<StudySession[]> {
    return await db
      .select()
      .from(studySessions)
      .where(eq(studySessions.groupId, groupId))
      .orderBy(desc(studySessions.scheduledFor));
  }

  async getUpcomingStudySessions(userId: string): Promise<StudySession[]> {
    const now = new Date();
    return await db
      .select({
        id: studySessions.id,
        groupId: studySessions.groupId,
        title: studySessions.title,
        description: studySessions.description,
        scheduledFor: studySessions.scheduledFor,
        duration: studySessions.duration,
        sessionType: studySessions.sessionType,
        subjects: studySessions.subjects,
        materials: studySessions.materials,
        hostId: studySessions.hostId,
        maxParticipants: studySessions.maxParticipants,
        currentParticipants: studySessions.currentParticipants,
        status: studySessions.status,
        recordingEnabled: studySessions.recordingEnabled,
        notesEnabled: studySessions.notesEnabled,
        createdAt: studySessions.createdAt,
        updatedAt: studySessions.updatedAt,
      })
      .from(studySessions)
      .innerJoin(studySessionParticipants, eq(studySessions.id, studySessionParticipants.sessionId))
      .where(and(
        eq(studySessionParticipants.userId, userId),
        sql`${studySessions.scheduledFor} > ${now}`,
        eq(studySessions.status, 'scheduled')
      ))
      .orderBy(studySessions.scheduledFor);
  }

  async updateStudySession(id: string, data: Partial<InsertStudySession>): Promise<StudySession> {
    const [sessionResult] = await db
      .update(studySessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(studySessions.id, id))
      .returning();
    return sessionResult;
  }

  async deleteStudySession(id: string): Promise<void> {
    await db
      .update(studySessions)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(studySessions.id, id));
  }

  async joinStudySession(sessionId: string, userId: string): Promise<StudySessionParticipant> {
    // Update current participants count
    await db
      .update(studySessions)
      .set({ 
        currentParticipants: sql`${studySessions.currentParticipants} + 1`,
        updatedAt: new Date()
      })
      .where(eq(studySessions.id, sessionId));

    const [participantResult] = await db
      .insert(studySessionParticipants)
      .values({
        sessionId,
        userId,
        status: 'registered',
      })
      .returning();
    return participantResult;
  }

  async leaveStudySession(sessionId: string, userId: string): Promise<void> {
    await db
      .update(studySessionParticipants)
      .set({ status: 'left_early', leftAt: new Date() })
      .where(and(
        eq(studySessionParticipants.sessionId, sessionId),
        eq(studySessionParticipants.userId, userId)
      ));

    // Update current participants count
    await db
      .update(studySessions)
      .set({ 
        currentParticipants: sql`${studySessions.currentParticipants} - 1`,
        updatedAt: new Date()
      })
      .where(eq(studySessions.id, sessionId));
  }

  async getStudySessionParticipants(sessionId: string): Promise<StudySessionParticipant[]> {
    return await db
      .select()
      .from(studySessionParticipants)
      .where(eq(studySessionParticipants.sessionId, sessionId))
      .orderBy(desc(studySessionParticipants.joinedAt));
  }

  // AI Matchmaking operations
  async createMatchmaking(userId: string, criteria: any): Promise<AiMatchmaking> {
    const [matchmakingResult] = await db
      .insert(aiMatchmaking)
      .values({
        userId,
        matchingCriteria: JSON.stringify(criteria),
        isActive: true,
      })
      .returning();
    return matchmakingResult;
  }

  async getMatchmakingSuggestions(userId: string): Promise<StudyGroup[]> {
    // Get user preferences first
    const userPrefs = await this.getUserStudyPreferences(userId);
    if (!userPrefs) return [];

    // Find groups that match user preferences
    return await db
      .select()
      .from(studyGroups)
      .where(and(
        eq(studyGroups.status, 'active'),
        sql`${studyGroups.currentMembers} < ${studyGroups.maxMembers}`
      ))
      .limit(10)
      .orderBy(desc(studyGroups.createdAt));
  }

  async updateMatchmaking(userId: string, criteria: any): Promise<AiMatchmaking> {
    const [matchmakingResult] = await db
      .update(aiMatchmaking)
      .set({
        matchingCriteria: JSON.stringify(criteria),
        lastUpdated: new Date(),
      })
      .where(eq(aiMatchmaking.userId, userId))
      .returning();
    return matchmakingResult;
  }
  // Institution Package operations
  async createInstitutionPackage(packageData: InsertInstitutionPackage & { institutionId: string }): Promise<InstitutionPackage> {
    const id = `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [packageResult] = await db
      .insert(institutionPackages)
      .values({ ...packageData, id })
      .returning();
    return packageResult;
  }

  async getInstitutionPackage(id: string): Promise<InstitutionPackage | undefined> {
    const [packageResult] = await db
      .select()
      .from(institutionPackages)
      .where(eq(institutionPackages.id, id));
    return packageResult;
  }

  async getInstitutionPackagesByInstitution(institutionId: string): Promise<InstitutionPackage[]> {
    return await db
      .select()
      .from(institutionPackages)
      .where(eq(institutionPackages.institutionId, institutionId))
      .orderBy(desc(institutionPackages.createdAt));
  }

  async updateInstitutionPackage(id: string, data: Partial<InsertInstitutionPackage>): Promise<InstitutionPackage> {
    const [packageResult] = await db
      .update(institutionPackages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(institutionPackages.id, id))
      .returning();
    return packageResult;
  }

  async deleteInstitutionPackage(id: string): Promise<void> {
    await db
      .delete(institutionPackages)
      .where(eq(institutionPackages.id, id));
  }

  // Institution Settings operations
  async createInstitutionSettings(settingsData: InsertInstitutionSettings & { institutionId: string }): Promise<InstitutionSettings> {
    const [settingsResult] = await db
      .insert(institutionSettings)
      .values(settingsData)
      .returning();
    return settingsResult;
  }

  async getInstitutionSettings(institutionId: string): Promise<InstitutionSettings | undefined> {
    const [settingsResult] = await db
      .select()
      .from(institutionSettings)
      .where(eq(institutionSettings.institutionId, institutionId));
    return settingsResult;
  }

  async updateInstitutionSettings(institutionId: string, data: Partial<InsertInstitutionSettings>): Promise<InstitutionSettings> {
    const [settingsResult] = await db
      .update(institutionSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(institutionSettings.institutionId, institutionId))
      .returning();
    return settingsResult;
  }

  // Student Performance operations
  async createStudentPerformance(performanceData: InsertStudentPerformance & { userId: string; institutionId: string }): Promise<StudentPerformance> {
    const [performanceResult] = await db
      .insert(studentPerformance)
      .values(performanceData)
      .returning();
    return performanceResult;
  }

  async getStudentPerformance(userId: string, institutionId: string, subjectId?: number): Promise<StudentPerformance[]> {
    let query = db
      .select()
      .from(studentPerformance)
      .where(and(
        eq(studentPerformance.userId, userId),
        eq(studentPerformance.institutionId, institutionId)
      ));
    
    if (subjectId) {
      query = query.where(eq(studentPerformance.subjectId, subjectId));
    }
    
    return await query.orderBy(desc(studentPerformance.updatedAt));
  }

  async getInstitutionStudentPerformance(institutionId: string): Promise<StudentPerformance[]> {
    return await db
      .select()
      .from(studentPerformance)
      .where(eq(studentPerformance.institutionId, institutionId))
      .orderBy(desc(studentPerformance.averageScore));
  }

  async updateStudentPerformance(id: number, data: Partial<InsertStudentPerformance>): Promise<StudentPerformance> {
    const [performanceResult] = await db
      .update(studentPerformance)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(studentPerformance.id, id))
      .returning();
    return performanceResult;
  }

  // Institution Student Group operations
  async createInstitutionStudentGroup(groupData: InsertInstitutionStudentGroup & { institutionId: string }): Promise<InstitutionStudentGroup> {
    const id = `grp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [groupResult] = await db
      .insert(institutionStudentGroups)
      .values({ ...groupData, id })
      .returning();
    return groupResult;
  }

  async getInstitutionStudentGroup(id: string): Promise<InstitutionStudentGroup | undefined> {
    const [groupResult] = await db
      .select()
      .from(institutionStudentGroups)
      .where(eq(institutionStudentGroups.id, id));
    return groupResult;
  }

  async getInstitutionStudentGroups(institutionId: string): Promise<InstitutionStudentGroup[]> {
    return await db
      .select()
      .from(institutionStudentGroups)
      .where(eq(institutionStudentGroups.institutionId, institutionId))
      .orderBy(desc(institutionStudentGroups.createdAt));
  }

  async updateInstitutionStudentGroup(id: string, data: Partial<InsertInstitutionStudentGroup>): Promise<InstitutionStudentGroup> {
    const [groupResult] = await db
      .update(institutionStudentGroups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(institutionStudentGroups.id, id))
      .returning();
    return groupResult;
  }

  async deleteInstitutionStudentGroup(id: string): Promise<void> {
    await db
      .update(institutionStudentGroups)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(institutionStudentGroups.id, id));
  }

  async addStudentToGroup(groupId: string, studentId: string): Promise<InstitutionStudentGroup> {
    const group = await this.getInstitutionStudentGroup(groupId);
    if (!group) throw new Error('Group not found');
    
    const currentStudentIds = group.studentIds as string[] || [];
    if (!currentStudentIds.includes(studentId)) {
      currentStudentIds.push(studentId);
      return await this.updateInstitutionStudentGroup(groupId, { studentIds: currentStudentIds });
    }
    return group;
  }

  async removeStudentFromGroup(groupId: string, studentId: string): Promise<InstitutionStudentGroup> {
    const group = await this.getInstitutionStudentGroup(groupId);
    if (!group) throw new Error('Group not found');
    
    const currentStudentIds = group.studentIds as string[] || [];
    const updatedStudentIds = currentStudentIds.filter(id => id !== studentId);
    return await this.updateInstitutionStudentGroup(groupId, { studentIds: updatedStudentIds });
  }

  // Institution Analytics
  async getInstitutionAnalytics(institutionId: string): Promise<{
    totalStudents: number;
    activeStudents: number;
    totalExams: number;
    averageScore: number;
    totalStudyHours: number;
    subjectPerformance: Array<{
      subjectId: number;
      subjectName: string;
      averageScore: number;
      totalStudents: number;
    }>;
    recentActivity: Array<{
      studentName: string;
      action: string;
      timestamp: Date;
      details: any;
    }>;
  }> {
    // Get total students
    const totalStudentsResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.institutionId, institutionId));
    
    // Get active students (who have exam sessions in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeStudentsResult = await db
      .select({ count: count() })
      .from(users)
      .innerJoin(examSessions, eq(users.id, examSessions.userId))
      .where(and(
        eq(users.institutionId, institutionId),
        sql`${examSessions.createdAt} >= ${thirtyDaysAgo}`
      ));
    
    // Get total exams for institution
    const totalExamsResult = await db
      .select({ count: count() })
      .from(exams)
      .where(eq(exams.institutionId, institutionId));
    
    // Get average score
    const averageScoreResult = await db
      .select({ avgScore: avg(examSessions.percentage) })
      .from(examSessions)
      .innerJoin(users, eq(examSessions.userId, users.id))
      .where(eq(users.institutionId, institutionId));
    
    // Get total study hours from learning history
    const studyHoursResult = await db
      .select({ totalMinutes: sum(learningHistory.timeSpent) })
      .from(learningHistory)
      .innerJoin(users, eq(learningHistory.userId, users.id))
      .where(eq(users.institutionId, institutionId));
    
    // Get subject performance
    const subjectPerformanceResult = await db
      .select({
        subjectId: studentPerformance.subjectId,
        subjectName: subjects.name,
        averageScore: avg(studentPerformance.averageScore),
        totalStudents: count(),
      })
      .from(studentPerformance)
      .innerJoin(subjects, eq(studentPerformance.subjectId, subjects.id))
      .where(eq(studentPerformance.institutionId, institutionId))
      .groupBy(studentPerformance.subjectId, subjects.name);
    
    // Get recent activity (last 10 exam sessions)
    const recentActivityResult = await db
      .select({
        studentName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        action: sql`'completed_exam'`,
        timestamp: examSessions.createdAt,
        details: sql`JSON_BUILD_OBJECT('examId', ${examSessions.examId}, 'score', ${examSessions.percentage})`,
      })
      .from(examSessions)
      .innerJoin(users, eq(examSessions.userId, users.id))
      .where(eq(users.institutionId, institutionId))
      .orderBy(desc(examSessions.createdAt))
      .limit(10);
    
    return {
      totalStudents: totalStudentsResult[0]?.count || 0,
      activeStudents: activeStudentsResult[0]?.count || 0,
      totalExams: totalExamsResult[0]?.count || 0,
      averageScore: Number(averageScoreResult[0]?.avgScore || 0),
      totalStudyHours: Math.round((Number(studyHoursResult[0]?.totalMinutes || 0)) / 60),
      subjectPerformance: subjectPerformanceResult.map(sp => ({
        subjectId: sp.subjectId,
        subjectName: sp.subjectName,
        averageScore: Number(sp.averageScore || 0),
        totalStudents: sp.totalStudents,
      })),
      recentActivity: recentActivityResult.map(ra => ({
        studentName: ra.studentName as string,
        action: ra.action as string,
        timestamp: ra.timestamp,
        details: ra.details,
      })),
    };
  }

  // Admin learning package methods
  async getAllLearningPackages(): Promise<LearningPackage[]> {
    return await db.select().from(learningPackages).orderBy(desc(learningPackages.createdAt));
  }

  async createLearningPackage(packageData: InsertLearningPackage & { createdBy: string }): Promise<LearningPackage> {
    const [learningPackage] = await db
      .insert(learningPackages)
      .values({ ...packageData })
      .returning();
    return learningPackage;
  }

  async updateLearningPackage(id: string, data: Partial<InsertLearningPackage>): Promise<LearningPackage> {
    const [learningPackage] = await db
      .update(learningPackages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(learningPackages.id, id))
      .returning();
    return learningPackage;
  }

  async deleteLearningPackage(id: string): Promise<void> {
    await db.update(learningPackages).set({ isActive: false }).where(eq(learningPackages.id, id));
  }

  // Admin user management methods  
  async enableDisableUser(id: string, enabled: boolean, reason?: string, adminId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        isActive: enabled,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async enableDisableInstitution(id: string, enabled: boolean, reason?: string, adminId?: string): Promise<Institution> {
    const [institution] = await db
      .update(institutions)
      .set({ 
        isActive: enabled,
        updatedAt: new Date()
      })
      .where(eq(institutions.id, id))
      .returning();
    return institution;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllInstitutions(): Promise<Institution[]> {
    return await db.select().from(institutions).orderBy(desc(institutions.createdAt));
  }
}

export const storage = new DatabaseStorage();
