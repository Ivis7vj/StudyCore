import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  extractedText: text("extracted_text"),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  processingStatus: text("processing_status").notNull().default("uploading"), // uploading, analyzing, ready, error
  topicCount: integer("topic_count").default(0),
});

export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  pages: text("pages").notNull(), // e.g., "15-23"
  realWorldExample: text("real_world_example").notNull(),
  order: integer("order").notNull(),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").references(() => topics.id).notNull(),
  type: text("type").notNull(), // "MCQ" or "Short"
  question: text("question").notNull(),
  options: jsonb("options"), // Array of strings for MCQ
  correctAnswer: text("correct_answer"),
  explanation: text("explanation"),
  order: integer("order").notNull(),
});

export const youtubeVideos = pgTable("youtube_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").references(() => topics.id).notNull(),
  videoId: text("video_id").notNull(),
  title: text("title").notNull(),
  channel: text("channel").notNull(),
  duration: text("duration"),
  thumbnailUrl: text("thumbnail_url"),
});

export const phetSimulations = pgTable("phet_simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").references(() => topics.id).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  inquiryPrompts: jsonb("inquiry_prompts").notNull(), // Array of 3 prompts
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id),
  messages: jsonb("messages").notNull().default('[]'), // Array of {role, content, timestamp}
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  topicId: varchar("topic_id").references(() => topics.id),
  questionId: varchar("question_id").references(() => questions.id),
  userAnswer: text("user_answer"),
  isCorrect: boolean("is_correct"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Insert schemas
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadDate: true,
  processingStatus: true,
  topicCount: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertYoutubeVideoSchema = createInsertSchema(youtubeVideos).omit({
  id: true,
});

export const insertPhetSimulationSchema = createInsertSchema(phetSimulations).omit({
  id: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  completedAt: true,
});

// Types
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type YoutubeVideo = typeof youtubeVideos.$inferSelect;
export type InsertYoutubeVideo = z.infer<typeof insertYoutubeVideoSchema>;

export type PhetSimulation = typeof phetSimulations.$inferSelect;
export type InsertPhetSimulation = z.infer<typeof insertPhetSimulationSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

// Extended types for API responses
export type TopicWithQuestionsAndResources = Topic & {
  questions: Question[];
  youtubeVideos: YoutubeVideo[];
  phetSimulation: PhetSimulation | null;
};

export type DocumentWithTopics = Document & {
  topics: Topic[];
};
