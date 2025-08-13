import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertDocumentSchema, insertTopicSchema, insertQuestionSchema, insertYoutubeVideoSchema, insertPhetSimulationSchema } from "@shared/schema";

// Extend Request interface for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyAohc04nVSHJctgkJ5L0TTw7E8bkx6yyDU";

// PhET simulations data
const PHET_SIMULATIONS = [
  { title: "Faraday's Law", url: "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html", keywords: ["electromagnetic", "induction", "magnet", "flux"] },
  { title: "Circuit Construction Kit: DC", url: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html", keywords: ["circuit", "voltage", "current", "resistance", "ohm"] },
  { title: "Ohm's Law", url: "https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_all.html", keywords: ["ohm", "resistance", "voltage", "current"] },
  { title: "Wave on a String", url: "https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_all.html", keywords: ["wave", "frequency", "amplitude", "oscillation"] },
  { title: "Projectile Motion", url: "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_all.html", keywords: ["projectile", "motion", "gravity", "trajectory"] },
  { title: "Energy Skate Park", url: "https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_all.html", keywords: ["energy", "kinetic", "potential", "conservation"] },
  { title: "Forces and Motion: Basics", url: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html", keywords: ["force", "motion", "newton", "friction"] },
  { title: "Gravity Force Lab", url: "https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab_all.html", keywords: ["gravity", "force", "mass", "universal"] },
  { title: "Balancing Chemical Equations", url: "https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_all.html", keywords: ["chemical", "equation", "balance", "reaction"] },
  { title: "pH Scale", url: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html", keywords: ["ph", "acid", "base", "concentration"] }
];

export async function registerRoutes(app: Express): Promise<Server> {
  
  // PDF Upload endpoint
  app.post('/api/upload', upload.single('pdf'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No PDF file uploaded' });
      }

      // Create document record
      const document = await storage.createDocument({
        filename: req.file.filename,
        originalName: req.file.originalname,
        extractedText: null
      });

      // Start processing in background
      processPDF(document.id, req.file.path);

      res.json({ documentId: document.id, status: 'uploading' });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed' });
    }
  });

  // Get document status
  app.get('/api/documents/:id/status', async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      res.json({ 
        status: document.processingStatus, 
        topicCount: document.topicCount,
        extractedText: document.extractedText ? 'available' : 'processing'
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get document status' });
    }
  });

  // Get document topics
  app.get('/api/documents/:id/topics', async (req, res) => {
    try {
      const topics = await storage.getTopicsByDocument(req.params.id);
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get topics' });
    }
  });

  // Get topic with all resources
  app.get('/api/topics/:id', async (req, res) => {
    try {
      const topic = await storage.getTopicWithResources(req.params.id);
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }
      res.json(topic);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get topic' });
    }
  });

  // Search YouTube videos
  app.get('/api/videos', async (req, res) => {
    try {
      const { query, maxResults = 2 } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter required' });
      }

      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query as string)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'YouTube API error');
      }

      const videos = data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        description: item.snippet.description
      }));

      res.json(videos);
    } catch (error) {
      console.error('YouTube API error:', error);
      res.status(500).json({ message: 'Failed to search videos' });
    }
  });

  // Get PhET simulation for topic
  app.get('/api/simulations', async (req, res) => {
    try {
      const { topic } = req.query;
      if (!topic) {
        return res.status(400).json({ message: 'Topic parameter required' });
      }

      const topicLower = (topic as string).toLowerCase();
      const simulation = PHET_SIMULATIONS.find(sim => 
        sim.keywords.some(keyword => topicLower.includes(keyword))
      ) || PHET_SIMULATIONS[0]; // Default fallback

      res.json({
        title: simulation.title,
        url: simulation.url,
        inquiryPrompts: [
          "PREDICT: What do you expect to happen in this simulation?",
          "OBSERVE: What actually happens when you interact with it?",
          "EXPLAIN: Why do you think this behavior occurs?"
        ]
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get simulation' });
    }
  });

  // Chat endpoint for Q&A
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, documentId, sessionId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message required' });
      }

      // Get or create chat session
      let session;
      if (sessionId) {
        session = await storage.getChatSession(sessionId);
      }
      
      if (!session) {
        session = await storage.createChatSession({
          documentId: documentId || null,
          messages: []
        });
      }

      // Add user message
      const messages = [...(session.messages as any[]), {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      }];

      // Generate AI response (simplified keyword matching)
      const aiResponse = generateAIResponse(message, documentId);
      messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      });

      // Update session
      await storage.updateChatSession(session.id, messages);

      res.json({
        sessionId: session.id,
        response: aiResponse,
        messages: messages
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ message: 'Chat failed' });
    }
  });

  // Get all documents (history)
  app.get('/api/documents', async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get documents' });
    }
  });

  // Daily challenge - get random questions
  app.get('/api/daily-challenge', async (req, res) => {
    try {
      const questions = await storage.getRandomQuestions(3);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get daily challenge' });
    }
  });

  // Submit quiz answers
  app.post('/api/submit-quiz', async (req, res) => {
    try {
      const { documentId, topicId, answers } = req.body;
      
      const progressEntries = [];
      for (const answer of answers) {
        const progress = await storage.createUserProgress({
          documentId,
          topicId,
          questionId: answer.questionId,
          userAnswer: answer.answer,
          isCorrect: answer.isCorrect
        });
        progressEntries.push(progress);
      }

      res.json({ progress: progressEntries });
    } catch (error) {
      res.status(500).json({ message: 'Failed to submit quiz' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background PDF processing function
async function processPDF(documentId: string, filePath: string) {
  try {
    await storage.updateDocumentStatus(documentId, 'analyzing');

    // Simulate PDF text extraction (replace with actual PDF processing)
    const dataBuffer = fs.readFileSync(filePath);
    const extractedText = `Sample extracted text from PDF file. This would contain the actual PDF content in a real implementation.
    
Topic 1: Introduction to Physics
Physics is the fundamental science that studies matter, energy, and their interactions. It provides the foundation for understanding how the universe works at all scales.

Topic 2: Newton's Laws of Motion
Newton's three laws of motion describe the relationship between forces acting on a body and its motion due to those forces.

Topic 3: Energy and Work
Energy is the capacity to do work. The law of conservation of energy states that energy cannot be created or destroyed, only transformed.

Topic 4: Electromagnetic Waves
Electromagnetic waves are oscillations of electric and magnetic fields that propagate through space at the speed of light.`;

    // Update document with extracted text
    const document = await storage.getDocument(documentId);
    if (document) {
      document.extractedText = extractedText;
    }

    // Extract topics (simplified approach - in real implementation would use NLP)
    const topics = await extractTopics(extractedText, documentId);
    
    await storage.updateDocumentStatus(documentId, 'ready', topics.length);

    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
  } catch (error) {
    console.error('PDF processing error:', error);
    await storage.updateDocumentStatus(documentId, 'error');
  }
}

// Simplified topic extraction (in production would use NLP/AI)
async function extractTopics(text: string, documentId: string) {
  const topics = [];
  
  // Split text into sections and identify potential topics
  const sections = text.split(/\n\s*\n/).filter(section => section.trim().length > 100);
  
  for (let i = 0; i < Math.min(sections.length, 6); i++) {
    const section = sections[i];
    const title = extractTitle(section);
    const summary = section.substring(0, 400) + '...';
    
    // Create topic
    const topic = await storage.createTopic({
      documentId,
      title,
      summary,
      pages: `${i * 5 + 1}-${(i + 1) * 5}`, // Estimated page ranges
      realWorldExample: generateRealWorldExample(title),
      order: i + 1
    });

    // Generate questions for topic
    await generateQuestions(topic.id, title);
    
    // Search and store YouTube videos
    await searchAndStoreVideos(topic.id, title);
    
    // Find and store PhET simulation
    await findAndStoreSimulation(topic.id, title);
    
    topics.push(topic);
  }
  
  return topics;
}

// Extract title from text section
function extractTitle(text: string): string {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    // Use first significant line as title
    const firstLine = lines[0].trim();
    if (firstLine.length < 100) {
      return firstLine;
    }
  }
  return "Topic " + (Math.floor(Math.random() * 100) + 1);
}

// Generate questions for a topic
async function generateQuestions(topicId: string, title: string) {
  // Simplified question generation
  const questions = [
    {
      type: 'MCQ',
      question: `What is the main principle behind ${title}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: 'This is the correct explanation.',
      order: 1
    },
    {
      type: 'Short',
      question: `Explain the practical applications of ${title}.`,
      options: null,
      correctAnswer: null,
      explanation: 'Various applications include...',
      order: 2
    }
  ];

  for (const q of questions) {
    await storage.createQuestion({
      topicId,
      ...q
    });
  }
}

// Search and store YouTube videos
async function searchAndStoreVideos(topicId: string, title: string) {
  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(title)}&type=video&maxResults=2&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.items) {
      for (const item of data.items) {
        await storage.createYoutubeVideo({
          topicId,
          videoId: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          duration: 'Unknown',
          thumbnailUrl: item.snippet.thumbnails.medium.url
        });
      }
    }
  } catch (error) {
    console.error('YouTube search error:', error);
  }
}

// Find and store PhET simulation
async function findAndStoreSimulation(topicId: string, title: string) {
  const titleLower = title.toLowerCase();
  const simulation = PHET_SIMULATIONS.find(sim => 
    sim.keywords.some(keyword => titleLower.includes(keyword))
  ) || PHET_SIMULATIONS[0];

  await storage.createPhetSimulation({
    topicId,
    title: simulation.title,
    url: simulation.url,
    inquiryPrompts: [
      "PREDICT: What do you expect to happen?",
      "OBSERVE: What actually happens?",
      "EXPLAIN: Why does this occur?"
    ]
  });
}

// Generate real-world example
function generateRealWorldExample(title: string): string {
  return `Real-world applications of ${title} can be found in various industries and everyday life. This principle is fundamental to understanding how modern technology works and its practical implications.`;
}

// Generate AI response for chat
function generateAIResponse(message: string, documentId?: string): string {
  const messageLower = message.toLowerCase();
  
  const responses: Record<string, string> = {
    'electromagnetic': 'Electromagnetic induction occurs when a conductor moves through a magnetic field, creating an induced EMF. This principle is fundamental to generators and transformers.',
    'circuit': 'AC circuits involve impedance, which combines resistance and reactance. The phase relationship between voltage and current is crucial for power calculations.',
    'faraday': "Faraday's Law states that EMF equals the negative rate of change of magnetic flux: EMF = -dΦ/dt. This law explains how generators and transformers work.",
    'impedance': 'Impedance Z in AC circuits is calculated as Z = √(R² + (XL - XC)²), where R is resistance, XL is inductive reactance, and XC is capacitive reactance.',
    'energy': 'Energy conservation is a fundamental principle in physics. Mechanical energy can be converted between kinetic and potential forms.',
    'force': 'Force is defined by Newton\'s second law: F = ma. Forces cause acceleration and are vector quantities.',
    'wave': 'Waves transfer energy without transferring matter. They have properties like frequency, wavelength, and amplitude.',
    'hello': 'Hello! I\'m StudyCore AI, your study companion. I can help you understand concepts from your uploaded documents.',
    'help': 'I can help you with questions about physics, chemistry, mathematics, and other topics from your study materials. Just ask me anything!'
  };

  for (const keyword in responses) {
    if (messageLower.includes(keyword)) {
      return responses[keyword];
    }
  }
  
  return 'I can help you understand concepts from your uploaded documents. Try asking about specific topics like electromagnetic induction, circuits, or any physics concepts. If you need more detailed help, please be more specific about what you\'d like to learn.';
}
