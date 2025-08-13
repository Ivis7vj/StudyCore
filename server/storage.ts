import { 
  type Document, type InsertDocument,
  type Topic, type InsertTopic,
  type Question, type InsertQuestion,
  type YoutubeVideo, type InsertYoutubeVideo,
  type PhetSimulation, type InsertPhetSimulation,
  type ChatSession, type InsertChatSession,
  type UserProgress, type InsertUserProgress,
  type TopicWithQuestionsAndResources,
  type DocumentWithTopics
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Documents
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  updateDocumentStatus(id: string, status: string, topicCount?: number): Promise<void>;
  getAllDocuments(): Promise<DocumentWithTopics[]>;
  
  // Topics
  createTopic(topic: InsertTopic): Promise<Topic>;
  getTopicsByDocument(documentId: string): Promise<Topic[]>;
  getTopicWithResources(id: string): Promise<TopicWithQuestionsAndResources | undefined>;
  
  // Questions
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestionsByTopic(topicId: string): Promise<Question[]>;
  
  // YouTube Videos
  createYoutubeVideo(video: InsertYoutubeVideo): Promise<YoutubeVideo>;
  getVideosByTopic(topicId: string): Promise<YoutubeVideo[]>;
  
  // PhET Simulations
  createPhetSimulation(simulation: InsertPhetSimulation): Promise<PhetSimulation>;
  getSimulationByTopic(topicId: string): Promise<PhetSimulation | undefined>;
  
  // Chat Sessions
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  updateChatSession(id: string, messages: any[]): Promise<void>;
  
  // User Progress
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgress(documentId: string): Promise<UserProgress[]>;
  
  // Random questions for daily challenge
  getRandomQuestions(limit: number): Promise<Question[]>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document> = new Map();
  private topics: Map<string, Topic> = new Map();
  private questions: Map<string, Question> = new Map();
  private youtubeVideos: Map<string, YoutubeVideo> = new Map();
  private phetSimulations: Map<string, PhetSimulation> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      uploadDate: new Date(),
      processingStatus: "uploading",
      topicCount: 0,
      extractedText: insertDocument.extractedText || null,
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async updateDocumentStatus(id: string, status: string, topicCount?: number): Promise<void> {
    const document = this.documents.get(id);
    if (document) {
      document.processingStatus = status;
      if (topicCount !== undefined) {
        document.topicCount = topicCount;
      }
      this.documents.set(id, document);
    }
  }

  async getAllDocuments(): Promise<DocumentWithTopics[]> {
    const docs = Array.from(this.documents.values());
    return Promise.all(docs.map(async (doc) => ({
      ...doc,
      topics: await this.getTopicsByDocument(doc.id)
    })));
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const id = randomUUID();
    const topic: Topic = { ...insertTopic, id };
    this.topics.set(id, topic);
    return topic;
  }

  async getTopicsByDocument(documentId: string): Promise<Topic[]> {
    return Array.from(this.topics.values())
      .filter(topic => topic.documentId === documentId)
      .sort((a, b) => a.order - b.order);
  }

  async getTopicWithResources(id: string): Promise<TopicWithQuestionsAndResources | undefined> {
    const topic = this.topics.get(id);
    if (!topic) return undefined;

    const questions = await this.getQuestionsByTopic(id);
    const youtubeVideos = await this.getVideosByTopic(id);
    const phetSimulation = await this.getSimulationByTopic(id);

    return {
      ...topic,
      questions,
      youtubeVideos,
      phetSimulation
    };
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const question: Question = { ...insertQuestion, id };
    this.questions.set(id, question);
    return question;
  }

  async getQuestionsByTopic(topicId: string): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(question => question.topicId === topicId)
      .sort((a, b) => a.order - b.order);
  }

  async createYoutubeVideo(insertVideo: InsertYoutubeVideo): Promise<YoutubeVideo> {
    const id = randomUUID();
    const video: YoutubeVideo = { ...insertVideo, id };
    this.youtubeVideos.set(id, video);
    return video;
  }

  async getVideosByTopic(topicId: string): Promise<YoutubeVideo[]> {
    return Array.from(this.youtubeVideos.values())
      .filter(video => video.topicId === topicId);
  }

  async createPhetSimulation(insertSimulation: InsertPhetSimulation): Promise<PhetSimulation> {
    const id = randomUUID();
    const simulation: PhetSimulation = { ...insertSimulation, id };
    this.phetSimulations.set(id, simulation);
    return simulation;
  }

  async getSimulationByTopic(topicId: string): Promise<PhetSimulation | undefined> {
    return Array.from(this.phetSimulations.values())
      .find(simulation => simulation.topicId === topicId);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async updateChatSession(id: string, messages: any[]): Promise<void> {
    const session = this.chatSessions.get(id);
    if (session) {
      session.messages = messages;
      this.chatSessions.set(id, session);
    }
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = randomUUID();
    const progress: UserProgress = {
      ...insertProgress,
      id,
      completedAt: new Date(),
    };
    this.userProgress.set(id, progress);
    return progress;
  }

  async getUserProgress(documentId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.documentId === documentId);
  }

  async getRandomQuestions(limit: number): Promise<Question[]> {
    const allQuestions = Array.from(this.questions.values());
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }
}

export const storage = new MemStorage();
