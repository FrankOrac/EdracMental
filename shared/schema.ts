import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  uuid,
  primaryKey
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["student", "institution", "admin"] }).notNull().default("student"),
  subscriptionPlan: varchar("subscription_plan", { enum: ["free", "premium", "institution"] }).notNull().default("free"),
  subscriptionExpiry: timestamp("subscription_expiry"),
  institutionId: varchar("institution_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const institutions = pgTable("institutions", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  type: varchar("type", { enum: ["school", "training_center", "corporate"] }).notNull(),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  address: text("address"),
  subscriptionPlan: varchar("subscription_plan", { enum: ["basic", "premium", "enterprise"] }).notNull().default("basic"),
  subscriptionExpiry: timestamp("subscription_expiry"),
  ownerId: varchar("owner_id").notNull(),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  code: varchar("code").unique().notNull(),
  category: varchar("category", { enum: ["jamb", "waec", "neco", "gce", "custom"] }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  subjectId: integer("subject_id").notNull(),
  description: text("description"),
  difficulty: varchar("difficulty", { enum: ["easy", "medium", "hard"] }).notNull().default("medium"),
  classLevel: varchar("class_level"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: varchar("type", { enum: ["multiple_choice", "essay", "true_false"] }).notNull().default("multiple_choice"),
  options: jsonb("options"), // For multiple choice questions
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: varchar("difficulty", { enum: ["easy", "medium", "hard"] }).notNull().default("medium"),
  topicId: integer("topic_id"), // Make optional
  subjectId: integer("subject_id").notNull(),
  examType: varchar("exam_type", { enum: ["jamb", "waec", "neco", "gce", "custom"] }).notNull(),
  points: integer("points").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const exams = pgTable("exams", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type", { enum: ["practice", "mock", "official", "custom"] }).notNull(),
  examCategory: varchar("exam_category", { enum: ["jamb", "waec", "neco", "gce", "custom"] }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  totalQuestions: integer("total_questions").notNull(),
  passingScore: integer("passing_score"),
  subjects: jsonb("subjects"), // Array of subject IDs
  difficulty: varchar("difficulty", { enum: ["easy", "medium", "hard", "mixed"] }).notNull().default("mixed"),
  instructions: text("instructions"),
  isPublic: boolean("is_public").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull(),
  institutionId: varchar("institution_id"),
  settings: jsonb("settings"), // Anti-cheating, randomization, etc.
  scheduledStart: timestamp("scheduled_start"),
  scheduledEnd: timestamp("scheduled_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const examSessions = pgTable("exam_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  examId: varchar("exam_id").notNull(),
  userId: varchar("user_id").notNull(),
  status: varchar("status", { enum: ["not_started", "in_progress", "completed", "abandoned"] }).notNull().default("not_started"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  remainingTime: integer("remaining_time"), // in seconds
  currentQuestionIndex: integer("current_question_index").notNull().default(0),
  answers: jsonb("answers"), // { questionId: answer }
  score: decimal("score", { precision: 5, scale: 2 }),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  flaggedQuestions: jsonb("flagged_questions"), // Array of question IDs
  antiCheatData: jsonb("anti_cheat_data"), // Tab switches, focus loss, etc.
  feedback: text("feedback"),
  isGraded: boolean("is_graded").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiInteractions = pgTable("ai_interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { enum: ["question_explanation", "tutor_chat", "topic_help"] }).notNull(),
  question: text("question").notNull(),
  response: text("response").notNull(),
  questionId: integer("question_id"),
  topicId: integer("topic_id"),
  rating: integer("rating"), // 1-5 stars
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("NGN"),
  planType: varchar("plan_type", { enum: ["premium", "institution"] }).notNull(),
  duration: integer("duration").notNull(), // in months
  paymentMethod: varchar("payment_method", { enum: ["paystack", "flutterwave", "stripe", "bank_transfer"] }).notNull(),
  transactionId: varchar("transaction_id").unique().notNull(),
  paymentReference: varchar("payment_reference").unique().notNull(),
  status: varchar("status", { enum: ["pending", "successful", "failed", "refunded"] }).notNull().default("pending"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { enum: ["exam", "payment", "achievement", "system"] }).notNull(),
  isRead: boolean("is_read").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning packages for bundled study materials
export const learningPackages = pgTable("learning_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category", { enum: ["jamb", "waec", "neco", "gce", "custom"] }).notNull(),
  subjectIds: jsonb("subject_ids").notNull(), // Array of subject IDs
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("NGN"),
  duration: integer("duration").notNull(), // access duration in days
  content: jsonb("content"), // Questions, materials, videos, etc.
  difficulty: varchar("difficulty", { enum: ["beginner", "intermediate", "advanced", "mixed"] }).notNull().default("mixed"),
  prerequisites: jsonb("prerequisites"), // Array of required knowledge
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User package purchases
export const userPackages = pgTable("user_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  packageId: varchar("package_id").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  expiryDate: timestamp("expiry_date").notNull(),
  paymentReference: varchar("payment_reference").notNull(),
  progress: decimal("progress", { precision: 5, scale: 2 }).notNull().default("0.00"), // 0-100%
  status: varchar("status", { enum: ["active", "expired", "refunded"] }).notNull().default("active"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Tutor sessions and learning history
export const aiTutorSessions = pgTable("ai_tutor_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  sessionName: varchar("session_name").notNull(),
  subjectId: integer("subject_id"),
  topicId: integer("topic_id"),
  sessionType: varchar("session_type", { enum: ["explanation", "lesson", "practice", "qa"] }).notNull(),
  difficulty: varchar("difficulty", { enum: ["beginner", "intermediate", "advanced"] }).notNull().default("beginner"),
  messages: jsonb("messages").notNull(), // Array of conversation messages
  learningPath: jsonb("learning_path"), // Structured learning progression
  completionStatus: varchar("completion_status", { enum: ["in_progress", "completed", "abandoned"] }).notNull().default("in_progress"),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  rating: integer("rating"), // 1-5 stars
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning history and progress tracking
export const learningHistory = pgTable("learning_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  topicId: integer("topic_id"),
  activityType: varchar("activity_type", { enum: ["study", "practice", "exam", "tutor_session"] }).notNull(),
  timeSpent: integer("time_spent").notNull(), // in minutes
  score: decimal("score", { precision: 5, scale: 2 }),
  correctAnswers: integer("correct_answers"),
  totalQuestions: integer("total_questions"),
  date: timestamp("date").defaultNow(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Web resources cached by AI
export const aiWebResources = pgTable("ai_web_resources", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  subjectId: integer("subject_id"),
  topicId: integer("topic_id"),
  title: varchar("title").notNull(),
  url: varchar("url").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  relevanceScore: decimal("relevance_score", { precision: 3, scale: 2 }),
  isVerified: boolean("is_verified").notNull().default(false),
  addedBy: varchar("added_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Monthly review data for active users
export const monthlyReviews = pgTable("monthly_reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  totalStudyTime: integer("total_study_time"), // in minutes
  examsCompleted: integer("exams_completed").notNull().default(0),
  averageScore: decimal("average_score", { precision: 5, scale: 2 }),
  subjectsStudied: jsonb("subjects_studied"), // Array of subject IDs
  topicsCompleted: jsonb("topics_completed"), // Array of topic IDs
  achievements: jsonb("achievements"), // Array of achievement IDs
  strengths: jsonb("strengths"), // Array of strong subjects/topics
  weaknesses: jsonb("weaknesses"), // Array of weak subjects/topics
  recommendations: jsonb("recommendations"), // AI-generated study recommendations
  isActive: boolean("is_active").notNull().default(true), // Only for active users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Institution packages for bulk student access
export const institutionPackages = pgTable("institution_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: varchar("institution_id").notNull(),
  packageType: varchar("package_type", { enum: ["basic", "premium", "enterprise", "custom"] }).notNull(),
  studentCapacity: integer("student_capacity").notNull(), // Number of students covered
  duration: integer("duration").notNull(), // Package duration in months
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("NGN"),
  features: jsonb("features").notNull(), // Array of included features
  subjectAccess: jsonb("subject_access"), // Array of subject IDs (null = all subjects)
  examAccess: jsonb("exam_access"), // Array of exam types (null = all exams)
  status: varchar("status", { enum: ["active", "expired", "suspended", "pending"] }).notNull().default("pending"),
  purchaseDate: timestamp("purchase_date"),
  expiryDate: timestamp("expiry_date"),
  paymentMethod: varchar("payment_method", { enum: ["paystack", "bank_transfer", "offline"] }).notNull(),
  paymentReference: varchar("payment_reference"),
  invoiceNumber: varchar("invoice_number"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Institution content customization settings
export const institutionSettings = pgTable("institution_settings", {
  id: serial("id").primaryKey(),
  institutionId: varchar("institution_id").notNull().unique(),
  disableDefaultContent: boolean("disable_default_content").notNull().default(false),
  disabledSubjects: jsonb("disabled_subjects"), // Array of subject IDs to disable
  disabledExams: jsonb("disabled_exams"), // Array of exam IDs to disable
  disabledQuestions: jsonb("disabled_questions"), // Array of question IDs to disable
  customBranding: jsonb("custom_branding"), // Logo, colors, name
  examSettings: jsonb("exam_settings"), // Default exam configuration
  studentSettings: jsonb("student_settings"), // Student access controls
  reportingSettings: jsonb("reporting_settings"), // Analytics and reporting preferences
  notificationSettings: jsonb("notification_settings"), // Email and notification preferences
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student performance analytics for institutions
export const studentPerformance = pgTable("student_performance", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  institutionId: varchar("institution_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  totalExams: integer("total_exams").notNull().default(0),
  totalScore: decimal("total_score", { precision: 8, scale: 2 }).notNull().default("0.00"),
  averageScore: decimal("average_score", { precision: 5, scale: 2 }).notNull().default("0.00"),
  highestScore: decimal("highest_score", { precision: 5, scale: 2 }).notNull().default("0.00"),
  lowestScore: decimal("lowest_score", { precision: 5, scale: 2 }).notNull().default("0.00"),
  totalStudyTime: integer("total_study_time").notNull().default(0), // in minutes
  lastActivity: timestamp("last_activity"),
  improvement: decimal("improvement", { precision: 5, scale: 2 }).notNull().default("0.00"), // % improvement
  weakTopics: jsonb("weak_topics"), // Array of topic IDs with low scores
  strongTopics: jsonb("strong_topics"), // Array of topic IDs with high scores
  recommendedActions: jsonb("recommended_actions"), // AI-generated recommendations
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student groups within institutions
export const institutionStudentGroups = pgTable("institution_student_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: varchar("institution_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  classLevel: varchar("class_level"), // JSS1, SS2, etc.
  academicYear: varchar("academic_year"),
  subjects: jsonb("subjects"), // Array of subject IDs
  teacherId: varchar("teacher_id"), // Institution user managing this group
  studentIds: jsonb("student_ids").notNull(), // Array of student user IDs
  examAccess: jsonb("exam_access"), // Array of allowed exam IDs
  settings: jsonb("settings"), // Group-specific settings
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User subject preferences
export const userSubjects = pgTable("user_subjects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  difficultyLevel: varchar("difficulty_level", { enum: ["beginner", "intermediate", "advanced"] }).notNull().default("beginner"),
  priority: integer("priority").notNull().default(1), // 1-10
  lastStudied: timestamp("last_studied"),
  totalStudyTime: integer("total_study_time").notNull().default(0), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [users.institutionId],
    references: [institutions.id],
  }),
  examSessions: many(examSessions),
  aiInteractions: many(aiInteractions),
  payments: many(payments),
  notifications: many(notifications),
  userPackages: many(userPackages),
  aiTutorSessions: many(aiTutorSessions),
  learningHistory: many(learningHistory),
  monthlyReviews: many(monthlyReviews),
  userSubjects: many(userSubjects),
}));

export const institutionsRelations = relations(institutions, ({ one, many }) => ({
  owner: one(users, {
    fields: [institutions.ownerId],
    references: [users.id],
  }),
  members: many(users),
  exams: many(exams),
  packages: many(institutionPackages),
  settings: one(institutionSettings),
  studentGroups: many(institutionStudentGroups),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  topics: many(topics),
  questions: many(questions),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [topics.subjectId],
    references: [subjects.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  topic: one(topics, {
    fields: [questions.topicId],
    references: [topics.id],
  }),
  subject: one(subjects, {
    fields: [questions.subjectId],
    references: [subjects.id],
  }),
  creator: one(users, {
    fields: [questions.createdBy],
    references: [users.id],
  }),
  aiInteractions: many(aiInteractions),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  creator: one(users, {
    fields: [exams.createdBy],
    references: [users.id],
  }),
  institution: one(institutions, {
    fields: [exams.institutionId],
    references: [institutions.id],
  }),
  sessions: many(examSessions),
}));

export const examSessionsRelations = relations(examSessions, ({ one }) => ({
  exam: one(exams, {
    fields: [examSessions.examId],
    references: [exams.id],
  }),
  user: one(users, {
    fields: [examSessions.userId],
    references: [users.id],
  }),
}));

export const aiInteractionsRelations = relations(aiInteractions, ({ one }) => ({
  user: one(users, {
    fields: [aiInteractions.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [aiInteractions.questionId],
    references: [questions.id],
  }),
  topic: one(topics, {
    fields: [aiInteractions.topicId],
    references: [topics.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const learningPackagesRelations = relations(learningPackages, ({ one, many }) => ({
  creator: one(users, {
    fields: [learningPackages.createdBy],
    references: [users.id],
  }),
  userPackages: many(userPackages),
}));

export const userPackagesRelations = relations(userPackages, ({ one }) => ({
  user: one(users, {
    fields: [userPackages.userId],
    references: [users.id],
  }),
  package: one(learningPackages, {
    fields: [userPackages.packageId],
    references: [learningPackages.id],
  }),
}));

export const aiTutorSessionsRelations = relations(aiTutorSessions, ({ one }) => ({
  user: one(users, {
    fields: [aiTutorSessions.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [aiTutorSessions.subjectId],
    references: [subjects.id],
  }),
  topic: one(topics, {
    fields: [aiTutorSessions.topicId],
    references: [topics.id],
  }),
}));

export const learningHistoryRelations = relations(learningHistory, ({ one }) => ({
  user: one(users, {
    fields: [learningHistory.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [learningHistory.subjectId],
    references: [subjects.id],
  }),
  topic: one(topics, {
    fields: [learningHistory.topicId],
    references: [topics.id],
  }),
}));

export const aiWebResourcesRelations = relations(aiWebResources, ({ one }) => ({
  subject: one(subjects, {
    fields: [aiWebResources.subjectId],
    references: [subjects.id],
  }),
  topic: one(topics, {
    fields: [aiWebResources.topicId],
    references: [topics.id],
  }),
}));

export const monthlyReviewsRelations = relations(monthlyReviews, ({ one }) => ({
  user: one(users, {
    fields: [monthlyReviews.userId],
    references: [users.id],
  }),
}));

export const userSubjectsRelations = relations(userSubjects, ({ one }) => ({
  user: one(users, {
    fields: [userSubjects.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [userSubjects.subjectId],
    references: [subjects.id],
  }),
}));

// New relations for institution tables
export const institutionPackagesRelations = relations(institutionPackages, ({ one }) => ({
  institution: one(institutions, {
    fields: [institutionPackages.institutionId],
    references: [institutions.id],
  }),
}));

export const institutionSettingsRelations = relations(institutionSettings, ({ one }) => ({
  institution: one(institutions, {
    fields: [institutionSettings.institutionId],
    references: [institutions.id],
  }),
}));

export const studentPerformanceRelations = relations(studentPerformance, ({ one }) => ({
  user: one(users, {
    fields: [studentPerformance.userId],
    references: [users.id],
  }),
  institution: one(institutions, {
    fields: [studentPerformance.institutionId],
    references: [institutions.id],
  }),
  subject: one(subjects, {
    fields: [studentPerformance.subjectId],
    references: [subjects.id],
  }),
}));

export const institutionStudentGroupsRelations = relations(institutionStudentGroups, ({ one }) => ({
  institution: one(institutions, {
    fields: [institutionStudentGroups.institutionId],
    references: [institutions.id],
  }),
  teacher: one(users, {
    fields: [institutionStudentGroups.teacherId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
  institutionId: true,
  subscriptionPlan: true,
  subscriptionExpiry: true,
});

export const insertInstitutionSchema = createInsertSchema(institutions).pick({
  name: true,
  type: true,
  contactEmail: true,
  contactPhone: true,
  address: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  text: true,
  type: true,
  options: true,
  correctAnswer: true,
  explanation: true,
  difficulty: true,
  topicId: true,
  subjectId: true,
  examType: true,
  points: true,
}).extend({
  topicId: z.number().nullable().optional(),
});

export const insertExamSchema = createInsertSchema(exams).pick({
  title: true,
  description: true,
  type: true,
  examCategory: true,
  duration: true,
  totalQuestions: true,
  passingScore: true,
  subjects: true,
  difficulty: true,
  instructions: true,
  isPublic: true,
  settings: true,
  scheduledStart: true,
  scheduledEnd: true,
}).extend({
  type: z.enum(["practice", "mock", "official", "custom"]),
  examCategory: z.enum(["jamb", "waec", "neco", "gce", "custom"]),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]).default("mixed"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  totalQuestions: z.number().min(1, "Must have at least 1 question"),
});

export const insertExamSessionSchema = createInsertSchema(examSessions).pick({
  examId: true,
  answers: true,
  flaggedQuestions: true,
  startTime: true,
  status: true,
});

export const insertAiInteractionSchema = createInsertSchema(aiInteractions).pick({
  type: true,
  question: true,
  questionId: true,
  topicId: true,
  rating: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  amount: true,
  currency: true,
  planType: true,
  duration: true,
  paymentMethod: true,
  transactionId: true,
  paymentReference: true,
  status: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema> & { id: string };
export type User = typeof users.$inferSelect;
export type Institution = typeof institutions.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Exam = typeof exams.$inferSelect;
export type ExamSession = typeof examSessions.$inferSelect;
export type AiInteraction = typeof aiInteractions.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type InsertExamSession = z.infer<typeof insertExamSessionSchema>;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Additional insert schemas for new tables
export const insertLearningPackageSchema = createInsertSchema(learningPackages).pick({
  title: true,
  description: true,
  category: true,
  subjectIds: true,
  price: true,
  currency: true,
  duration: true,
  content: true,
  difficulty: true,
  prerequisites: true,
});

export const insertUserPackageSchema = createInsertSchema(userPackages).pick({
  packageId: true,
  expiryDate: true,
  paymentReference: true,
});

export const insertAiTutorSessionSchema = createInsertSchema(aiTutorSessions).pick({
  sessionName: true,
  subjectId: true,
  topicId: true,
  sessionType: true,
  difficulty: true,
  messages: true,
  learningPath: true,
});

export const insertLearningHistorySchema = createInsertSchema(learningHistory).pick({
  subjectId: true,
  topicId: true,
  activityType: true,
  timeSpent: true,
  score: true,
  correctAnswers: true,
  totalQuestions: true,
});

export const insertUserSubjectSchema = createInsertSchema(userSubjects).pick({
  subjectId: true,
  difficultyLevel: true,
  priority: true,
});

// Additional types for new tables
export type LearningPackage = typeof learningPackages.$inferSelect;
export type UserPackage = typeof userPackages.$inferSelect;
export type AiTutorSession = typeof aiTutorSessions.$inferSelect;
export type LearningHistory = typeof learningHistory.$inferSelect;
export type AiWebResource = typeof aiWebResources.$inferSelect;
export type MonthlyReview = typeof monthlyReviews.$inferSelect;
export type UserSubject = typeof userSubjects.$inferSelect;

export type InsertLearningPackage = z.infer<typeof insertLearningPackageSchema>;
export type InsertUserPackage = z.infer<typeof insertUserPackageSchema>;
export type InsertAiTutorSession = z.infer<typeof insertAiTutorSessionSchema>;
export type InsertLearningHistory = z.infer<typeof insertLearningHistorySchema>;
export type InsertUserSubject = z.infer<typeof insertUserSubjectSchema>;

// Institution-specific schemas
export const insertInstitutionPackageSchema = createInsertSchema(institutionPackages).pick({
  packageType: true,
  studentCapacity: true,
  duration: true,
  price: true,
  currency: true,
  features: true,
  subjectAccess: true,
  examAccess: true,
  paymentMethod: true,
  paymentReference: true,
  invoiceNumber: true,
});

export const insertInstitutionSettingsSchema = createInsertSchema(institutionSettings).pick({
  disableDefaultContent: true,
  disabledSubjects: true,
  disabledExams: true,
  disabledQuestions: true,
  customBranding: true,
  examSettings: true,
  studentSettings: true,
  reportingSettings: true,
  notificationSettings: true,
});

export const insertStudentPerformanceSchema = createInsertSchema(studentPerformance).pick({
  subjectId: true,
  totalExams: true,
  totalScore: true,
  averageScore: true,
  highestScore: true,
  lowestScore: true,
  totalStudyTime: true,
  lastActivity: true,
  improvement: true,
  weakTopics: true,
  strongTopics: true,
  recommendedActions: true,
});

export const insertInstitutionStudentGroupSchema = createInsertSchema(institutionStudentGroups).pick({
  name: true,
  description: true,
  classLevel: true,
  academicYear: true,
  subjects: true,
  teacherId: true,
  studentIds: true,
  examAccess: true,
  settings: true,
});

// Institution-specific types
export type InstitutionPackage = typeof institutionPackages.$inferSelect;
export type InsertInstitutionPackage = z.infer<typeof insertInstitutionPackageSchema>;
export type InstitutionSettings = typeof institutionSettings.$inferSelect;
export type InsertInstitutionSettings = z.infer<typeof insertInstitutionSettingsSchema>;
export type StudentPerformance = typeof studentPerformance.$inferSelect;
export type InsertStudentPerformance = z.infer<typeof insertStudentPerformanceSchema>;
export type InstitutionStudentGroup = typeof institutionStudentGroups.$inferSelect;
export type InsertInstitutionStudentGroup = z.infer<typeof insertInstitutionStudentGroupSchema>;

// Study Groups and Collaboration Tables
export const studyGroups = pgTable("study_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull(),
  subjects: text("subjects").array().notNull(), // Array of subject names
  difficulty: varchar("difficulty", { enum: ["beginner", "intermediate", "advanced", "mixed"] }).notNull(),
  maxMembers: integer("max_members").default(8).notNull(),
  currentMembers: integer("current_members").default(1).notNull(),
  isPrivate: boolean("is_private").default(false).notNull(),
  joinCode: varchar("join_code").unique(),
  status: varchar("status", { enum: ["active", "inactive", "archived"] }).default("active").notNull(),
  meetingSchedule: text("meeting_schedule"), // JSON string for recurring meetings
  studyGoals: text("study_goals").array(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const studyGroupMembers = pgTable("study_group_members", {
  id: serial("id").primaryKey(),
  groupId: uuid("group_id").notNull().references(() => studyGroups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  role: varchar("role", { enum: ["admin", "moderator", "member"] }).default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastActive: timestamp("last_active").defaultNow(),
  studyStreak: integer("study_streak").default(0),
  contributionScore: integer("contribution_score").default(0),
  preferences: text("preferences"), // JSON string for member preferences
});

export const userStudyPreferences = pgTable("user_study_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  preferredSubjects: text("preferred_subjects").array().notNull(),
  studyTimeSlots: text("study_time_slots").array(), // "morning", "afternoon", "evening", "night"
  timezone: varchar("timezone").default("Africa/Lagos"),
  studyStyle: text("study_style").array(), // "visual", "auditory", "kinesthetic", "reading"
  difficultyLevel: varchar("difficulty_level", { enum: ["beginner", "intermediate", "advanced"] }).default("intermediate"),
  goalType: text("goal_type").array(), // "exam_prep", "skill_building", "homework_help", "concept_review"
  availabilityDays: text("availability_days").array(), // Days of week
  maxGroupSize: integer("max_group_size").default(6),
  preferredLanguage: varchar("preferred_language").default("english"),
  isOpenToMentoring: boolean("is_open_to_mentoring").default(false),
  isLookingForMentor: boolean("is_looking_for_mentor").default(false),
  academicLevel: varchar("academic_level", { enum: ["secondary", "university", "professional"] }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const studySessions = pgTable("study_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull().references(() => studyGroups.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  duration: integer("duration").notNull(), // minutes
  sessionType: varchar("session_type", { enum: ["group_study", "quiz_session", "discussion", "presentation"] }).notNull(),
  subjects: text("subjects").array(),
  materials: text("materials"), // JSON string for study materials
  hostId: varchar("host_id").notNull(),
  maxParticipants: integer("max_participants").default(8),
  currentParticipants: integer("current_participants").default(0),
  status: varchar("status", { enum: ["scheduled", "active", "completed", "cancelled"] }).default("scheduled").notNull(),
  recordingEnabled: boolean("recording_enabled").default(false),
  notesEnabled: boolean("notes_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const studySessionParticipants = pgTable("study_session_participants", {
  id: serial("id").primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => studySessions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  status: varchar("status", { enum: ["registered", "attended", "absent", "left_early"] }).default("registered").notNull(),
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  contributionScore: integer("contribution_score").default(0),
  notes: text("notes"), // Personal notes from the session
  feedback: text("feedback"), // JSON string for session feedback
});

export const aiMatchmaking = pgTable("ai_matchmaking", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  matchingCriteria: text("matching_criteria").notNull(), // JSON string with matching preferences
  compatibilityScores: text("compatibility_scores"), // JSON string with user compatibility scores
  suggestedGroups: text("suggested_groups").array(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Schema validation for collaborative features
export const insertStudyGroupSchema = createInsertSchema(studyGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentMembers: true,
});

export const insertUserStudyPreferencesSchema = createInsertSchema(userStudyPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentParticipants: true,
});

// Types for collaborative features
export type StudyGroup = typeof studyGroups.$inferSelect;
export type StudyGroupMember = typeof studyGroupMembers.$inferSelect;
export type UserStudyPreferences = typeof userStudyPreferences.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type StudySessionParticipant = typeof studySessionParticipants.$inferSelect;
export type AiMatchmaking = typeof aiMatchmaking.$inferSelect;

export type InsertStudyGroup = z.infer<typeof insertStudyGroupSchema>;
export type InsertUserStudyPreferences = z.infer<typeof insertUserStudyPreferencesSchema>;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
