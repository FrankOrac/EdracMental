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
  paymentMethod: varchar("payment_method", { enum: ["paystack", "flutterwave", "stripe"] }).notNull(),
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
}));

export const institutionsRelations = relations(institutions, ({ one, many }) => ({
  owner: one(users, {
    fields: [institutions.ownerId],
    references: [users.id],
  }),
  members: many(users),
  exams: many(exams),
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
