import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertDocumentSchema, insertTopicSchema, insertQuestionSchema, insertYoutubeVideoSchema, insertPhetSimulationSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";

// Extend Request interface for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req: any, file: any, cb: any) => {
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

// API configurations
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyAohc04nVSHJctgkJ5L0TTw7E8bkx6yyDU";

// Initialize Gemini AI
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// PhET simulations data - Complete collection
const PHET_SIMULATIONS = [
  { title: "Number Pairs", url: "https://phet.colorado.edu/sims/html/number-pairs/latest/number-pairs_all.html", keywords: ["math", "number", "pairs", "addition", "subtraction"] },
  { title: "Area Builder", url: "https://phet.colorado.edu/sims/html/area-builder/latest/area-builder_all.html", keywords: ["geometry", "area", "shapes", "math"] },
  { title: "Arithmetic", url: "https://phet.colorado.edu/sims/html/arithmetic/latest/arithmetic_all.html", keywords: ["math", "arithmetic", "operations", "numbers"] },
  { title: "Balancing Act", url: "https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_all.html", keywords: ["balance", "torque", "physics", "lever"] },
  { title: "Balloons and Static Electricity", url: "https://phet.colorado.edu/sims/html/balloons-and-static-electricity/latest/balloons-and-static-electricity_all.html", keywords: ["static", "electricity", "charge", "physics"] },
  { title: "Beers Law Lab", url: "https://phet.colorado.edu/sims/html/beers-law-lab/latest/beers-law-lab_all.html", keywords: ["chemistry", "concentration", "absorption", "light"] },
  { title: "Bend Light", url: "https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_all.html", keywords: ["optics", "refraction", "light", "physics"] },
  { title: "Blackbody Spectrum", url: "https://phet.colorado.edu/sims/html/blackbody-spectrum/latest/blackbody-spectrum_all.html", keywords: ["physics", "spectrum", "radiation", "temperature"] },
  { title: "Build a Fraction", url: "https://phet.colorado.edu/sims/html/build-a-fraction/latest/build-a-fraction_all.html", keywords: ["math", "fractions", "numbers", "parts"] },
  { title: "Build a Molecule", url: "https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_all.html", keywords: ["chemistry", "molecules", "atoms", "bonds"] },
  { title: "Build an Atom", url: "https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_all.html", keywords: ["chemistry", "atoms", "protons", "electrons", "neutrons"] },
  { title: "Capacitor Lab: Basics", url: "https://phet.colorado.edu/sims/html/capacitor-lab-basics/latest/capacitor-lab-basics_all.html", keywords: ["physics", "capacitor", "electricity", "charge"] },
  { title: "Circuit Construction Kit: DC", url: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html", keywords: ["circuit", "voltage", "current", "resistance", "ohm"] },
  { title: "Circuit Construction Kit: DC - Virtual Lab", url: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc-virtual-lab/latest/circuit-construction-kit-dc-virtual-lab_all.html", keywords: ["circuit", "voltage", "current", "virtual", "lab"] },
  { title: "Circuit Construction Kit: Black Box Study", url: "https://phet.colorado.edu/sims/html/circuit-construction-kit-black-box-study/latest/circuit-construction-kit-black-box-study_all.html", keywords: ["circuit", "black", "box", "mystery", "analysis"] },
  { title: "Color Vision", url: "https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_all.html", keywords: ["color", "vision", "light", "perception"] },
  { title: "Concentration", url: "https://phet.colorado.edu/sims/html/concentration/latest/concentration_all.html", keywords: ["chemistry", "concentration", "solution", "molarity"] },
  { title: "Coulomb's Law", url: "https://phet.colorado.edu/sims/html/coulombs-law/latest/coulombs-law_all.html", keywords: ["physics", "electric", "force", "charge"] },
  { title: "Curve Fitting", url: "https://phet.colorado.edu/sims/html/curve-fitting/latest/curve-fitting_all.html", keywords: ["math", "statistics", "curve", "fitting", "regression"] },
  { title: "Density", url: "https://phet.colorado.edu/sims/html/density/latest/density_all.html", keywords: ["physics", "density", "mass", "volume"] },
  { title: "Diffusion", url: "https://phet.colorado.edu/sims/html/diffusion/latest/diffusion_all.html", keywords: ["biology", "diffusion", "membrane", "transport"] },
  { title: "Energy Forms and Changes", url: "https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_all.html", keywords: ["physics", "energy", "transformation", "conservation"] },
  { title: "Energy Skate Park", url: "https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_all.html", keywords: ["energy", "kinetic", "potential", "conservation"] },
  { title: "Equality Explorer", url: "https://phet.colorado.edu/sims/html/equality-explorer/latest/equality-explorer_all.html", keywords: ["math", "algebra", "equality", "equations"] },
  { title: "Equality Explorer: Basics", url: "https://phet.colorado.edu/sims/html/equality-explorer-basics/latest/equality-explorer-basics_all.html", keywords: ["math", "algebra", "equality", "basics"] },
  { title: "Equality Explorer: Two Variables", url: "https://phet.colorado.edu/sims/html/equality-explorer-two-variables/latest/equality-explorer-two-variables_all.html", keywords: ["math", "algebra", "variables", "equations"] },
  { title: "Equation Grapher", url: "https://phet.colorado.edu/sims/html/equation-grapher/latest/equation-grapher_all.html", keywords: ["math", "graphing", "equations", "functions"] },
  { title: "Estimation", url: "https://phet.colorado.edu/sims/html/estimation/latest/estimation_all.html", keywords: ["math", "estimation", "approximation", "numbers"] },
  { title: "Faraday's Law", url: "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html", keywords: ["electromagnetic", "induction", "magnet", "flux"] },
  { title: "Forces and Motion: Basics", url: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html", keywords: ["force", "motion", "newton", "friction"] },
  { title: "Friction", url: "https://phet.colorado.edu/sims/html/friction/latest/friction_all.html", keywords: ["physics", "friction", "force", "motion"] },
  { title: "Function Builder", url: "https://phet.colorado.edu/sims/html/function-builder/latest/function-builder_all.html", keywords: ["math", "functions", "algebra", "patterns"] },
  { title: "Function Builder: Basics", url: "https://phet.colorado.edu/sims/html/function-builder-basics/latest/function-builder-basics_all.html", keywords: ["math", "functions", "basics", "patterns"] },
  { title: "Gas Properties", url: "https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_all.html", keywords: ["chemistry", "gas", "pressure", "temperature", "volume"] },
  { title: "Geometric Optics", url: "https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics_all.html", keywords: ["physics", "optics", "light", "lenses", "mirrors"] },
  { title: "Graphing Lines", url: "https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines_all.html", keywords: ["math", "graphing", "lines", "slope", "intercept"] },
  { title: "Graphing Quadratics", url: "https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics_all.html", keywords: ["math", "quadratic", "parabola", "graphing"] },
  { title: "Graphing Slope-Intercept", url: "https://phet.colorado.edu/sims/html/graphing-slope-intercept/latest/graphing-slope-intercept_all.html", keywords: ["math", "slope", "intercept", "linear"] },
  { title: "Gravity and Orbits", url: "https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_all.html", keywords: ["physics", "gravity", "orbits", "planetary", "motion"] },
  { title: "Gravity Force Lab", url: "https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab_all.html", keywords: ["gravity", "force", "mass", "universal"] },
  { title: "Gravity Force Lab: Basics", url: "https://phet.colorado.edu/sims/html/gravity-force-lab-basics/latest/gravity-force-lab-basics_all.html", keywords: ["gravity", "force", "basics", "attraction"] },
  { title: "Greenhouse Effect", url: "https://phet.colorado.edu/sims/html/greenhouse-effect/latest/greenhouse-effect_all.html", keywords: ["climate", "greenhouse", "atmosphere", "temperature"] },
  { title: "Hooke's Law", url: "https://phet.colorado.edu/sims/html/hookes-law/latest/hookes-law_all.html", keywords: ["physics", "spring", "force", "elasticity"] },
  { title: "Isotopes and Atomic Mass", url: "https://phet.colorado.edu/sims/html/isotopes-and-atomic-mass/latest/isotopes-and-atomic-mass_all.html", keywords: ["chemistry", "isotopes", "atomic", "mass"] },
  { title: "Least-Squares Regression", url: "https://phet.colorado.edu/sims/html/least-squares-regression/latest/least-squares-regression_all.html", keywords: ["math", "statistics", "regression", "data"] },
  { title: "Make a Ten", url: "https://phet.colorado.edu/sims/html/make-a-ten/latest/make-a-ten_all.html", keywords: ["math", "addition", "ten", "numbers"] },
  { title: "Masses and Springs", url: "https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs_all.html", keywords: ["physics", "spring", "oscillation", "motion"] },
  { title: "Membrane Channels", url: "https://phet.colorado.edu/sims/html/membrane-channels/latest/membrane-channels_all.html", keywords: ["biology", "membrane", "channels", "transport"] },
  { title: "Molecule Polarity", url: "https://phet.colorado.edu/sims/html/molecule-polarity/latest/molecule-polarity_all.html", keywords: ["chemistry", "polarity", "molecules", "electronegativity"] },
  { title: "Molecule Shapes", url: "https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html", keywords: ["chemistry", "molecular", "geometry", "shapes"] },
  { title: "Molecule Shapes: Basics", url: "https://phet.colorado.edu/sims/html/molecule-shapes-basics/latest/molecule-shapes-basics_all.html", keywords: ["chemistry", "molecular", "shapes", "basics"] },
  { title: "Molecules and Light", url: "https://phet.colorado.edu/sims/html/molecules-and-light/latest/molecules-and-light_all.html", keywords: ["chemistry", "molecules", "light", "absorption"] },
  { title: "My Solar System", url: "https://phet.colorado.edu/sims/html/my-solar-system/latest/my-solar-system_all.html", keywords: ["astronomy", "solar", "system", "planets", "gravity"] },
  { title: "Natural Selection", url: "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_all.html", keywords: ["biology", "evolution", "selection", "genetics"] },
  { title: "Neuron", url: "https://phet.colorado.edu/sims/html/neuron/latest/neuron_all.html", keywords: ["biology", "neuron", "nerve", "signal"] },
  { title: "Ohm's Law", url: "https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_all.html", keywords: ["ohm", "resistance", "voltage", "current"] },
  { title: "Pendulum Lab", url: "https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_all.html", keywords: ["physics", "pendulum", "oscillation", "gravity"] },
  { title: "pH Scale", url: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html", keywords: ["ph", "acid", "base", "concentration"] },
  { title: "pH Scale: Basics", url: "https://phet.colorado.edu/sims/html/ph-scale-basics/latest/ph-scale-basics_all.html", keywords: ["ph", "acid", "base", "basics"] },
  { title: "Proportion Playground", url: "https://phet.colorado.edu/sims/html/proportion-playground/latest/proportion-playground_all.html", keywords: ["math", "proportion", "ratio", "scaling"] },
  { title: "Projectile Motion", url: "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_all.html", keywords: ["projectile", "motion", "gravity", "trajectory"] },
  { title: "Reactants, Products and Leftovers", url: "https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_all.html", keywords: ["chemistry", "reaction", "stoichiometry", "limiting"] },
  { title: "Resistance in a Wire", url: "https://phet.colorado.edu/sims/html/resistance-in-a-wire/latest/resistance-in-a-wire_all.html", keywords: ["physics", "resistance", "conductivity", "material"] },
  { title: "Reversible Reactions", url: "https://phet.colorado.edu/sims/html/reversible-reactions/latest/reversible-reactions_all.html", keywords: ["chemistry", "equilibrium", "reaction", "reversible"] },
  { title: "Rutherford Scattering", url: "https://phet.colorado.edu/sims/html/rutherford-scattering/latest/rutherford-scattering_all.html", keywords: ["physics", "atom", "scattering", "nuclear"] },
  { title: "States of Matter", url: "https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter_all.html", keywords: ["chemistry", "states", "matter", "phase"] },
  { title: "States of Matter: Basics", url: "https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_all.html", keywords: ["chemistry", "states", "matter", "basics"] },
  { title: "The Ramp", url: "https://phet.colorado.edu/sims/html/the-ramp/latest/the-ramp_all.html", keywords: ["physics", "force", "ramp", "incline", "friction"] },
  { title: "Trig Tour", url: "https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour_all.html", keywords: ["math", "trigonometry", "sine", "cosine", "tangent"] },
  { title: "Under Pressure", url: "https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_all.html", keywords: ["physics", "pressure", "fluid", "depth"] },
  { title: "Unit Rates", url: "https://phet.colorado.edu/sims/html/unit-rates/latest/unit-rates_all.html", keywords: ["math", "rates", "ratios", "unit"] },
  { title: "Vector Addition", url: "https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition_all.html", keywords: ["physics", "vectors", "addition", "components"] },
  { title: "Wave on a String", url: "https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_all.html", keywords: ["wave", "frequency", "amplitude", "oscillation"] },
  { title: "Wave Interference", url: "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_all.html", keywords: ["physics", "wave", "interference", "superposition"] },
  { title: "John Travoltage", url: "https://phet.colorado.edu/sims/html/john-travoltage/latest/john-travoltage_all.html", keywords: ["static", "electricity", "charge", "discharge"] },
  { title: "Acids and Bases", url: "https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_all.html", keywords: ["chemistry", "acid", "base", "solution", "ph"] },
  { title: "Atomic Interactions", url: "https://phet.colorado.edu/sims/html/atomic-interactions/latest/atomic-interactions_all.html", keywords: ["chemistry", "atoms", "interactions", "forces"] },
  { title: "Buoyancy Playground", url: "https://phet.colorado.edu/sims/html/buoyancy-playground/latest/buoyancy-playground_all.html", keywords: ["physics", "buoyancy", "density", "fluid"] },
  { title: "Charges and Fields", url: "https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_all.html", keywords: ["physics", "electric", "field", "charge"] },
  { title: "Elastic Collisions", url: "https://phet.colorado.edu/sims/html/elastic-collisions/latest/elastic-collisions_all.html", keywords: ["physics", "collision", "momentum", "energy"] },
  { title: "Energy Skate Park: Basics", url: "https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_all.html", keywords: ["physics", "energy", "kinetic", "potential", "basics"] },
  { title: "Fourier: Making Waves", url: "https://phet.colorado.edu/sims/html/fourier-making-waves/latest/fourier-making-waves_all.html", keywords: ["physics", "waves", "fourier", "frequency"] },
  { title: "Fraction Matcher", url: "https://phet.colorado.edu/sims/html/fraction-matcher/latest/fraction-matcher_all.html", keywords: ["math", "fractions", "matching", "equivalence"] },
  { title: "Fractions: Intro", url: "https://phet.colorado.edu/sims/html/fractions-intro/latest/fractions-intro_all.html", keywords: ["math", "fractions", "introduction", "parts"] },
  { title: "Fractions: Mixed Numbers", url: "https://phet.colorado.edu/sims/html/fractions-mixed-numbers/latest/fractions-mixed-numbers_all.html", keywords: ["math", "fractions", "mixed", "numbers"] },
  { title: "Fractions: Equality", url: "https://phet.colorado.edu/sims/html/fractions-equality/latest/fractions-equality_all.html", keywords: ["math", "fractions", "equality", "equivalent"] },
  { title: "Ideal Gas Law", url: "https://phet.colorado.edu/sims/html/ideal-gas-law/latest/ideal-gas-law_all.html", keywords: ["chemistry", "gas", "pressure", "volume", "temperature"] },
  { title: "Interaction Potential", url: "https://phet.colorado.edu/sims/html/interaction-potential/latest/interaction-potential_all.html", keywords: ["physics", "potential", "energy", "interaction"] },
  { title: "Optics Lab", url: "https://phet.colorado.edu/sims/html/optics-lab/latest/optics-lab_all.html", keywords: ["physics", "optics", "light", "lab"] },
  { title: "Plinko Probability", url: "https://phet.colorado.edu/sims/html/plinko-probability/latest/plinko-probability_all.html", keywords: ["math", "probability", "statistics", "distribution"] },
  { title: "Radioactive Dating Game", url: "https://phet.colorado.edu/sims/html/radioactive-dating-game/latest/radioactive-dating-game_all.html", keywords: ["physics", "radioactive", "decay", "dating"] },
  { title: "Reactions and Rates", url: "https://phet.colorado.edu/sims/html/reactions-and-rates/latest/reactions-and-rates_all.html", keywords: ["chemistry", "reaction", "kinetics", "rate"] },
  { title: "Sugar and Salt Solutions", url: "https://phet.colorado.edu/sims/html/sugar-and-salt-solutions/latest/sugar-and-salt-solutions_all.html", keywords: ["chemistry", "solution", "concentration", "dissolution"] },
  { title: "The Photoelectric Effect", url: "https://phet.colorado.edu/sims/html/photoelectric/latest/photoelectric_all.html", keywords: ["physics", "photoelectric", "quantum", "light"] }
];

export async function registerRoutes(app: Express): Promise<Server> {
  
  // PDF Upload endpoint  
  app.post('/api/upload', upload.single('pdf'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No PDF file uploaded' });
      }

      console.log('File uploaded successfully:', {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      });

      // Create document record
      const document = await storage.createDocument({
        filename: req.file.filename,
        originalName: req.file.originalname,
        extractedText: null
      });

      // Start processing in background with correct file path
      processPDF(document.id, req.file.path).catch(error => {
        console.error(`Background PDF processing failed for ${document.id}:`, error);
      });

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

  // Get all available simulations or search by topic
  app.get('/api/simulations', async (req, res) => {
    try {
      const { topic } = req.query;
      
      if (topic) {
        // Search for specific topic
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
      } else {
        // Return all simulations
        const simulations = PHET_SIMULATIONS.map((sim, index) => ({
          id: index + 1,
          title: sim.title,
          url: sim.url,
          keywords: sim.keywords
        }));
        res.json(simulations);
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to get simulations' });
    }
  });

  // Get simulations related to a specific document
  app.get('/api/simulations/:documentId', async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.documentId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Get topics for this document
      const topics = await storage.getTopicsByDocument(req.params.documentId);
      
      // Extract keywords from document topics
      const documentKeywords = topics
        .flatMap((topic: any) => [topic.title, topic.summary].join(' ').toLowerCase().split(' '))
        .filter((word: string) => word.length > 3);

      // Find matching simulations
      const relatedSimulations = PHET_SIMULATIONS
        .map((sim, index) => ({
          id: index + 1,
          title: sim.title,
          url: sim.url,
          keywords: sim.keywords,
          documentId: document.id,
          relevanceScore: sim.keywords.reduce((score: number, keyword: string) => {
            return score + (documentKeywords.some((docWord: string) => 
              docWord.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(docWord)
            ) ? 1 : 0);
          }, 0)
        }))
        .filter(sim => sim.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      res.json(relatedSimulations);
    } catch (error) {
      console.error('Error getting related simulations:', error);
      res.status(500).json({ message: 'Failed to get related simulations' });
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

      // Generate AI response using OpenAI
      const aiResponse = await generateAIResponse(message, documentId);
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

  // Daily challenge - Generated by Gemini AI
  app.get('/api/daily-challenge', async (req, res) => {
    try {
      const challenge = await generateDailyChallengeWithAI();
      res.json([challenge]);
    } catch (error) {
      console.error('Daily challenge error:', error);
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

// AI-powered chat response generation
async function generateAIResponse(message: string, documentId?: string): Promise<string> {
  try {
    let contextText = '';
    
    // If there's a document, get its content for context
    if (documentId) {
      const document = await storage.getDocument(documentId);
      if (document && document.extractedText) {
        contextText = document.extractedText.substring(0, 2000); // Use first 2000 chars for context
      }
    }

    const model = genAI.models.generateContent;
    const prompt = `You are an educational AI assistant helping students understand their study materials. Be helpful, accurate, and encouraging. If provided with document context, reference it in your responses.${contextText ? `\n\nDocument context: ${contextText}` : ''}\n\nStudent question: ${message}`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [{ text: prompt }],
          role: "user"
        }
      ],
    });

    return response.text || "I'm sorry, I couldn't generate a response right now. Please try again.";
  } catch (error) {
    console.error('AI chat error:', error);
    return "I'm having trouble connecting to my AI service right now. Please try again in a moment.";
  }
}

// Simple fallback topic extraction
async function extractTopicsSimple(text: string, documentId: string) {
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
      pages: `${i * 5 + 1}-${(i + 1) * 5}`,
      realWorldExample: generateRealWorldExample(title),
      order: i + 1
    });

    // Generate simple questions
    await generateQuestionsSimple(topic.id, title);
    
    // Search and store YouTube videos
    await searchAndStoreVideos(topic.id, title);
    
    // Find and store PhET simulation
    await findAndStoreSimulation(topic.id, title);
    
    topics.push(topic);
  }
  
  return topics;
}

// Background PDF processing function
async function processPDF(documentId: string, filePath: string) {
  try {
    console.log(`Starting PDF processing for document ${documentId} at path: ${filePath}`);
    await storage.updateDocumentStatus(documentId, 'analyzing');

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      throw new Error(`File not found: ${filePath}`);
    }

    // Extract text from PDF using pdf-parse
    const dataBuffer = fs.readFileSync(filePath);
    
    // Import pdf-parse properly
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default;
    
    // Configure pdf-parse options for better performance
    const options = {
      max: 0 // No page limit - process all pages
    };
    
    const pdfData = await pdfParse(dataBuffer, options);
    const extractedText = pdfData.text;

    console.log(`Successfully extracted ${extractedText.length} characters from PDF`);

    if (!extractedText.trim()) {
      throw new Error('No text could be extracted from PDF - document may be image-based or corrupted');
    }

    // Update document with extracted text
    await storage.updateDocumentText(documentId, extractedText);

    // Use AI to extract topics and generate study materials
    console.log('Starting AI topic extraction...');
    await storage.updateDocumentStatus(documentId, 'generating-topics');
    
    const topics = await extractTopicsWithAI(extractedText, documentId);
    console.log(`Generated ${topics.length} topics with study materials`);
    
    await storage.updateDocumentStatus(documentId, 'ready', topics.length);

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up temporary file: ${filePath}`);
    } catch (cleanupError) {
      console.warn(`Failed to clean up file ${filePath}:`, cleanupError);
    }
    
  } catch (error) {
    console.error('PDF processing error:', error);
    await storage.updateDocumentStatus(documentId, 'error');
    
    // Try to clean up file even on error
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.warn(`Failed to clean up file on error:`, cleanupError);
    }
  }
}

// AI-powered topic extraction using OpenAI
async function extractTopicsWithAI(text: string, documentId: string) {
  const topics = [];
  
  try {
    console.log('Analyzing document with Gemini AI...');
    
    // Use more text for better analysis, limit for performance
    const analysisText = text.substring(0, 8000);
    
    // Use Gemini to extract topics and create summaries
    const prompt = `You are an educational AI assistant. Analyze the provided text and extract 3-6 main topics. For each topic, provide a clear title and a 2-3 sentence summary. Format your response as JSON with this structure: {"topics": [{"title": "Topic Title", "summary": "Brief summary"}]}

Please analyze this educational content and extract the main topics:

${analysisText}`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash", // Use flash model for faster processing
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" }
                },
                required: ["title", "summary"]
              }
            }
          },
          required: ["topics"]
        },
      },
      contents: [
        {
          parts: [{ text: prompt }],
          role: "user"
        }
      ],
    });

    const aiResponse = response.text;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI Analysis Response:', aiResponse);
    
    const parsedResponse = JSON.parse(aiResponse);
    const extractedTopics = parsedResponse.topics || [];

    for (let i = 0; i < extractedTopics.length; i++) {
      const aiTopic = extractedTopics[i];
      const title = aiTopic.title || `Topic ${i + 1}`;
      const summary = aiTopic.summary || 'No summary available.';
    
      // Create topic
      const topic = await storage.createTopic({
        documentId,
        title,
        summary,
        pages: `${i * 5 + 1}-${(i + 1) * 5}`, // Estimated page ranges
        realWorldExample: generateRealWorldExample(title),
        order: i + 1
      });

      // Generate all resources concurrently for better performance
      await Promise.all([
        generateQuestionsWithAI(topic.id, title, summary),
        searchAndStoreVideos(topic.id, title),
        findAndStoreSimulation(topic.id, title)
      ]);
      
      topics.push(topic);
    }
    
    return topics;
  } catch (error) {
    console.error('AI topic extraction error:', error);
    // Fallback to simple extraction if AI fails
    return await extractTopicsSimple(text, documentId);
  }
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

// AI-powered question generation
async function generateQuestionsWithAI(topicId: string, title: string, summary: string) {
  try {
    const prompt = `Generate 2 educational questions about a topic. Format as JSON: {"questions": [{"type": "MCQ", "question": "question text", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "why this is correct"}, {"type": "Short", "question": "question text", "explanation": "sample answer"}]}

Topic: ${title}
Summary: ${summary}`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  question: { type: "string" },
                  options: { 
                    type: "array",
                    items: { type: "string" }
                  },
                  correctAnswer: { type: "string" },
                  explanation: { type: "string" }
                },
                required: ["type", "question", "explanation"]
              }
            }
          },
          required: ["questions"]
        },
      },
      contents: [
        {
          parts: [{ text: prompt }],
          role: "user"
        }
      ],
    });

    const aiResponse = response.text;
    if (aiResponse) {
      const parsedResponse = JSON.parse(aiResponse);
      const questions = parsedResponse.questions || [];
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await storage.createQuestion({
          topicId,
          type: q.type,
          question: q.question,
          options: q.options || null,
          correctAnswer: q.correctAnswer || null,
          explanation: q.explanation,
          order: i + 1
        });
      }
    }
  } catch (error) {
    console.error('Question generation error:', error);
    // Fallback to simple questions
    await generateQuestionsSimple(topicId, title);
  }
}

// Simple fallback question generation
async function generateQuestionsSimple(topicId: string, title: string) {
  const questions = [
    {
      type: 'MCQ',
      question: `What is the main concept of ${title}?`,
      options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
      correctAnswer: 'Concept A',
      explanation: 'This covers the fundamental principle.',
      order: 1
    },
    {
      type: 'Short',
      question: `Describe the key aspects of ${title}.`,
      options: null,
      correctAnswer: null,
      explanation: 'Key aspects include the main principles and applications.',
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

// Generate daily challenge with Gemini AI
async function generateDailyChallengeWithAI() {
  try {
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    const prompt = `Generate a challenging educational question for ${subject}. The question should be appropriate for high school or early university level. Format your response as JSON with this structure: {"question": "question text", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "detailed explanation why this is correct", "difficulty": "medium"}

Create an interesting and educational ${subject} question that tests understanding of key concepts.`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            question: { type: "string" },
            options: { 
              type: "array",
              items: { type: "string" }
            },
            correctAnswer: { type: "string" },
            explanation: { type: "string" },
            difficulty: { type: "string" }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        },
      },
      contents: [
        {
          parts: [{ text: prompt }],
          role: "user"
        }
      ],
    });

    const aiResponse = response.text;
    if (aiResponse) {
      const parsedResponse = JSON.parse(aiResponse);
      
      return {
        id: Date.now().toString(),
        subject,
        question: parsedResponse.question,
        options: parsedResponse.options,
        correctAnswer: parsedResponse.correctAnswer,
        explanation: parsedResponse.explanation,
        difficulty: parsedResponse.difficulty || 'medium',
        date: new Date().toISOString().split('T')[0],
        type: 'MCQ'
      };
    }
  } catch (error) {
    console.error('AI daily challenge generation error:', error);
  }

  // Fallback challenge if AI fails
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  
  const fallbackChallenges = {
    Mathematics: {
      question: "What is the derivative of x² + 3x + 2?",
      options: ["2x + 3", "x² + 3", "2x + 2", "x + 3"],
      correctAnswer: "2x + 3",
      explanation: "Using the power rule: d/dx(x²) = 2x, d/dx(3x) = 3, d/dx(2) = 0, so the derivative is 2x + 3."
    },
    Physics: {
      question: "What is the SI unit of electric current?",
      options: ["Volt", "Ampere", "Ohm", "Watt"],
      correctAnswer: "Ampere",
      explanation: "The ampere (A) is the base SI unit for electric current, defined as the flow of one coulomb of charge per second."
    },
    Chemistry: {
      question: "What is the atomic number of carbon?",
      options: ["4", "6", "8", "12"],
      correctAnswer: "6",
      explanation: "Carbon has 6 protons in its nucleus, which defines its atomic number as 6."
    },
    Biology: {
      question: "What organelle is responsible for photosynthesis in plants?",
      options: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
      correctAnswer: "Chloroplast",
      explanation: "Chloroplasts contain chlorophyll and are the organelles where photosynthesis occurs, converting light energy into chemical energy."
    }
  };
  
  const challenge = fallbackChallenges[subject as keyof typeof fallbackChallenges];
  
  return {
    id: Date.now().toString(),
    subject,
    ...challenge,
    difficulty: 'medium',
    date: new Date().toISOString().split('T')[0],
    type: 'MCQ'
  };
}


