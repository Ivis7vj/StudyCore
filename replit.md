# StudyCore - AI Study Companion

## Overview

StudyCore is a comprehensive AI-powered study companion web application that helps students analyze PDF documents and generate interactive learning resources. The application extracts topics from uploaded documents, creates quizzes, finds relevant YouTube videos, and matches educational simulations to enhance the learning experience. Built with a modern tech stack, it features a futuristic dark/light theme interface with sharp, angular design elements and neon accent colors.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React SPA with TypeScript**: Single-page application built with React 18+ and TypeScript for type safety. Uses Wouter for lightweight client-side routing instead of React Router, providing efficient navigation between dashboard, topics, history, and simulation pages.

**Component Design System**: Built on shadcn/ui components with Radix UI primitives for accessibility. Features a custom StudyCore design system with:
- Sharp, angular components (no rounded corners)
- Neon cyan/blue accent colors for dark mode
- Orbitron font for headings, Poppins for body text
- Hover effects with subtle neon glow animations
- Dark/light theme toggle with CSS custom properties

**State Management**: TanStack Query (React Query) handles all server state management, providing automatic caching, background refetching, and optimistic updates. No global client state management library is used, keeping the architecture simple and focused.

**Styling Solution**: Tailwind CSS with custom CSS variables for theme management. Supports dynamic theme switching between rich black (default) and pure white modes. Custom animations include fade-in, slide-in, and pulse-glow effects.

### Backend Architecture

**Express.js REST API**: Node.js backend serving RESTful endpoints with TypeScript throughout. Uses middleware for file upload handling, request logging, and error handling.

**Document Processing Pipeline**: 
- Multer middleware for PDF file uploads with validation (50MB limit, PDF-only)
- PDF text extraction using pdf-parse library
- AI-powered content analysis using Google Gemini API
- Topic extraction with page range identification
- Automatic quiz question generation (MCQ and short answer)
- YouTube video discovery via YouTube Data API
- PhET simulation matching based on keyword analysis

**AI Integration**: Google Gemini AI integration for intelligent content analysis, topic extraction, and question generation. Processes extracted PDF text to identify key learning concepts and create educational resources.

### Data Storage Solutions

**PostgreSQL with Drizzle ORM**: Uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. Configured for Neon Database serverless PostgreSQL with connection pooling.

**Database Schema**:
- `documents` table: PDF metadata, processing status, extracted text
- `topics` table: Extracted topics with summaries, page ranges, real-world examples
- `questions` table: Generated quiz questions with options and explanations
- `youtube_videos` table: Curated video resources linked to topics
- `phet_simulations` table: Educational simulations matched to topics
- `chat_sessions` table: Conversation history for Q&A features
- `user_progress` table: Learning progress tracking

**File Storage**: Local file system storage for uploaded PDFs with automatic cleanup. Uses unique filename generation to prevent conflicts.

### Authentication and Authorization

**Session-Based**: Simple session management without complex authentication flows. Designed for individual study use rather than multi-user scenarios.

## External Dependencies

### AI and Content APIs

**Google Gemini AI**: Primary AI service for content analysis, topic extraction, and question generation. Requires `GEMINI_API_KEY` environment variable.

**YouTube Data API v3**: Integrated for finding relevant educational videos based on extracted topics. Uses API key `AIzaSyAohc04nVSHJctgkJ5L0TTw7E8bkx6yyDU` for video search and metadata retrieval.

### Educational Resources

**PhET Interactive Simulations**: Curated collection of physics, chemistry, math, and biology simulations from University of Colorado Boulder. Matches simulations to topics using keyword analysis.

### Database and Infrastructure

**Neon Database**: Serverless PostgreSQL hosting with connection pooling via `@neondatabase/serverless`. Requires `DATABASE_URL` environment variable.

**Drizzle Kit**: Database schema management and migrations. Configuration points to PostgreSQL dialect with schema in `./shared/schema.ts`.

### Development and Build Tools

**Vite**: Frontend build tool with React plugin, TypeScript support, and hot module replacement. Configured with path aliases and custom runtime error handling.

**ESBuild**: Server-side bundling for production builds. Compiles TypeScript server code to ESM format.

**Replit Integration**: Development environment integration with cartographer plugin and runtime error modal for enhanced debugging experience.